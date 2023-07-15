const express = require("express");

const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating } = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const productRouter = express.Router();

productRouter.route("/").post(authMiddleware, isAdmin, createProduct);
productRouter.route("/:id").put(authMiddleware, isAdmin, updateProduct);
productRouter.route("/:id").delete(authMiddleware, isAdmin, deleteProduct);
productRouter.route("/").get(getAllProducts);
productRouter.route("/:id").get(getProduct);
productRouter.route("/wish/:id").put(authMiddleware, addToWishlist);
productRouter.route("/rate/:id").put(authMiddleware, rating);

module.exports = {
    productRouter
}
