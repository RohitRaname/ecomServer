const express = require("express");
const router = express.Router();

// Import forgot controllers
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/forgotController");

// Define routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
