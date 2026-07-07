import express from "express";
import { getMessage, sendMessage, } from "../controllers/message.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const app = express.Router();

app.post("/send-message",isLoggedIn,sendMessage)
app.get("/get-message/:id",isLoggedIn,getMessage);

export default app;