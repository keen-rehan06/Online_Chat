import express from "express";
import {
  isLoggedIn,
  isVerifiedtoken,
  userLoginChecks,
  userRegisterChecks,
} from "../middlewares/auth.middleware.js";
import {
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
export default app;
