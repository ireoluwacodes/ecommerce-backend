const express = require("express");

const { createProduct, getProduct, getAllProducts } = require("../controllers/productController");

const productRouter = express.Router();

productRouter.route("/").post(createProduct);
productRouter.route("/").get(getAllProducts);
productRouter.route("/:id").get(getProduct);

module.exports = {
    productRouter
}