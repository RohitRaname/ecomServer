const express = require("express");
const Router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  updateMe,
  getMe,
  getProductTable,
  updateMyPassword,
} = require("../controllers/userController");

const { protect, sendTokens } = require("../controllers/jwtController");

Router.use(protect, sendTokens(true));

// Profile route
Router.get("/getMe", getMe);
Router.patch("/updateMe", updateMe);
Router.patch("/updateMyPassword", updateMyPassword);

// Product table route
Router.get("/producttable", getProductTable);

module.exports = Router;
