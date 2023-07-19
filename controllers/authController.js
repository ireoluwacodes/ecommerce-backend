const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../models/userModel.js");
const { hashPassword, comparePassword } = require("../utils/managePass.js");
const { genToken, verifyToken } = require("../config/signToken.js");
const { validateDbId } = require("../utils/validateMongoId.js");
const { genRefreshToken } = require("../config/refreshToken.js");
const { transporter, mailOptions } = require("../utils/mailer.js");
const { Cart } = require("../models/cartModel.js");
const { Product } = require("../models/productModel.js");
const { Coupon } = require("../models/couponModel.js");
const { Order } = require("../models/orderModel.js");

// User Registration
const registerAuth = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password) {
      throw new Error("Please enter all fields");
    }
    const checkMail = await User.findOne({ email });
    const checkMobile = await User.findOne({ mobile });
    if (checkMail || checkMobile) {
      throw new Error("User with that email or mobile already exists");
    }
    const hashed = await hashPassword(password);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      hash: hashed,
    });

    // sign id into token
    const token = await genToken(newUser._id);

    // send mail to verify
    const url = `Tap the link to verify your email.  <a href='${process.env.MAIL_URL}/auth/verify-me/${token}'>Click Here</a>`;

    let mailOption = await mailOptions(email, "Verify Your Email", url);
    const info = await transporter.sendMail(mailOption);
    console.log(info.response);

    return res.status(200).json({
      status: "success",
      message: `User ${newUser.firstName} created successfully`,
      token,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// User Login
const loginAuth = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please enter all fields");
    }
    const findUser = await User.findOne({ email });
    if (findUser) {
      if (!findUser.isVerified) throw new Error("Please Verify Your Email");

      if (findUser.isBlocked)
        throw new Error(
          "Your Account Has Been BLOCKED. Please contact Admin if you think this was a mistake"
        );

      const validateUser = await comparePassword(password, findUser.hash);
      if (!validateUser) {
        throw new Error("Incorrect Credentials");
      }
      const refreshToken = await genRefreshToken(findUser._id);

      const updatedUser = await User.findByIdAndUpdate(
        findUser._id,
        {
          refreshToken,
        },
        {
          new: true,
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      const token = await genToken(findUser._id);

      return res.status(200).json({
        status: "success",
        message: "Login Successfully",
        findUser,
        token,
      });
    } else {
      throw new Error("User does not exist!");
    }
  } catch (error) {
    next(error);
  }
});

// Admin Login
const adminLoginAuth = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please enter all fields");
    }
    const findUser = await User.findOne({ email });
    if (findUser) {
      if (!findUser.isVerified) throw new Error("Please Verify Your Email");

      if (!findUser.isAdmin)
        throw new Error("Unauthorized to access this route");

      if (findUser.isBlocked)
        throw new Error(
          "Your Account Has Been BLOCKED. Please contact Admin if you think this was a mistake"
        );

      const validateUser = await comparePassword(password, findUser.hash);
      if (!validateUser) {
        throw new Error("Incorrect Credentials");
      }
      const refreshToken = await genRefreshToken(findUser._id);

      const updatedUser = await User.findByIdAndUpdate(
        findUser._id,
        {
          refreshToken,
        },
        {
          new: true,
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      const token = await genToken(findUser._id);

      return res.status(200).json({
        status: "success",
        message: "Login Successfully",
        findUser,
        token,
      });
    } else {
      throw new Error("User does not exist!");
    }
  } catch (error) {
    next(error);
  }
});

// Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error("No refresh token in cookie");

  const refreshToken = cookie.refreshToken;
  const refUser = await User.findOne({ refreshToken });
  if (!refUser) throw new Error("User with refresh token not found");

  const decoded = await verifyToken(refreshToken);
  await validateDbId(decoded);
  if (decoded != refUser._id) throw new Error("Could not verify refresh token");

  const token = await genToken(refUser._id);

  return res.status(200).json({
    status: "success",
    token,
  });
});

