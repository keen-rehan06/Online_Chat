import express from "express";
import { sendMessage, } from "../controllers/message.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const app = express.Router();

app.post("/send-message",isLoggedIn,sendMessage)

export default app;