const express = require("express");
const router = express.Router();

const userController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/", userController.createUser);
router.get("/", userController.getUser);
router.post("/login", userController.loginUser);
router.post("/refresh", userController.refreshUserTokens);
router.post("/forgotpassword", userController.forgotPassword);
router.post("/verify-code", userController.verifyCode);
router.post("/userdetails", userController.userDetails);
router.get("/history", requireAuth, userController.getCurrentUserHistory);
router.delete("/history/:historyId", requireAuth, userController.deleteHistoryEntry);

module.exports = router;