const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getTranscript } = require('./controllers/analyzerController');
const authRouter = require('./routes/authRoutes');
const connectDB = require('./db');
const router = express.Router();
const app = express();

app.use(cors({
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(bodyParser.json());

// Define routes
app.get('/', function(req,res){
    res.send("Hello world")
})

app.post('/transcript', getTranscript);
app.use('/user',authRouter)

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
connectDB();
