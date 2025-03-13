const UserService = require("../services/userServices");

const createUser = async (req, res) => {
  try {
    const { username , email, password } = req.body;
    user = UserService.createUser( username,email, password);
    if (user) {
      return res
        .status(200)
        .json({ status: 201, message: "Succesfully Created User" });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "user alreeady exits" });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};
const getUser = async (req, res) => {
  try {
    const { email } = req.body;
    users = await UserService.getUsers(email);
    if (users.length === 0) {
      return res.status(200).json({ status: 200, data: [] });
    } else {
      return res.status(200).json({ status: 200, data: users });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.userLogin(email, password);
    console.log(user);
    if (user) {
      return res.status(200).json({
        status: 200,
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        username : user.username,
        message: "user successfully logged in",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

module.exports = { createUser, getUser, loginUser };