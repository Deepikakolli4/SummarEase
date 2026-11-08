const User = require("../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const utils = require("../utils/util");

// Get All Users
const getUsers = async (username, email, password) => {
  try {
    const users = await User.find();
    console.log(users, "helloo");
    return users;
  } catch (error) {
    throw Error("Error in Fetching Users");
  }
};

// Create a New User
const createUser = async (username, email, password) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Error("User already exists");
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: encryptedPassword });
    await newUser.save();
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

// User Login
const userLogin = async (email, password) => {
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new Error("User does not exist");
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid password");
    }

    const access_token = await utils.generateAccessToken(existingUser);
    const refresh_token = await utils.generateRefreshToken(existingUser);

    return { 
      access_token, 
      refresh_token, 
      username: existingUser.username,  
      email: existingUser.email 
    };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw new Error("Login failed. Please check your credentials.");
  }
};

const getUserByUsername = async (username) => {
  try {
    console.log("Fetching user:", username);
    const user = await User.findOne({ username }).select("username email");
    if (!user) throw new Error("User not found");
    console.log("Fetched user:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }
};

const getUserById = async (userId) => {
  return User.findById(userId).select("_id username email");
};

const getUserHistory = async (username) => {
  try {
    console.log("Fetching user history for:", username);
    const user = await User.findOne({ username }).select("history");
    console.log("Fetched user history:", user?.history);
    return user?.history || [];
  } catch (error) {
    console.error("Error fetching user history:", error.message);
    throw error;
  }
};

const getUserHistoryById = async (userId) => {
  return User.findById(userId).select("history").lean();
};

const getPaginatedUserHistory = async (userId, { from, to, language, type, page, limit }) => {
  const historyMatch = {};
  if (from || to) {
    historyMatch["history.createdAt"] = {};
    if (from) historyMatch["history.createdAt"].$gte = from;
    if (to) historyMatch["history.createdAt"].$lte = to;
  }
  if (language) {
    historyMatch.$expr = {
      $eq: [{ $toLower: "$history.language" }, language.toLowerCase()],
    };
  }
  if (type) {
    historyMatch["history.sourceType"] = type;
  }

  const results = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    { $unwind: "$history" },
    ...(Object.keys(historyMatch).length ? [{ $match: historyMatch }] : []),
    {
      $facet: {
        items: [
          { $sort: { "history.createdAt": -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $replaceRoot: { newRoot: "$history" } },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const result = results[0] || {};
  return {
    items: result.items || [],
    total: result.count?.[0]?.total || 0,
  };
};

const addUserHistory = async (userId, entry) => {
  return User.findByIdAndUpdate(
    userId,
    { $push: { history: { $each: [entry], $position: 0, $slice: 20 } } },
    { new: true }
  ).select("_id");
};

const deleteUserHistoryEntry = async (userId, historyId) => {
  return User.findOneAndUpdate(
    {
      _id: userId,
      "history._id": historyId,
    },
    {
      $pull: {
        history: {
          _id: new mongoose.Types.ObjectId(historyId),
        },
      },
    },
    {
      new: true,
    }
  ).select("_id");
};

module.exports = {
  getUsers,
  createUser,
  userLogin,
  getUserByUsername,
  getUserById,
  getUserHistory,
  getUserHistoryById,
  getPaginatedUserHistory,
  addUserHistory,
  deleteUserHistoryEntry,
};
