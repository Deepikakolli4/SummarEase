const UserService = require("../services/userServices");
const passwordService = require("../services/passwordService");
const authUtils = require("../utils/util");
const mongoose = require("mongoose");
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

const refreshUserTokens = async (req, res) => {
  const { refresh_token: refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const payload = authUtils.verifyRefreshToken(refreshToken);
    const user = await UserService.getUserById(payload.user_id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const [access_token, refresh_token] = await Promise.all([
      authUtils.generateAccessToken(user),
      authUtils.generateRefreshToken(user),
    ]);

    return res.status(200).json({ access_token, refresh_token, username: user.username });
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
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

    console.log("Fetched user details:", { user, history });

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

const getCurrentUserHistory = async (req, res) => {
  try {
    const { from: fromValue, to: toValue, language = "", type = "" } = req.query;
    const page = Number.parseInt(req.query.page || "1", 10);
    const limit = Number.parseInt(req.query.limit || "10", 10);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({ message: "Page and limit must be positive integers" });
    }

    const parseDate = (value, endOfDay) => {
      if (!value) return null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
      const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
      return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date;
    };

    const from = parseDate(fromValue, false);
    const to = parseDate(toValue, true);
    if ((fromValue && !from) || (toValue && !to)) {
      return res.status(400).json({ message: "Dates must use YYYY-MM-DD format" });
    }
    if (from && to && from > to) {
      return res.status(400).json({ message: "Start date must be on or before end date" });
    }
    if (type && !["video", "article"].includes(type)) {
      return res.status(400).json({ message: "Type must be video or article" });
    }

    const { items, total } = await UserService.getPaginatedUserHistory(req.userId, {
      from,
      to,
      language: language.trim(),
      type,
      page,
      limit: Math.min(limit, 50),
    });

    return res.status(200).json({
      data: items,
      pagination: {
        page,
        limit: Math.min(limit, 50),
        total,
        totalPages: Math.ceil(total / Math.min(limit, 50)),
      },
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    return res.status(500).json({ message: "Failed to fetch history" });
  }
};

const deleteHistoryEntry = async (req, res) => {
  const { historyId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(historyId)) {
    return res.status(400).json({ message: "Invalid history entry ID" });
  }

  try {
    const user = await UserService.deleteUserHistoryEntry(req.userId, historyId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting history entry:", error);
    return res.status(500).json({ message: "Failed to delete history entry" });
  }
};

module.exports = {
  createUser,
  getUser,
  loginUser,
  refreshUserTokens,
  forgotPassword,
  verifyCode,
  userDetails,
  getCurrentUserHistory,
  deleteHistoryEntry,
};
