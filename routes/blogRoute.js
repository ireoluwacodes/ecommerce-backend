const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlog,
  getAllBlogs,
  likeBlog,
  disLikeBlog,
} = require("../controllers/blogController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const blogRouter = express.Router();

blogRouter.route("/create").post(authMiddleware, isAdmin, createBlog);
blogRouter.route("/create/:id").put(authMiddleware, isAdmin, updateBlog);
blogRouter.route("/:id").get(getBlog);
blogRouter.route("/").get(authMiddleware, isAdmin, getAllBlogs);
blogRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteBlog);
blogRouter.route("/like/:id").get(authMiddleware, likeBlog);
blogRouter.route("/dislike/:id").get(authMiddleware, disLikeBlog);


module.exports = {
  blogRouter,
};
