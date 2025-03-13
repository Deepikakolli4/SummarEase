const jwt = require("jsonwebtoken");

const generateAccessToken = async (user) => {
  const payload = { user_id: user._id };

  const access_token = jwt.sign(payload, "hello", { expiresIn: "14m" });
  return access_token;
};

const generateRefreshToken = async (user) => {
  const payload = { user_id: user._id };

  const access_token = jwt.sign(payload, "refresh", { expiresIn: "7d" });
  return access_token;
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