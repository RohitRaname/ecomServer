const express = require("express");
const router = express.Router();
const {
  createOrder,

  getMyOrders,
  updateOrderState,
  cancelMyOrder,
} = require("../controllers/orderController");

const { protect, sendTokens } = require("../controllers/jwtController");
const { restrictTo } = require("../controllers/authController");

router.use(protect, sendTokens(true));

router
  .route("/")
  .get(restrictTo("admin", "user"), getMyOrders)
  .post(restrictTo("admin", "user"), createOrder);

// by user
router.patch("/:id/cancel", restrictTo("admin", "user"), cancelMyOrder);

router.use(restrictTo("admin", "showOwner"));

router.patch("/:id/updateState", updateOrderState);

module.exports = router;
