const express = require("express");
const router = express.Router();

const userController = require("../controllers/authController");

router.post("/", userController.createUser);
router.get("/", userController.getUser);
router.post("/login", userController.loginUser);
router.post("/forgotpassword", userController.forgotPassword);
router.post("/verify-code", userController.verifyCode);
router.get("/userdetails",userController.userDetails);
module.exports = router;