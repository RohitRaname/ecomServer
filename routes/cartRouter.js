const express = require("express");
const Router = express.Router();
const {
  addItemToCart,
  removeItemFromCart,
  updateItemQtyInCart,
  getCartSummary,
  clearCart,
  getCartItems,
} = require("../controllers/cartController");


const { restrictTo } = require("../controllers/authController");
const { protect, sendTokens } = require("../controllers/jwtController");

Router.use(protect, sendTokens(true), restrictTo("admin", "user"));

Router.get("/summary", getCartSummary);

Router.route("/items").post(addItemToCart).get(getCartItems);

Router.delete("/clear", clearCart);
Router.route("/items/:id").delete(removeItemFromCart).patch(updateItemQtyInCart);



module.exports = Router;
