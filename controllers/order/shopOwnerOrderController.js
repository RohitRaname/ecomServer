const Order = require("../../models/Order");
const User = require("../../models/User");
const catchAsync = require("../../utils/catchAsync");
const ApiFeatures = require("../../utils/apiFeatures");
const send = require("../../utils/sendJSON");
const AppError = require("../../utils/AppError");

////////////////////////////////////////////////////////
// USERS OR ADMIN ONLY (NOT SHOPOWNERS)
///////////////////////////////////////////////////////
const getOrders = catchAsync(async (req, res) => {
  const { query } = req;
  const { _id: userId } = req.user;
  const result = new ApiFeatures(Order.find({ s_id: userId }), query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const docs = await result.query;

  send(res, 200, "my orders", docs);
});

/// state
const updateOrder = catchAsync(async (req, res,next) => {
  const { id: orderId } = req.params;
  const { state } = req.body;

  const shopOwnerId = req.user._id;

  const result= await Order.findOneAndUpdate(
    { _id: orderId, s_id: shopOwnerId },
    { $set: { state } },
    { runValidators: true }
  );

  if(!result) return next(new AppError('this is not your product (shopowner)'))

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
  getOrders,
  updateOrder,
};
