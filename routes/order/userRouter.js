const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  cancelOrder,
} = require("../../controllers/order/userController");

const { restrictTo } = require("../../controllers/authController");

router.use(restrictTo("admin", "user"));

router.route("/").get(getOrders).post(createOrder);
// by user
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
