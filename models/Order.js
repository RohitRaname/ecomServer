const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: {
        values: ["initial", "pending", "complete", "cancel"],
      },
      message: "State should be one of initial,pending,complete,cancel",
      default: "initial",
    },

    s_id: mongoose.Types.ObjectId,

    shipping: {
      name: String,
      address: String,
      email: String,
      phone: Number,
    },

    payment: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["COD", "card"],
      },
    },

    summary: {
      shippingFee: mongoose.Types.Decimal128,
      itemsTotal: mongoose.Types.Decimal128,
      orderTotal: mongoose.Types.Decimal128,
    },

    checked: {
      type: Boolean,
      default: false,
    },

    items: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        image: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
