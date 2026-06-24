// ======================================================
// FILE: server.js (Main Core Entry Point)
// ======================================================
import dotenv from "dotenv";
// 🔥 CRITICAL: Must be execution line #1 to load environmental primitives before any configurations read them
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routing Handlers Integration Area
import authRouter from "./src/router/authRouter.js";
import accessRouter from "./src/router/accessRoutes.js";
import storyRoutes from "./src/router/storyRoutes.js";
import photoBookRouter from "./src/router/photoBookRouter.js";
import ImageRouter from "./src/router/imageRoute.js";
import filmRoutes from "./src/router/filmsRoutes.js";
import preWeddingRoutes from "./src/router/preWeddingRoutes.js";
import heroRoutes from "./src/router/heroRoutes.js";

// Cloudinary Configuration Verification Trigger
import "../server/src/config/cloudinary.js"; 

const app = express();

// ==========================================
// MIDDLEWARES PIPELINE
// ==========================================

// Support massive binary buffer chunks for high-res albums and raw cinematic clips
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "me-lyart-xi.vercel.app",
      "me-git-main-vineetpancheshwar1611gmailcoms-projects.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ==========================================
// DATABASE PERSISTENCE LAYER (MongoDB)
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Ecosystem Connected Successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB Engine Lifecycle Connection Fault:", error);
  });

// ==========================================
// ROUTING TARGET DISPATCH MATRICES
// ==========================================

app.use("/api/auth", authRouter);
app.use("/api/access", accessRouter);
app.use("/api/story", storyRoutes);
app.use("/api/photo-book", photoBookRouter);
app.use("/api/image", ImageRouter);
app.use("/api/film", filmRoutes);
app.use("/api/pre-wedding", preWeddingRoutes);
app.use("/api/hero", heroRoutes);

// Health Check API Matrix endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "active", message: "Server stream pipeline up and responding cleanly." });
});

// ==========================================
// CENTRALIZED PRODUCTION ERROR FALLBACK
// ==========================================
app.use((err, req, res, next) => {
  console.error("🔥 Global Catch Framework Intercepted an Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected dynamic compilation block failure occurred inside core server.",
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running successfully ");
});

// ==========================================
// SERVER INITIALIZATION & STREAM HOOKS
// ==========================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`📡 Production Pipeline actively dispatching objects on Interface Port: ${PORT}`);
});

// Set server socket thresholds to 5 minutes to fully support continuous stream chunks upload
server.timeout = 300000;         // 5 Minutes network timeout
server.keepAliveTimeout = 300000; // 5 Minutes stream persistence pipeline