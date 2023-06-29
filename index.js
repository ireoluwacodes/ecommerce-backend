import express, { json, urlencoded } from "express";
import colors from "colors";
import dotenv from "dotenv";
dotenv.config()


const app = express();
app.use(json())
app.use(urlencoded({extended:true}))


import {createDB} from "./config/db.js";
import { notFound } from "./middlewares/notFound.js";
import { userRouter } from "./routes/userRoute.js";


const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Welcome to my ecommerce API");
});

app.use("/auth", userRouter)

app.use(notFound)

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
