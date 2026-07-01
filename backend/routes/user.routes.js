import express from "express";
import { getMe, searchUser, UpdateUserProfile } from "../controllers/user.controller.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
import { upload } from "../config/multer.config.js";
import { uploadFile } from "../controllers/upload.controller.js";
const app = express.Router();

app.get("/get-me",isLoggedIn,getMe);
app.patch("/update-profile",isLoggedIn,UpdateUserProfile)
app.patch("/update-profile-image",isLoggedIn,upload.single("image"),uploadFile);
app.get("/search",isLoggedIn,searchUser);

export default app;