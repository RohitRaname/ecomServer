const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const shopController = require("../controllers/shopController");

router.post("/api/saveData", shopController.saveShop);
router.get("/api/getData", authenticate, shopController.getShops);

module.exports = router;
