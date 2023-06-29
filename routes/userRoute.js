import express from "express";
import { AuthController } from "../controllers/authController.js";
const { registerAuth, loginAuth } = new AuthController();
const userRouter = express.Router();

userRouter.route("/register").post(registerAuth);
userRouter.route("/login").post(loginAuth);

export { userRouter };
