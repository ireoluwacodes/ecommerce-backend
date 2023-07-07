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
} = require("../controllers/authController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const userRouter = express.Router();

userRouter.route("/register").post(registerAuth);

userRouter.route("/login").post(loginAuth);

userRouter.route("/forgot-pass").post(forgotPassword);

userRouter.route("/reset/:token").put(resetPassword);

userRouter.route("/verify-me/:token").put(verifyUser);

userRouter.route("/change-pass").put(authMiddleware, changePassword);

userRouter.route("/refresh").get(handleRefreshToken);

userRouter.route("/logout").get(logOut);

userRouter.route("/get-users").get(authMiddleware, isAdmin, getAllUsers);

userRouter.route("/get-user").get(authMiddleware, getUser);

userRouter.route("/delete-user").delete(authMiddleware, isAdmin, deleteUser);

userRouter.route("/update-user").put(authMiddleware, updateUser);

userRouter.route("/block-user/:id").put(authMiddleware, isAdmin, blockUser);

userRouter.route("/unblock-user/:id").put(authMiddleware, isAdmin, unBlockUser);

module.exports = { userRouter };
