const AsyncHandler = require("express-async-handler");
const { Product } = require("../models/productModel");
const { validateDbId } = require("../utils/validateMongoId");

// create new product
const createProduct = AsyncHandler(async (req, res) => {
  try {
    const { title, slug, description, price, quantity } = req.body;
    if (!title || !slug || !description || !price || !quantity)
      throw new Error("Please enter all fields");

    const newProduct = await Product.create(req.body);

    return res.status(200).json({
      status: "success",
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get a product
const getProduct = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);

    const findProduct = await Product.findById(id);
    if (!findProduct) throw new Error("Sorry! product not found");

    return res.status(200).json({
      findProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get all products
const getAllProducts = AsyncHandler(async (req, res) => {
  try {
    const allProducts = await Product.find();
    return res.status(200).json({
      status: "success",
      allProducts,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
};
