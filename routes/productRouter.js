const express = require("express");
const Router = express.Router();
const productController = require("../controllers/productsController");
const { restrictTo } = require("../controllers/authController");
const { protect, sendTokens } = require("../controllers/jwtController");

Router.get("/search", productController.searchProducts);
Router.get("/", productController.getProducts);
Router.get("/:id", productController.apiGetProduct);

Router.use(protect, sendTokens(true), restrictTo("admin", "shopowner"));

Router.route("/:id")
  .delete(
    productController.checkValidShopOwnerOfProduct,
    productController.apiDeleteProduct
  )
  .patch(
    productController.checkValidShopOwnerOfProduct,
    productController.apiUpdateProduct
  );

module.exports = Router;
