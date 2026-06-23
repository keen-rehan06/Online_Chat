import express from "express";
import {
  isLoggedIn,
  userLoginChecks,
  userRegisterChecks,
} from "../middlewares/auth.middleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
} from "../controllers/auth.controller.js";

const app = express.Router();

app.post("/register", userRegisterChecks, registerUser);
app.get("/verify", verifyUser);
app.post("/login", userLoginChecks, loginUser);
app.get("/logout", isLoggedIn, logoutUser);

export default app;
