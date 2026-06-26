import express from "express";
import {
  isLoggedIn,
  isVerifiedtoken,
  tokenWithOtp,
  userLoginChecks,
  userRegisterChecks,
} from "../middlewares/auth.middleware.js";
import {
  changePassword,
  confirmOtp,
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyUser,
} from "../controllers/auth.controller.js";

const app = express.Router();

app.post("/register", userRegisterChecks, registerUser);
app.get("/verify", isVerifiedtoken,verifyUser);
app.post("/login", userLoginChecks, loginUser);
app.get("/logout", isLoggedIn, logoutUser);
app.get("/regenerateTokens",refreshAccessToken);
app.post("/forgotPassword",forgotPassword);
app.post("/confirm-otp",tokenWithOtp,confirmOtp)
app.patch("/change-password",tokenWithOtp,changePassword);
export default app;
