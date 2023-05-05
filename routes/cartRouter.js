const express = require("express");
const Router = express.Router();
const {
  addItemToCart,
  removeItemFromCart,
  updateItemQtyInCart,
  getCartSummary,
  removeAllCartItems,
  getCartItems,
} = require("../controllers/cartController");


const { restrictTo } = require("../controllers/authController");
const { protect, sendTokens } = require("../controllers/jwtController");

Router.use(protect, sendTokens(true), restrictTo("admin", "user"));

Router.get("/summary", getCartSummary);

Router.route("/").post(addItemToCart).get(getCartItems);

Router.delete("/all-items", removeAllCartItems);
Router.route("/:id").delete(removeItemFromCart).patch(updateItemQtyInCart);



module.exports = Router;
