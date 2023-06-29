import { User } from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/managePass.js";

class AuthController {
  async registerAuth(req, res) {
    try {
      const { firstName, lastName, email, mobile, password } = req.body;

      if (!firstName || !lastName || !email || !mobile || !password) {
        return res.status(401).json({
          message: "Please enter all fields",
        });
      }
      const checkMail = await User.findOne({ email });
      const checkMobile = await User.findOne({ mobile });
      if (checkMail || checkMobile) {
        return res.status(401).json({
          message: "User with that email or mobile already exists",
        });
      }
      const hashed = await hashPassword(password);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        hash: hashed,
      });

      return res.status(200).json({
        status: "success",
        message: `User ${newUser.firstName} created successfully`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async loginAuth(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Enter All fields!",
      });
    }
    const findUser = User.findOne({ email });
    if (findUser) {
      const validateUser = await comparePassword(password, findUser.hash);
      if (!validateUser) {
        return res.status(401).json({
          message: "Incorrect Password",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Login Successfully",
      });
      
    } else {
      return res.status(401).json({
        message: "User does not Exist",
      });
    }
  }


}

export { AuthController };
