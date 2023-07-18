const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlog,
  getAllBlogs,
  likeBlog,
  disLikeBlog,
  uploadImage,
} = require("../controllers/blogController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImageResize } = require("../middlewares/uploadImage");

const blogRouter = express.Router();

blogRouter.route("/create").post(authMiddleware, isAdmin, createBlog);
blogRouter.route("/create/:id").put(authMiddleware, isAdmin, updateBlog);
blogRouter.route("/:id").get(getBlog);
blogRouter.route("/").get(authMiddleware, isAdmin, getAllBlogs);
blogRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteBlog);
blogRouter.route("/like/:id").get(authMiddleware, likeBlog);
blogRouter.route("/upload/:id").put(authMiddleware, isAdmin, uploadPhoto.array("images", 2), blogImageResize, uploadImage);
blogRouter.route("/dislike/:id").get(authMiddleware, disLikeBlog);


module.exports = {
  blogRouter,
};
