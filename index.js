const { json, urlencoded } = require("express");
const express = require("express");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors")

require("dotenv").config();

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

const { createDB } = require("./config/db.js");
const { notFound } = require("./middlewares/notFound.js");
const { userRouter } = require("./routes/userRoute.js");
const { errHandler } = require("./middlewares/errHandler.js");
const { productRouter } = require("./routes/productRoute.js");

const PORT = process.env.PORT;

app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to my ecommerce API");
});

app.use("/api/auth", userRouter);
app.use("/api/product", productRouter);

app.use(notFound);
app.use(errHandler);

const createServr = async () => {
  try {
    await createDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`.red.bold);
    });
  } catch (error) {
    console.log(error);
  }
};

createServr();
