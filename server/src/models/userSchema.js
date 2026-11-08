const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  history: [{
    url: { type: String, required: true },
    sourceType: { type: String, enum: ["video", "article"], default: "video" },
    language: { type: String, required: true },
    summary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});
const User = new mongoose.model("User", userSchema,"user_details");
module.exports =  User ;