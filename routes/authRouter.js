const express = require("express");
const Router = express.Router();
const {

} = require("../controllers/auth/signupController");

const { sendTokens } = require("../controllers/jwtController");

// Import forgot controllers
const {
  forgotPassword,
  resetPassword,
  signup,
  login,
  logout,
  confirmSignupUser,
} = require("../controllers/authController");

Router.post("/signup", signup,sendTokens(false));
// Router.get("/confirmSignup/:token", confirmSignupUser, sendTokens(false));

Router.post("/login", login, sendTokens(false));

Router.get("/logout", logout);

// Define routes
Router.post("/forgotPassword", forgotPassword);
Router.patch("/resetPassword/:token", resetPassword, sendTokens(false));

module.exports = Router;
