const asyncHandler = require("express-async-handler");

const { User } = require("../models/userModel.js");
const { hashPassword, comparePassword } = require("../utils/managePass.js");
const { genToken, verifyToken } = require("../config/signToken.js");
const { validateDbId } = require("../utils/validateMongoId.js");
const { genRefreshToken } = require("../config/refreshToken.js");

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

    return res.status(200).json({
      status: "success",
      message: `User ${newUser.firstName} created successfully`,
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
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logOut,
};
