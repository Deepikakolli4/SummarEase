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
"http://localhost:3000"
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
app.use('/user',authRouter)

module.exports = app;