// Logout Functionality
const logOut = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error("No refresh token in cookie");

  const refreshToken = cookie.refreshToken;
  const refUser = await User.findOne({ refreshToken });
  if (!refUser) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(403);
  }

  await User.findByIdAndUpdate(refUser._id, {
    refreshToken: " ",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Please enter Alll fields");
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) throw new Error("User does not exist");

    const token = await genToken(findUser._id);
    console.log(token);
    // Send your mail
    const url = `Tap the link to reset your email.  <a href='${process.env.MAIL_URL}/auth/reset/${token}'>Click Here</a>`;

    let mailOption = await mailOptions(email, "Reset Password Link", url);
    const info = await transporter.sendMail(mailOption);
    console.log(info.response);
    // end
    return res.status(200).json({
      message: "Check mail for reset link",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) throw new Error("Unauthorized");

    const { password } = req.body;
    if (!password) throw new Error("Please enter all fields");

    const id = await verifyToken(token);
    if (!id) throw new Error("Invalid Token");

    await validateDbId(id);
    const hash = await hashPassword(password);

    const updatedUser = await User.findByIdAndUpdate(id, {
      hash,
      passwordUpdatedAt: Date.now(),
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset sucessfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    await validateDbId(id);

    const { password, newPassword } = req.body;
    const FindUser = await User.findById(id);

    const compare = await comparePassword(password, FindUser.hash);

    if (compare) {
      const newHash = await hashPassword(newPassword);

      FindUser.hash = newHash;
      FindUser.passwordUpdatedAt = Date.now();
      await FindUser.save();

      return res.status(200).json({
        message: "Password Changed",
      });
    } else {
      throw new Error("Old password is incorrect");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Verify User
const verifyUser = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) throw new Error("Unauthorized");

    const id = await verifyToken(token);
    if (!id) throw new Error("Invalid Token");
    await validateDbId(id);

    const updatedUser = await User.findByIdAndUpdate(id, {
      isVerified: true,
    });

    return res.status(200).json({
      message: "User Verified",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const findUser = await User.findById(id).populate("wishlist");

    if (!findUser) throw new Error("User not Found");

    return res.status(200).json({
      status: "success",
      wishlist: findUser.wishlist,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update User Information
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    await validateDbId(id);
    const { firstName, lastName, mobile } = req.body;
    if (!firstName || !lastName || !mobile) {
      throw new Error("Please enter all fields");
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, mobile },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// save user address
const saveAddress = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const { address } = req.body;
    if (!address) throw new Error("Enter all fields");

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        address,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: "success",
      updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Add to Cart Function
const userCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const products = [];

    const { cart } = req.body;

    const findUser = await User.findById(id);

    const findCart = await Cart.findOne({ orderBy: findUser._id });
    if (findCart) {
      findCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.color = cart[i].color;
      object.count = cart[i].count;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].count;
    }
    const newCart = await Cart.create({
      products,
      cartTotal,
      orderBy: id,
    });
    return res.status(200).json({
      status: "success",
      newCart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a Users Cart Function
const getUserCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const userCart = await Cart.findOne({ orderBy: id }).populate(
      "products.product"
    );
    if (!userCart) throw new Error("Cart is Empty");
    return res.status(200).json({
      status: "success",
      userCart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Empty a users cart function
const emptyCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const deletedCart = await Cart.findOneAndDelete({ orderBy: id });
    if (!deletedCart) throw new Error("Cart is already Empty");

    return res.status(200).json({
      status: "success",
      deletedCart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Add a discount coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const { coupon } = req.body;
    const findCoupon = await Coupon.findOne({ name: coupon });
    if (!findCoupon) throw new Error("Invalid Coupon");

    const cart = await Cart.findOne({ orderBy: id });
    if (!cart) throw new Error("Cart is Empty");

    let totalAfterDiscount = (
      (cart.cartTotal * (100 - findCoupon.discount)) /
      100
    ).toFixed(2);
    cart.totalAfterDiscount = totalAfterDiscount;
    await cart.save();
    return res.status(200).json({
      status: "success",
      cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Create an Order function
const createOrder = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const { COD, couponApplied } = req.body;
    if (!COD) throw new Error("Create cash order failed");

    const cart = await Cart.findOne({ orderBy: id }).populate(
      "products.product"
    );
    if (!cart) throw new Error("Cart is Empty");

    let finalAmount = 0;
    if (couponApplied && cart.totalAfterDiscount) {
      finalAmount = cart.totalAfterDiscount;
    } else {
      finalAmount = cart.cartTotal;
    }

    const newOrder = await Order.create({
      products: cart.products,
      orderBy: id,
      paymentIntent: {
        id: uuidv4(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "NGN",
      },
      orderStatus: "Cash on Delivery",
    });

    let update = cart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: {
            $inc: {
              quantity: -item.count,
              sold: +item.count,
            },
          },
        },
      };
    });
    const updatedProduct = await Product.bulkWrite(update, {});

    return res.status(200).json({
      status: "success",
      message: "Order placed",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update order status
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const orderId = req.params.id;
    if (!orderId) throw new Error("Unauthorized");
    await validateDbId(id);

    const { orderStatus } = req.body;
    if (!orderStatus) throw new Error("Please enter all fields");

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "success",
      updatedOrder,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get Order/Status
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.user;
  if (!id) throw new Error("Unauthorized");
  await validateDbId(id);
  try {
    const userOrder = await Order.findOne({ orderBy: id }).populate(
      "products.product"
    );
    if (!userOrder) throw new Error("User has no pending order");

    return res.status(200).json({
      status: "success",
      userOrder,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get All Order/Status
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const userOrders = await Order.find({}).populate("products.product");
    if (!userOrders) throw new Error("No orders found");

    return res.status(200).json({
      status: "success",
      userOrders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    return res.status(200).json({
      allUsers,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single User
const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    await validateDbId(id);
    const myUser = await User.findById(id);
    return res.status(200).json({
      myUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a single User
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    await validateDbId(id);
    const deletedUser = await User.findByIdAndDelete(id);
    return res.status(200).json({
      message: "User Deleted",
      deletedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Block a single User
const blockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);
    const checkStatus = await User.findById(id);

    if (checkStatus.isBlocked) throw new Error("User is already Blocked");

    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    return res.status(200).json({
      message: "User Blocked",
      blockedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Unblock a single User
const unBlockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);
    const checkStatus = await User.findById(id);

    if (!checkStatus.isBlocked) throw new Error("User is not Blocked");

    const unblockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    return res.status(200).json({
      message: "User unblocked",
      unblockedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  registerAuth,
  loginAuth,
  adminLoginAuth,
  forgotPassword,
  resetPassword,
  verifyUser,
  changePassword,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logOut,
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
};
