const Order = require("../models/orderSchema");
const User = require("../models/user");
// Handle POST request to /api/orders
const createOrder = async (req, res) => {
  const { name, email, address, cartItems } = req.body;

  // Create new Order instance with request data
  const newOrder = new Order({
    name,
    email,
    address,
    cartItems,
    date: new Date(),
  });

  try {
    // Save new order to database
    await newOrder.save();
    // Send response indicating success
    res.status(201).json({ message: "Order submitted successfully" });
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
};

// Handle GET request to /api/orders
const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();
    // Send response with orders
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
};

// Handle DELETE request to /api/orders/:orderId
const deleteOrderById = async (req, res) => {
  try {
    // Get the order ID from the request params
    const orderId = req.params.orderId;
    // Delete the order from the database
    const result = await Order.deleteOne({ _id: orderId });
    // Send response indicating success
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
};

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
  createOrder,
  getAllOrders,
  deleteOrderById,
  storeCheckedMark,
};
