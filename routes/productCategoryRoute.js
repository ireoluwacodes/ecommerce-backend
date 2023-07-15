const express = require("express")
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories } = require("../controllers/productCategoryController")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

const categoryRouter = express.Router()


categoryRouter.route("/").get(authMiddleware, getAllCategories)
categoryRouter.route("/:id").get(authMiddleware,  getCategory)
categoryRouter.route("/create").post(authMiddleware, isAdmin, createCategory)
categoryRouter.route("/update/:id").put(authMiddleware, isAdmin, updateCategory)
categoryRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteCategory)


module.exports = {
    categoryRouter
}
