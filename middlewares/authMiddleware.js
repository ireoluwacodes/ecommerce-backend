const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const secret = process.env.JWT_KEY;

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    if (req.headers.authorization.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];

      if (!token) throw new Error("Unauthorized");

      const decoded = await jwt.verify(token, secret);
      req.user = decoded;
      next();
    } else {
      throw new Error("Unauthorized! no token in header");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    const getUser = await User.findById(id);
    if (!getUser.isAdmin) throw new Error("You lack admin priviledges");
    next();
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { authMiddleware, isAdmin };
