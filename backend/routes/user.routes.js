import express from "express";
import { getMe, UpdateUserProfile } from "../controllers/user.controller.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
const app = express.Router();

app.get("/get-me",isLoggedIn,getMe);
app.patch("/update-profile",isLoggedIn,UpdateUserProfile)

export default app;
