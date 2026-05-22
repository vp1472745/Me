import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/router/authRouter.js";
import accessRouter from "./src/router/accessRoutes.js";
import storyRoutes from "./src/router/storyRoutes.js";
import photoBookRouter from "./src/router/photoBookRouter.js";
import ImageRouter from "./src/router/imageRoute.js";

dotenv.config();

const app = express();

// ==========================
// Middleware
// ==========================

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// ==========================
// Database
// ==========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

// ==========================
// Routes
// ==========================

app.use("/api/auth", authRouter);
app.use("/api/access", accessRouter);
app.use(
  "/api/story",
  storyRoutes
);
app.use(
  "/api/photo-book",
  photoBookRouter
);

app.use(
  "/api/image",
  ImageRouter
);

// ==========================
// Server
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});