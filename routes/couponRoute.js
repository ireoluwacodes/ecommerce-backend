const express = require("express");

const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const couponRouter = express.Router();

couponRouter.route("/create").post(authMiddleware, isAdmin, createCoupon);
couponRouter.route("/").get(authMiddleware, isAdmin, getAllCoupons);
couponRouter.route("/update/:id").put(authMiddleware, isAdmin, updateCoupon);
couponRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteCoupon);

module.exports = {
  couponRouter,
};
