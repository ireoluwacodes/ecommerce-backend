const AsyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { Product } = require("../models/productModel");
const { validateDbId } = require("../utils/validateMongoId");
const { User } = require("../models/userModel");
const { cloudinaryUpload } = require("../utils/cloudinaryConfig");

// create new product
const createProduct = AsyncHandler(async (req, res) => {
  try {
    const { title, description, price, quantity, category, brand, color } =
      req.body;
    if (
      !title ||
      !description ||
      !price ||
      !quantity ||
      !category ||
      !brand ||
      !color
    )
      throw new Error("Please enter all fields");

    req.body.slug = slugify(req.body.title);

    const newProduct = await Product.create(req.body);

    return res.status(200).json({
      status: "success",
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update a product
const updateProduct = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);

    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json({
      message: "success",
      updatedProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get a product
const getProduct = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);

    const findProduct = await Product.findById(id);
    if (!findProduct) throw new Error("Sorry! product not found");

    return res.status(200).json({
      findProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get all products
const getAllProducts = AsyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };

    // filtering
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //  pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exist");
    }

    const allProducts = await query;
    return res.status(200).json({
      status: "success",
      allProducts,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete an existing product
const deleteProduct = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await validateDbId(id);

    const deletedProduct = await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: "successfully deleted",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Add a Product to wishlist
const addToWishlist = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const prodId = req.params.id;

    await validateDbId(id);
    await validateDbId(prodId);

    const user = await User.findById(id);

    const alreadyAdded = user.wishlist.find(
      (id) => id.toString() === prodId.toString()
    );

    if (alreadyAdded) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $pull: { wishlist: prodId },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Removed from wishlist",
        updatedUser,
      });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $push: { wishlist: prodId },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Added to wishlist",
        updatedUser,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Give a rating of a product
const rating = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const prodId = req.params.id;
  const { star, comment } = req.body;

  await validateDbId(id);
  await validateDbId(prodId);
  if (!star) throw new Error("Invalid fields");

  try {
    const product = await Product.findById(prodId);
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === id.toString()
    );

    if (alreadyRated) {
      const updatedRatings = await Product.updateOne(
        {
          ratings: {
            $elemMatch: alreadyRated,
          },
        },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
        { new: true }
      );
    } else {
      const addedRatings = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedBy: id,
            },
          },
        },
        { new: true }
      );
    }
    const ratedProduct = await Product.findById(prodId);
    const ratingNum = ratedProduct.ratings.length;
    const ratingSum = ratedProduct.ratings
      .map((one) => one.star)
      .reduce((prev, curr) => prev + curr, 0);
    const totalRating = Math.round(ratingSum / ratingNum);
    ratedProduct.totalRating = totalRating;
    console.log(ratingNum, ratingSum, totalRating);
    await ratedProduct.save();

    return res.status(200).json({
      message: "Rating added",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Upload a product image
const uploadImage = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("invalid Parameters");
  await validateDbId(id);
  try {
    const uploader = (path) => cloudinaryUpload(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
    }

    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );

    return res.status(200).json({
      message: "success",
      findProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImage,
};
