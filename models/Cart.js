/* eslint-disable camelcase */
const mongoose = require("mongoose");

// cartId is same as userId
const CartSchema = new mongoose.Schema(
  {
    // user id
    userId: mongoose.Schema.Types.ObjectId,
    page: {type:Number,default:0},
    limit: {type:Number,default:50},

    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        title: String,

        // need to refetch doc for to get new price
        price: Number,


        image: String,
        qty: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ userId: 1 }, { unique: true });

// state , userId
// id , state
// id , state , userId
// id , state , items.id

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
