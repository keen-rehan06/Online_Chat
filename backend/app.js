import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDb } from "./db/db.js";
import authRoute from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import messageRoute from "./routes/message.routes.js"
import conversationRoute from "./routes/conversation.routes.js"

(async () => {
  try {
    await connectDb();
  } catch (error) {
    console.log("MongoDb Connection Failed ❌:", error);
  }
})();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/",authRoute);
app.use("/",userRoute);
app.use("/",messageRoute)
app.use("/",conversationRoute)

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
