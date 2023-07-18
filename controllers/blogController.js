const asyncHandler = require("express-async-handler");
const { Blog } = require("../models/blogModel");
const { User } = require("../models/userModel");
const { validateDbId } = require("../utils/validateMongoId");
const { cloudinaryUpload } = require("../utils/cloudinaryConfig");

// Create a new Blog
const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !category || !description)
      throw new Error("Please enter All fields");

    const newBlog = await Blog.create({
      title,
      category,
      description,
    });
    return res.status(200).json({
      status: "success",
      message: "Blog created successfully",
      newBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update Existing Blog
const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Invalid parameters");

    const { title, description, category, author } = req.body;
    if (!title && !description && !category && !author)
      throw new Error("Nothing to update");

    await validateDbId(id);
    const findBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    if (!findBlog) throw new Error("Blog not Found");

    return res.status(200).json({
      status: "success",
      message: "Updated successfully",
      findBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get A blog
const getBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Invalid parameters");

    await validateDbId(id);
    const getBlog = await Blog.findById(id)
      .populate("likes")
      .populate("disLikes");
    getBlog.numViews++;
    await getBlog.save();
    if (!getBlog) throw new Error("Blog not Found");

    return res.status(200).json({
      status: "success",
      getBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get All blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const AllBlogs = await Blog.find();

    return res.status(200).json({
      status: "success",
      AllBlogs,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete Existing Blog
const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Invalid parameters");

    await validateDbId(id);
    const deletedBlog = await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Deleted successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Like a Blog
const likeBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Invalid parameters");
  await validateDbId(id);

  const user = req.user.id;
  if (!user) throw new Error("Unauthorized");
  await validateDbId(user);

  const findBlog = await Blog.findById(id);

  const alreadyDisliked = findBlog.disLikes.find(
    (userId) => userId.toString() === user.toString()
  );

  if (alreadyDisliked) {
    const updatedDislikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $pull: { disLikes: user },
      },
      {
        new: true,
      }
    );
  }

  const alreadyLiked = findBlog.likes.find(
    (userId) => userId.toString() === user.toString()
  );

  if (alreadyLiked) {
    const updatedLikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $pull: { likes: user },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Successfully Unliked",
      updatedLikedBlog,
    });
  } else {
    const updatedLikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $push: { likes: user },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Successfully Liked",
      updatedLikedBlog,
    });
  }
});

// Dislike a Blog
const disLikeBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Invalid parameters");
  await validateDbId(id);

  const user = req.user.id;
  if (!user) throw new Error("Unauthorized");
  await validateDbId(user);

  const findBlog = await Blog.findById(id);

  const alreadyLiked = findBlog.likes.find(
    (userId) => userId.toString() === user.toString()
  );

  if (alreadyLiked) {
    const updatedLikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $pull: { likes: user },
      },
      {
        new: true,
      }
    );
  }

  const alreadyDisliked = findBlog.disLikes.find(
    (userId) => userId.toString() === user.toString()
  );

  if (alreadyDisliked) {
    const updatedDislikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $pull: { disLikes: user },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Successfully Un-Disliked",
      updatedDislikedBlog,
    });
  } else {
    const updatedDislikedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $push: { disLikes: user },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Successfully Disliked",
      updatedDislikedBlog,
    });
  }
});

// Upload a blog image
const uploadImage = asyncHandler(async (req, res) => {
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

    const findBlog = await Blog.findByIdAndUpdate(
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
      findBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadImage
};
