const { verifyAccessToken } = require("../utils/util");

const requireAuth = (req, res, next) => {
  const authorization = req.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload.user_id) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    req.userId = payload.user_id;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

module.exports = requireAuth;