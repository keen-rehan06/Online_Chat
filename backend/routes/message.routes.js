import express from "express";
import { createConversation, showConversation } from "../controllers/message.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const app = express.Router();

app.post("/create-conversation",isLoggedIn,createConversation);
app.get("/find-conversation",isLoggedIn,showConversation);

export default app;