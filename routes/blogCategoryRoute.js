const express = require("express")
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories } = require("../controllers/blogCategoryController")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

const blogCategoryRouter = express.Router()


blogCategoryRouter.route("/").get(authMiddleware, getAllCategories)
blogCategoryRouter.route("/:id").get(authMiddleware,  getCategory)
blogCategoryRouter.route("/create").post(authMiddleware, isAdmin, createCategory)
blogCategoryRouter.route("/update/:id").put(authMiddleware, isAdmin, updateCategory)
blogCategoryRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteCategory)


module.exports = {
    blogCategoryRouter
}
