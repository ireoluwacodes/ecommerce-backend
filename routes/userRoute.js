const express = require("express");
const {
  registerAuth,
  loginAuth,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logOut,
  forgotPassword,
  resetPassword,
  verifyUser,
  changePassword,
  adminLoginAuth,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  updateOrder,
  getOrder,
  getAllOrders,
} = require("../controllers/authController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const userRouter = express.Router();

userRouter.route("/register").post(registerAuth);

userRouter.route("/login").post(loginAuth);

userRouter.route("/admin-login").post(adminLoginAuth);

userRouter.route("/forgot-pass").post(forgotPassword);

userRouter.route("/reset/:token").put(resetPassword);

userRouter.route("/verify-me/:token").put(verifyUser);

userRouter.route("/change-pass").put(authMiddleware, changePassword);

userRouter.route("/wish-list").get(authMiddleware, getWishlist);

userRouter.route("/add-cart").post(authMiddleware, userCart);

userRouter.route("/add-coupon").post(authMiddleware, applyCoupon);

userRouter.route("/get-cart").get(authMiddleware, getUserCart);

userRouter.route("/empty-cart").delete(authMiddleware, emptyCart);

userRouter.route("/refresh").get(handleRefreshToken);

userRouter.route("/order/create").post(authMiddleware, createOrder);

userRouter.route("/order/update/:id").put(authMiddleware, isAdmin, updateOrder);

userRouter.route("/order").get(authMiddleware, getOrder);

userRouter.route("/order/all").get(authMiddleware, isAdmin, getAllOrders);

userRouter.route("/logout").get(logOut);

userRouter.route("/get-users").get(authMiddleware, isAdmin, getAllUsers);
 
userRouter.route("/get-user").get(authMiddleware, getUser);

userRouter.route("/delete-user").delete(authMiddleware, isAdmin, deleteUser);

userRouter.route("/update-user").put(authMiddleware, updateUser);

userRouter.route("/update-address").put(authMiddleware, saveAddress);

userRouter.route("/block-user/:id").put(authMiddleware, isAdmin, blockUser);

userRouter.route("/unblock-user/:id").put(authMiddleware, isAdmin, unBlockUser);

module.exports = { userRouter };
