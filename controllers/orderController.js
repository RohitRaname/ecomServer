const Order = require("../models/Order");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const send = require("../utils/sendJSON");

const createOrder = catchAsync(async (req, res) => {
  const { state, shipping, payment, summary, items } = req.body;

  const newOrder = new Order({
    state,
    shipping,
    payment,
    summary,
    items,
  });

  await newOrder.save();
  send(res, 200, "order successfully");
});

////////////////////////////////////////////////////////
// USERS OR ADMIN ONLY (NOT SHOPOWNERS)
///////////////////////////////////////////////////////
const getMyOrders = catchAsync(async (req, res) => {
  const { query } = req;
  const result = new ApiFeatures(Order.find({}), query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const docs = await result.query;

  send(res, 200, "my orders", docs);
});

const cancelMyOrder = catchAsync(async (req, res) => {
  const { id: orderId } = req.params;
  await Order.findOneAndUpdate({ _id: orderId }, { $set: { state: "cancel" } });
  send(res, 200, "order cancelled");
});

////////////////////////////////////////////////////////
// SHOP OWNERS OR ADMIN ONLY
///////////////////////////////////////////////////////

/// state
const updateOrderState = catchAsync(async (req, res) => {
  const { id: orderId } = req.params;
  const { state } = req.body;

  await Order.findOneAndUpdate(
    { _id: orderId },
    { $set: { state } },
    { runValidators: true }
  );
  send(res, 200, "order updated successfully");
});

//store the checked mark
const storeCheckedMark = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== "nexo91@gmail.com") {
      return res.status(401).send("Unauthorized access");
    }
    const orderId = req.params.id;
    const checked = req.body.checked;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.checked = checked;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  // user
  createOrder,
  getMyOrders,
  cancelMyOrder,

  // shopowner
  updateOrderState,
};
