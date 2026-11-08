const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "hello";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh";

const generateAccessToken = async (user) => {
  const payload = { user_id: user._id };

  const access_token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "14m" });
  return access_token;
};

const generateRefreshToken = async (user) => {
  const payload = { user_id: user._id };

  const refresh_token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  return refresh_token;
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};