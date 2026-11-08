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
            const response = await YoutubeTranscript.fetchTranscript(videoId);
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

        const summarizedText = await summarizeTranscript(sourceText, lang, contentKind);

        if (!summarizedText || summarizedText === "Summary generation failed.") {
            return res.status(502).json({ error: "Failed to generate summary" });
        }

        const user = await UserService.addUserHistory(req.userId, {
            url,
            sourceType,
            language: lang,
            summary: summarizedText,
            createdAt: new Date(),
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ data: summarizedText })
    } catch (error) {
        console.error('Error generating summary:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.statusCode ? error.message : 'Failed to generate summary' });
    }
}

const summarizeTranscript = async (sourceText, lang, sourceType = "content") => {
    try {
        if (!sourceText) {
            throw new Error("Cannot find source text");
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

        const data = await response.json();

        if (!data || !data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error:", data);
            throw new Error("Failed to generate summary");
        }

        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        console.error("Error summarizing transcript:", error.message);
        return "Summary generation failed.";
    }
};

module.exports = { getTranscript, summarizeTranscript, extractYouTubeVideoId };
