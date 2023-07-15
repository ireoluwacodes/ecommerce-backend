const express = require("express")
const { createBrand, updateBrand, deleteBrand, getAllBrands, getBrand } = require("../controllers/brandController")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

const brandRouter = express.Router()


brandRouter.route("/create").post(authMiddleware, isAdmin, createBrand)
brandRouter.route("/").get(authMiddleware, getAllBrands)
brandRouter.route("/:id").get(authMiddleware, getBrand)
brandRouter.route("/update/:id").put(authMiddleware, isAdmin, updateBrand)
brandRouter.route("/delete/:id").delete(authMiddleware, isAdmin, deleteBrand)


module.exports = {
    brandRouter
}