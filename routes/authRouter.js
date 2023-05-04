const express = require("express");
const Router = express.Router();
const {
  signup,
  login,
  logout,
} = require("../controllers/auth/signupController");

const { sendTokens } = require("../controllers/jwtController");

// Import forgot controllers
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/auth/forgotController");

// Signup route
Router.post("/signup", signup, sendTokens(false));

// Login route
Router.post("/login", login, sendTokens(false));

// Logout route
Router.get("/logout", logout);

// Define routes
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password/:token", resetPassword, sendTokens);

module.exports = Router;
