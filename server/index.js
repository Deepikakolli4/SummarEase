const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getTranscript } = require('./controllers/analyzerController.js ');

const app = express();

app.use(cors({
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));


app.use(bodyParser.json());

// Define routes
app.post('/hello', (req, res) => {
    res.send('hello');
});

app.post('/transcript', getTranscript);

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
