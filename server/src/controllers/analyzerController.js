const analyzerService = require("../services/analyzerService");
const UserService = require("../services/userServices");

const analyzeUrl = async (req, res) => {
    let analysisStage = "source retrieval";

    try {
        const { url, lang = "en" } = req.body;

        if (typeof url !== "string" || !url.trim()) {
            return res.status(400).json({
                status: 400,
                message: "URL is required",
            });
        }

        const videoId = analyzerService.extractYouTubeVideoId(url);
        const sourceType = req.body.sourceType || (videoId ? "video" : "article");

        if (!["video", "article"].includes(sourceType)) {
            return res.status(400).json({
                error: "Type must be video or article",
            });
        }

        if (sourceType === "video" && !videoId) {
            return res.status(400).json({
                status: 400,
                message: "Invalid YouTube URL",
            });
        }

        if (sourceType === "article" && analyzerService.isYouTubeUrl(url)) {
            return res.status(400).json({
                error: "Select YouTube video for YouTube links",
            });
        }

        const { summarizedText } = await analyzerService.analyzeContent({
            url,
            videoId,
            sourceType,
            lang,
            onStageChange: (stage) => {
                analysisStage = stage;
            },
        });

        if (
            !summarizedText ||
            summarizedText === "Summary generation failed."
        ) {
            return res.status(502).json({
                error:
                    "Gemini returned an empty summary. Check model availability and request limits.",
            });
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

            return res.status(500).json({
                error:
                    "Summary created, but could not save it to your history.",
            });
        }

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        return res.status(200).json({
            data: summarizedText,
        });
    } catch (error) {
        console.error(`Analyze failed during ${analysisStage}:`, error);

        const statusCode = error.statusCode || 500;

        const message =
            error.publicMessage ||
            (error.statusCode
                ? error.message
                : `${analysisStage} failed. Check the server logs for details.`);

        return res.status(statusCode).json({
            error: message,
        });
    }
};

module.exports = {
    analyzeUrl,
    summarizeTranscript: analyzerService.summarizeTranscript,
    extractYouTubeVideoId: analyzerService.extractYouTubeVideoId,
};
