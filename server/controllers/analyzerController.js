require('dotenv').config();
const { YoutubeTranscript } = require('youtube-transcript');
const API_KEY = process.env.API_KEY;

const getTranscript = async (req, res) => {
    console.log("Received request:", req.body);
    try {
        const { url, lang = "en" } = req.body;

        if (!url) {
            return res.status(400).json({ status: 400, message: "URL is required" });
        }

        console.log("Fetching transcript for:", url);
        const response = await YoutubeTranscript.fetchTranscript(url);

        if (!response || response.length === 0) {
            return res.status(404).json({ status: 404, message: "Transcript not found" });
        }

        const transcriptText = response.map(segment => segment.text).join(" ");

        // Generate summary using Gemini API
        const summarizedText = await summarizeTranscript(transcriptText, lang);

        return res.status(200).json({ data: summarizedText })
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
}

// Summarize transcript using Gemini API
const summarizeTranscript = async (transcriptText, lang) => {
    try {
        if (!transcriptText) {
            throw new Error("Cannot find the transcribed text");
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Summarize the following text in **${lang}**:\n\n${transcriptText}` }]
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

module.exports = { getTranscript, summarizeTranscript };
