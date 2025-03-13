const express = require("express");
const router = express.Router();

const userController = require("../controllers/authController");

router.post("/", userController.createUser);
router.get("/", userController.getUser);
router.post("/login", userController.loginUser);

module.exports = router;