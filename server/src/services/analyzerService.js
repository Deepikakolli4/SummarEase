require("dotenv").config();

const { fetchArticle } = require("./articleService");

const API_KEY = process.env.API_KEY;
const FREETRANSCRIPT_API_KEY = process.env.FREETRANSCRIPT_API_KEY;

const extractYouTubeVideoId = (input) => {
    const value = input.trim();
    const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

    if (videoIdPattern.test(value)) {
        return value;
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(value);
    } catch {
        return null;
    }

    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
    let videoId;

    if (hostname === "youtu.be") {
        videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
    } else if (
        ["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)
    ) {
        if (parsedUrl.pathname === "/watch") {
            videoId = parsedUrl.searchParams.get("v");
        } else {
            videoId = parsedUrl.pathname.match(
                /^\/(?:shorts|embed|live|v)\/([^/]+)/
            )?.[1];
        }
    }

    return videoIdPattern.test(videoId || "") ? videoId : null;
};

const isYouTubeUrl = (input) => {
    try {
        const hostname = new URL(input).hostname.toLowerCase().replace(/^www\./, "");

        return [
            "youtube.com",
            "m.youtube.com",
            "music.youtube.com",
            "youtu.be",
        ].includes(hostname);
    } catch {
        return false;
    }
};

// Fetch transcript using FreeTranscriptAPI
const fetchYouTubeTranscript = async (videoId, lang = "en") => {
    if (!FREETRANSCRIPT_API_KEY) {
        throw Object.assign(
            new Error("FreeTranscriptAPI key is not configured."),
            {
                statusCode: 503,
                publicMessage: "Transcript service is not configured on the server.",
            }
        );
    }

    const params = new URLSearchParams({
        video_url: videoId,
        lang,
    });

    const response = await fetch(
        `https://api.freetranscriptapi.com/v1/transcript?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${FREETRANSCRIPT_API_KEY}`,
                Accept: "application/json",
            },
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        console.error("FreeTranscriptAPI error:", response.status, data);

        if (response.status === 404) {
            throw Object.assign(
                new Error("Transcript not found for this video."),
                {
                    statusCode: 404,
                    publicMessage:
                        "No captions are available for this video in the requested language.",
                }
            );
        }

        if (response.status === 402) {
            throw Object.assign(
                new Error("FreeTranscriptAPI credits exhausted."),
                {
                    statusCode: 503,
                    publicMessage:
                        "Transcript service quota exhausted. Please try again later.",
                }
            );
        }

        if (response.status === 429) {
            throw Object.assign(
                new Error("FreeTranscriptAPI rate limit exceeded."),
                {
                    statusCode: 429,
                    publicMessage:
                        "Transcript service is temporarily rate-limited. Please try again later.",
                }
            );
        }

        throw Object.assign(
            new Error(
                data?.error?.message ||
                    `FreeTranscriptAPI returned HTTP ${response.status}`
            ),
            {
                statusCode: 502,
                publicMessage:
                    "Unable to retrieve the transcript from the transcript service.",
            }
        );
    }

    if (!Array.isArray(data?.transcript) || data.transcript.length === 0) {
        throw Object.assign(
            new Error("FreeTranscriptAPI returned an empty transcript."),
            {
                statusCode: 404,
                publicMessage: "No captions were found for this video.",
            }
        );
    }

    return data.transcript.map((segment) => segment.text).join(" ");
};

// Summarize source text with Google Gemini
const summarizeTranscript = async (
    sourceText,
    lang,
    sourceType = "content"
) => {
    try {
        if (!sourceText) {
            throw new Error("Cannot find source text");
        }

        if (!API_KEY) {
            throw Object.assign(
                new Error("Gemini API key is not configured on the server."),
                { statusCode: 503 }
            );
        }

        const prompt = [
            `Summarize the following ${sourceType} in ${lang}.`,
            "Return only a concise Markdown bullet list with 5-8 key points, or fewer if the transcript is short.",
            "Capture the main idea, important facts or arguments, and meaningful conclusions.",
            "Use clear, self-contained bullets. Do not add a title, introduction, or closing paragraph.",
            "Use only information supported by the transcript; do not guess or add outside facts.",
            "",
            "Transcript:",
            sourceText,
        ].join("\n");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                "Gemini API error response:",
                response.status,
                data
            );

            throw Object.assign(
                new Error(
                    data?.error?.message ||
                        `Gemini API returned HTTP ${response.status}`
                ),
                {
                    statusCode: 502,
                    publicMessage: `Gemini rejected the request (HTTP ${response.status}). Check model access, API quota, and Render environment.`,
                }
            );
        }

        if (!data?.candidates?.length) {
            console.error("Gemini API Error:", data);

            throw Object.assign(
                new Error("Gemini returned no candidates"),
                {
                    statusCode: 502,
                    publicMessage:
                        "Gemini returned no summary. Check model availability, content restrictions, and API quota.",
                }
            );
        }

        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error("Error summarizing transcript:", error.message);

        if (error.statusCode) {
            throw error;
        }

        throw Object.assign(new Error(error.message), {
            statusCode: 502,
            publicMessage:
                "Could not connect to Gemini. Check the Render server network and API availability.",
        });
    }
};

// Core orchestration function
const analyzeContent = async ({
    url,
    videoId,
    sourceType,
    lang = "en",
    onStageChange,
}) => {
    let sourceText;
    let contentKind;

    if (sourceType === "video") {
        try {
            sourceText = await fetchYouTubeTranscript(videoId, lang);
        } catch (error) {
            console.error(
                "YouTube transcript retrieval failed:",
                error.message
            );

            throw Object.assign(error, {
                statusCode: error.statusCode || 502,
                publicMessage:
                    error.publicMessage ||
                    "Could not retrieve captions for this video.",
            });
        }

        contentKind = "YouTube video";
    } else {
        const article = await fetchArticle(url);
        sourceText = article.text;
        contentKind = "article";
    }

    if (onStageChange) {
        onStageChange("Gemini summarization");
    }

    const summarizedText = await summarizeTranscript(
        sourceText,
        lang,
        contentKind
    );

    return {
        summarizedText,
        sourceType,
        contentKind,
    };
};

module.exports = {
    extractYouTubeVideoId,
    isYouTubeUrl,
    fetchYouTubeTranscript,
    summarizeTranscript,
    analyzeContent,
};
