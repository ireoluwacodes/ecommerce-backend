const express = require("express");
const app = express();
require("dotenv").config();
const colors = require("colors")

const PORT = process.env.PORT;

app.get("/", (req, res)=>{
  res.send("Welcome to my ecommerce API")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.red);
});
