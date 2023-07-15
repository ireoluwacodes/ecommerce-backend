const { Brand } = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const { validateDbId } = require("../utils/validateMongoId");

// create a  brand
const createBrand = asyncHandler(async (req, res) => {
  const { title } = req.body;
  try {
    if (!title) throw new Error("Enter all fields");
    const newBrand = await Brand.create({
      title,
    });
    return res.status(200).json({
      starus: "success",
      message: `brand ${newBrand.title} created successfully`,
      newBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update a brand
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    if (!title) throw new Error("Enter all fields");
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      {
        title,
      },
      {
        new: true,
      }
    );
    if (!updatedBrand) throw new Error("Brand not Found");

    return res.status(200).json({
      starus: "success",
      message: `Brand ${updatedBrand.title} updated successfully`,
      updatedBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a Brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);
    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) throw new Error("Brand not Found");

    return res.status(200).json({
      starus: "success",
      message: `brand ${deletedBrand.title} deleted successfully`,
      deletedBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get Brand
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) throw new Error("Invalid Parameters");
    await validateDbId(id);

    const getBrand = await Brand.findById(id);
    if (!getBrand) throw new Error("Brand not Found");

    return res.status(200).json({
      starus: "success",
      getBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get All Brands
const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const Allbrands = await Brand.find();

    if (!Allbrands) throw new Error("Please create a brand first");

    return res.status(200).json({
      starus: "success",
      Allbrands,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrands,
};
