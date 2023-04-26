const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  cartItems: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Order", orderSchema);
