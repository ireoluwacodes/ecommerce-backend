const { Coupon } = require("../models/couponModel");
const AsyncHandler = require("express-async-handler");
const { validateDbId } = require("../utils/validateMongoId");

// Create a new coupon
const createCoupon = AsyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body;
  if (!name || !discount || !expiry) throw new Error("please enter all fields");
  try {
    const newCoupon = await Coupon.create({
      name,
      discount,
      expiry,
    });

    return res.status(200).json({
      message: "coupon created successfully",
      newCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete coupons
const deleteCoupon = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await validateDbId(id);
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (!deletedCoupon) throw new Error("Coupon already deleted");

    return res.status(200).json({
      message: "coupon deleted successfully",
      deletedCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get all coupons
const getAllCoupons = AsyncHandler(async (req, res) => {
  try {
    const AllCoupons = await Coupon.find();
    if (!AllCoupons) throw new Error("No coupons at the moment");

    return res.status(200).json({
      message: "coupons retrieved successfully",
      AllCoupons,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update a coupon
const updateCoupon = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, expiry, discount } = req.body;
  try {
    if (!name && !expiry && !discount) throw new Error("Nothing to update");

    await validateDbId(id);
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCoupon) throw new Error("Coupon does not exist");

    return res.status(200).json({
      message: "coupon updated successfully",
      updatedCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
};
