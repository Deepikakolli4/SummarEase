const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.DB_URL;

const connectDB = async () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("connected");
    })
    .catch((e) => {
      console.log("error in connecting the DB" + e);
    });
};

module.exports = connectDB;