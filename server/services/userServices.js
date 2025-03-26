const User = require("../schema/userSchema");
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

module.exports = { getUsers, createUser, userLogin, getUserByUsername, getUserHistory };
