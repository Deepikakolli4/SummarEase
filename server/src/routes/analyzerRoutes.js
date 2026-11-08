const express = require('express');
const router = express.Router();
const userController = require('../controllers/analyzerController');
const requireAuth = require('../middleware/authMiddleware');

router.post('/', requireAuth, userController.getTranscript);
module.exports = router;