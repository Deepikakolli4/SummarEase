const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require("youtube-transcript");

const bodyParser = require('body-parser');
const analyzerRouter = require('./routes/analyzerRoutes');
const authRouter = require('./routes/authRoutes');
const app = express();

app.use(cors({
origin: [
"https://summar-ease-11.vercel.app",
"http://localhost:5173"
],
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
credentials: true
}));


app.use(bodyParser.json());

// Define routes
app.get('/', function(req,res){
    res.send("Hello world")
})

app.use('/transcript', analyzerRouter);
app.post('/test-transcript', async (req, res) => {
    const { url } = req.body;

    console.log("🔍 Testing transcript for URL:", url);

    try {
        const response = await YoutubeTranscript.fetchTranscript(url)
            .then(r => {
                console.log("✅ TRANSCRIPT SUCCESS:", r);
                return r;
            })
            .catch(err => {
                console.log("❌ TRANSCRIPT ERROR:", err);
                return [];
            });

        return res.json({ transcript: response });

    } catch (err) {
        console.log("💥 TEST ROUTE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});
app.use('/user',authRouter)

module.exports = app;
