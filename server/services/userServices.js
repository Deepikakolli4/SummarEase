const User = require("../schema/userSchema");
const bcrypt = require("bcrypt");
const utils = require("../utils/util");
const nodemailer = require("nodemailer");

let verificationCodes = {}; 

const getUsers = async (username, email, password) => {
  try {
    const users = await User.find();
    console.log(users, "helloo");
    return users;
  } catch (error) {
    throw Error("Error in Fetching Users");
  }
};

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

// Forgot Password - Send Verification Code
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    verificationCodes[email] = code;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Password Reset Code",
      text: `Your verification code is: ${code}`,
    });

    res.json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify Code
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (verificationCodes[email] && verificationCodes[email] == code) {
      delete verificationCodes[email]; // Remove code after verification
      res.json({ success: true, message: "Code verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Code Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getUsers, createUser, userLogin, forgotPassword, verifyCode };
