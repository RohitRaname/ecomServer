const Order = require("../../models/Order");
const User = require("../../models/User");
const catchAsync = require("../../utils/catchAsync");
const ApiFeatures = require("../../utils/apiFeatures");
const send = require("../../utils/sendJSON");

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
const getOrders = catchAsync(async (req, res) => {
  const { query } = req;
  const { email } = req.user;
  const result = new ApiFeatures(Order.find({ "shipping.email": email }), query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const docs = await result.query;

  send(res, 200, "my orders", docs);
});

const cancelOrder = catchAsync(async (req, res) => {
  const { id: orderId } = req.params;
  await Order.findOneAndUpdate({ _id: orderId }, { $set: { state: "cancel" } });
  send(res, 200, "order cancelled");
});

module.exports = {
  // user
  createOrder,
  getOrders,
  cancelOrder
};
