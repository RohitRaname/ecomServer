const express = require("express");
const Router = express.Router();
const authenticate = require("../middleware/authenticate");
const { updateMe,getMe, getProductTable } = require("../controllers/userController");

const { protect } = require("../controllers/jwtController");

Router.use(protect);

// Profile route
Router.get("/getMe", getMe);

// Product table route
Router.get("/producttable", getProductTable);

module.exports = Router;
