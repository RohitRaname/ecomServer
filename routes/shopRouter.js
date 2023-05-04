const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const shopController = require("../controllers/shopController");

const { restrictTo } = require("../controllers/auth/middleware");
const { protect, sendTokens } = require("../controllers/jwtController");

router.use(protect, sendTokens(true));

router.use(restrictTo(["admin", "shopowner"]));

router.post("/api/saveData", shopController.saveShop);
router.get("/api/getData", authenticate, shopController.getShops);

module.exports = router;
