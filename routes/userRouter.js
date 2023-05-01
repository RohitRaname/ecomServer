const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  signup,
  login,
  logout,
  profile,
  checkLoggedIn,
  getProductTable,
} = require("../controllers/userController");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Logout route
router.get("/logout", logout);

// Profile route
router.get("/profile", authenticate, profile);

// Check logged in route
router.get("/checkLoggedIn", authenticate, checkLoggedIn);

// Product table route
router.get("/producttable", authenticate, getProductTable);

module.exports = router;
