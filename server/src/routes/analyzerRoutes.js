const express = require('express');
const router = express.Router();
const userController = require('../controllers/analyzerController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/', (_req, res) => {
	res.set('Allow', 'POST, OPTIONS');
	return res.status(405).json({
		error: 'Method not allowed',
		message: 'Submit a POST request from the SummarEase web app to analyze a URL.',
	});
});

router.post('/', requireAuth, userController.getTranscript);
module.exports = router;