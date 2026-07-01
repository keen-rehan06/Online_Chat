import { userModel } from "../models/user.model.js";
import { sessionModel } from "../models/session.model.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} from "../config/generateToken.js";
import crypto from "crypto";
import { verifyEmail } from "../emails/verifyEmail.js";
import jwt from "jsonwebtoken";
import { sendOtpOnMail } from "../emails/otpEmail.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      username,
      email,
      password: hash,
    });
    const token = generateToken(user);
    verifyEmail(token, email);
    const hashToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.token = hashToken;
    await user.save();
    const newCreatedUser = await userModel
      .findById(user._id)
      .select("-password -token");
    res.cookie("token", token);
    console.log(user.token);
    res.status(201).send({
      message: "user created successfully!",
      success: true,
      data: newCreatedUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Register failed:", error });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const decoded = req.user.id;
    const user = await userModel.findById(decoded);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    user.isVerified = true;
    user.token = null
    await user.save();
    return res
      .status(200)
      .clearCookie("token")
      .send({ message: "User Verified SuccessFully!", success: true });
  } catch (error) {
    console.log(error.message);
    return res
      .status(401)
      .send({ message: "Verification Failed", success: false, error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    const comparePassword = await bcrypt.compare(password, user.password);
    if(!user.isVerified) return res.status(401).send({message:"User Not verified!",success:false}) 
    if (!comparePassword)
      return res.status(400).send({ message: "Incorrect Password",success:false});
    const existingSession = await sessionModel.findOne({ userId: user._id });
    if (existingSession) {
      await sessionModel.deleteOne({ userId: user._id });
    }
    await sessionModel.create({ userId: user._id });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hasedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    user.isLoggedIn = true;
    user.token = null;
    user.refreshToken = hasedRefreshToken;
    await user.save();
    const newUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .send({
        message: "Login SuccessFully!",
        success: true,
        data: newUser,
        accessToken,
      });
  } catch (error) {
    console.log(error.message);
    return res.status(401).send(401).send({ message: "Login Failed!", error });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await sessionModel.deleteMany({ userId });
    await userModel.findByIdAndUpdate(userId, { isLoggedIn: false });
    res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .send({ message: "Logout SuccessFully!", sucess: false });
  } catch (error) {
    return res.status(401).send({ message: "Logout Failed!", success: false });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).send({
        message: "RefresToken is missing! Login First.",
        success: false,
      });
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }
    const hashedIncomingToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    if (hashedIncomingToken !== user.refreshToken) {
      return res.status(401).send({
        message: "Invalid Refresh Token",
      });
    }
    console.log(user);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const hasedRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    user.refreshToken = hasedRefreshToken;
    await user.save();
    return res
      .status(200)
      .cookie("accessToken", newAccessToken)
      .cookie("refreshToken", newRefreshToken)
      .send({
        message: "Regenerate Token SuccessFully!",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    console.log("error yaha hai", error.message);
    return res.status(500).send({ message: "server error", error });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(401)
        .send({ message: "Email is required!", success: false });
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found.", success: false });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const token = generateToken(user);
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    sendOtpOnMail(otp, email, token);

    const newUser = await userModel.findById(user._id);
    return res
      .status(200)
      .cookie("token", token)
      .send({ message: "Otp Send SuccessFully!", data: newUser });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    return res.status(500).send({
      message: error,
      success: false,
    });
  }
};

export const confirmOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    if (!otp)
      return res
        .status(401)
        .send({ message: "OTP is required.", success: false });
    if (otp !== user.otp)
      return res.status(401).send({ message: "Invalid Otp!", success: false });
    if (otp.length < 6)
      return res
        .status(401)
        .send({ message: "OTP Must be 6 number.", success: false });
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    res.status(200).send({ message: "OTP Verified!", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ message: error, success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
      return res
        .status(401)
        .send({ message: "All fields are required!!", success: false });
    if (newPassword !== confirmPassword)
      return res
        .status(401)
        .send({ message: "Password doesn't match", success: false });
    if (newPassword.length < 6)
      return res
        .status(401)
        .send({ message: "Password at least 6 characters", success: false });
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.token = null;
    await user.save();
    const newUser = await userModel.findById(user._id);
    return res
      .status(200)
      .clearCookie("token")
      .send({ message: "Password Reset SuccessFully!", data: newUser });
  } catch (error) {
    console.log(error.message)
    return res
      .status(500)
      .send({ message: "Password Reseting Failed!", success: false, error });
  }
};

