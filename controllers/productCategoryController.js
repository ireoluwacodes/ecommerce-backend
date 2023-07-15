const { ProdCategory } = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
const { validateDbId } = require("../utils/validateMongoId");

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  try {
    if (!title) throw new Error("Enter all fields");
    const newCategory = await ProdCategory.create({
      title,
    });
    return res.status(200).json({
      starus: "success",
      message: `category ${newCategory.title} created successfully`,
      newCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update a category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    if (!title) throw new Error("Enter all fields");
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);

    const updatedCategory = await ProdCategory.findByIdAndUpdate(
      id,
      {
        title,
      },
      {
        new: true,
      }
    );
    if (!updatedCategory) throw new Error("Category not Found");

    return res.status(200).json({
      starus: "success",
      message: `category ${updatedCategory.title} updated successfully`,
      updatedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete A Category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);
    const deletedCategory = await ProdCategory.findByIdAndDelete(id);

    if (!deletedCategory) throw new Error("Category not Found");

    return res.status(200).json({
      starus: "success",
      message: `category ${deletedCategory.title} updated successfully`,
      deletedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get Category
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);

    const getCategory = await ProdCategory.findById(id);
    if (!getCategory) throw new Error("Category not Found");

    return res.status(200).json({
      starus: "success",
      getCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get All Product Categories
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const AllProdCategories = await ProdCategory.find();

    if (!AllProdCategories) throw new Error("Please create a category first");

    return res.status(200).json({
      starus: "success",
      AllProdCategories,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
