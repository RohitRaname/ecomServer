const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  createOrder,
  getAllOrders,
  deleteOrderById,
  storeCheckedMark,
} = require("../controllers/orderController");

// Define routes
router.post("/", authenticate, createOrder);
router.get("/", getAllOrders);
router.delete("/:orderId", deleteOrderById);
router.patch("/:id", authenticate, storeCheckedMark);

module.exports = router;
