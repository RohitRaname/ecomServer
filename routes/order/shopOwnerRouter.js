const express = require("express");
const router = express.Router();
const {
  getOrders,
  updateOrder,
} = require("../../controllers/order/shopOwnerOrderController");

const { restrictTo } = require("../../controllers/authController");

router.use(restrictTo("admin", "shopOwner"));

router.route("/").get(getOrders);
router.patch("/:id/updateState", updateOrder);

module.exports = router;
