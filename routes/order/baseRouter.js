const express = require("express");
const router = express.Router();

const { protect, sendTokens } = require("../../controllers/jwtController");
const shopOwnerOrderRouter = require("./shopOwnerRouter");
const userOrderRouter = require("./userRouter");

router.use(protect, sendTokens(true));

router.use("/shop", shopOwnerOrderRouter);
router.use("/user", userOrderRouter);

module.exports = router;
