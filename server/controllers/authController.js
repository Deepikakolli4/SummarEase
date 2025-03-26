const UserService = require("../services/userServices");
const passwordService = require("../services/passwordService");
const jwt = require("jsonwebtoken");
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await UserService.createUser(username, email, password);
    if (user) {
      return res
        .status(201)
        .json({ status: 201, message: "Successfully Created User" });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "User already exists" });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await UserService.getUsers(email);
    return res.status(200).json({ status: 200, data: users || [] });
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.userLogin(email, password);
    if (user) {
      return res.status(200).json({
        status: 200,
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        username: user.username,
        message: "User successfully logged in",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await passwordService.sendVerificationCode(email);
    res.json(response);
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    console.log("Received email:", email);
    console.log("Received code:", code);

    const response = await passwordService.verifyUserCode(email, code);

    if (!response) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (newPassword) {
      await passwordService.updatePassword(email, newPassword);
      return res.json({ success: true, message: "Password updated successfully" });
    }

    res.json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error("Code Verification Error:", error);
    res.status(400).json({ message: error.message || "Verification failed" });
  }
};

const userDetails = async (req, res) => {
  try {
    console.log("Received request for user details:", req.body); // Log request

    const { username } = req.body; // Make sure username is sent in body, not query

    if (!username) {
      return res.status(400).json({ status: 400, message: "Username is required" });
    }

    const user = await UserService.getUserByUsername(username); 
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const history = await UserService.getUserHistory(username); 

    return res.status(200).json({
      status: 200,
      user: {
        username: user.username,
        email: user.email,
      },
      history: history || [],
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};

module.exports = { createUser, getUser, loginUser, forgotPassword, verifyCode, userDetails };
