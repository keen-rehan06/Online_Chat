import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const userRegisterChecks = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(401)
        .send({ message: "All Fileds Are required!", success: false });
    const user = await userModel.findOne({ email });
    if (user)
      return res
        .status(409)
        .send({ message: "User Already Exist.", success: false });
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    )
      return res
        .status(401)
        .send({ message: "All filed must be string", success: false });
    if (name.trim().length < 3)
      return res
        .status(401)
        .send({ message: "Name must be atleast 3 characters", success: false });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(401).send({
        message: "Invalid email format",
        success: false,
      });
    if (password.length < 6)
      return res
        .status(401)
        .send({ message: "Password must be at least 6 characters" });
    if (password.length > 12)
      return res
        .status(401)
        .send({
          message: "Too Long Password only 12 character Password allowed.",
          success: false,
        });
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error:", error });
  }
};

export const userLoginChecks = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(401)
        .send({ message: "All fields are required!", success: false });
    if (typeof email !== "string" || typeof password !== "string")
      return res
        .status(401)
        .send({ message: "All filed must be string", success: false });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res
        .status(401)
        .send({ message: "Invalid Email Format", success: false });
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ message: "Internal Server Error", error });
  }
};

export const isLoggedIn = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token)
    return res
      .status(401)
      .send({ message: "Please! Login First.", success: false });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).send({ message: "Server Error", error });
  }
};

export const isVerifiedtoken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token)
      return res.status(401).send({ message: "Token Not found!", error });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      console.log(error.message);
      return res.status(401).send({ message: error, success: false });
    }
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid Token.", success: false });
  }
};

export const tokenWithOtp = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token)
    return res
      .status(404)
      .send({ message: "Token is not Found!", success: false });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ message: error, success: false });
  }
};
