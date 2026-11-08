require('dotenv').config();
const { YoutubeTranscript } = require("youtube-transcript");
const UserService = require("../services/userServices");
const { fetchArticle } = require("../services/articleService");
const API_KEY = process.env.API_KEY;

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
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)) {
        if (parsedUrl.pathname === "/watch") {
            videoId = parsedUrl.searchParams.get("v");
        } else {
            videoId = parsedUrl.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/)?.[1];
        }
    }

    return videoIdPattern.test(videoId || "") ? videoId : null;
};

const isYouTubeUrl = (input) => {
    try {
        const hostname = new URL(input).hostname.toLowerCase().replace(/^www\./, "");
        return ["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(hostname);
    } catch {
        return false;
    }
};

const getTranscript = async (req, res) => {
    let analysisStage = "source retrieval";
    try {
        const { url, lang = "en" } = req.body;

        if (typeof url !== "string" || !url.trim()) {
            return res.status(400).json({ status: 400, message: "URL is required" });
        }
        const videoId = extractYouTubeVideoId(url);
        const sourceType = req.body.sourceType || (videoId ? "video" : "article");
        if (!["video", "article"].includes(sourceType)) {
            return res.status(400).json({ error: "Type must be video or article" });
        }
        if (sourceType === "video" && !videoId) {
            return res.status(400).json({ status: 400, message: "Invalid YouTube URL" });
        }
        if (sourceType === "article" && isYouTubeUrl(url)) {
            return res.status(400).json({ error: "Select YouTube video for YouTube links" });
        }

        let sourceText;
        let contentKind;

        if (sourceType === "video") {
            let response;
            try {
                response = await YoutubeTranscript.fetchTranscript(videoId);
            } catch (error) {
                console.error("YouTube transcript retrieval failed:", error.message);
                return res.status(502).json({ error: "Could not retrieve captions for this video. Check that captions are available and try again." });
            }
            if (!response || response.length === 0) {
                return res.status(404).json({ status: 404, message: "Transcript not found" });
            }
            sourceText = response.map((segment) => segment.text).join(" ");
            contentKind = "YouTube video";
        } else {
            const article = await fetchArticle(url);
            sourceText = article.text;
            contentKind = "article";
        }

        analysisStage = "Gemini summarization";
        const summarizedText = await summarizeTranscript(sourceText, lang, contentKind);

        if (!summarizedText || summarizedText === "Summary generation failed.") {
            return res.status(502).json({ error: "Gemini returned an empty summary. Check model availability and request limits." });
        }

        analysisStage = "history save";
        let user;
        try {
            user = await UserService.addUserHistory(req.userId, {
                url,
                sourceType,
                language: lang,
                summary: summarizedText,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("History save failed:", error);
            return res.status(500).json({ error: "Summary created, but could not save it to your history." });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ data: summarizedText })
    } catch (error) {
        console.error(`Analyze failed during ${analysisStage}:`, error);
        const statusCode = error.statusCode || 500;
        const message = error.publicMessage || (error.statusCode ? error.message : `${analysisStage} failed. Check the server logs for details.`);
        return res.status(statusCode).json({ error: message });
    }
}

const summarizeTranscript = async (sourceText, lang, sourceType = "content") => {
    try {
        if (!sourceText) {
            throw new Error("Cannot find source text");
        }
        if (!API_KEY) {
            throw Object.assign(new Error("Gemini API key is not configured on the server."), { statusCode: 503 });
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("Gemini API error response:", response.status, data);
            throw Object.assign(
                new Error(data?.error?.message || `Gemini API returned HTTP ${response.status}`),
                { statusCode: 502, publicMessage: `Gemini rejected the request (HTTP ${response.status}). Check the deployed model access, API quota, and Render environment.` }
            );
        }

        if (!data || !data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error:", data);
            throw Object.assign(
                new Error("Gemini returned no candidates"),
                { statusCode: 502, publicMessage: "Gemini returned no summary. Check model availability, content restrictions, and API quota." }
            );
        }

        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        console.error("Error summarizing transcript:", error.message);
        if (error.statusCode) throw error;
        throw Object.assign(
            new Error(error.message),
            { statusCode: 502, publicMessage: "Could not connect to Gemini. Check the Render server network and API availability." }
        );
    }
};

module.exports = { getTranscript, summarizeTranscript, extractYouTubeVideoId };
