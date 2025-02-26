


const express = require('express');
const router = express();
const userController = require('../controllers/authController');

router.get('/transcript', userController.getTranscript);
module.exports = router;