const express = require("express");

const {uploadPhoto, prodImageResize} = require("../middlewares/uploadImage")
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating, uploadImage } = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const productRouter = express.Router();

productRouter.route("/").post(authMiddleware, isAdmin, createProduct);
productRouter.route("/:id").put(authMiddleware, isAdmin, updateProduct);
productRouter.route("/:id").delete(authMiddleware, isAdmin, deleteProduct);
productRouter.route("/").get(getAllProducts);
productRouter.route("/:id").get(getProduct);
productRouter.route("/wish/:id").put(authMiddleware, addToWishlist);
productRouter.route("/rate/:id").put(authMiddleware, rating);
productRouter.route("/upload/:id").put(authMiddleware, isAdmin, uploadPhoto.array("images", 10), prodImageResize, uploadImage);

module.exports = {
    productRouter
}
