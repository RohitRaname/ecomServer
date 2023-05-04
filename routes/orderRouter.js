const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  deleteOrderById,
  storeCheckedMark,
} = require("../controllers/orderController");

const { protect, sendTokens } = require("../controllers/jwtController");

router.use(protect, sendTokens(true));


router.route('/').post(createOrder).get(getAllOrders)

// Define routes
router.delete("/:orderId", deleteOrderById);
router.patch("/:id", storeCheckedMark);

module.exports = router;
