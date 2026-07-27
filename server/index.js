// ======================================================
// FILE: server.js (Main Core Entry Point)
// ======================================================
import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routing Handlers Integration Area
import authRouter from "./src/router/adminRoutes/authRouter.js";
import accessRouter from "./src/router/adminRoutes/accessRoutes.js";
import storyRoutes from "./src/router/adminRoutes/storyRoutes.js";
import photoBookRouter from "./src/router/adminRoutes/photoBookRouter.js";
import ImageRouter from "./src/router/adminRoutes/imageRoute.js";
import filmRoutes from "./src/router/adminRoutes/filmsRoutes.js";
import preWeddingRoutes from "./src/router/adminRoutes/preWeddingRoutes.js";
import heroRoutes from "./src/router/adminRoutes/heroRoutes.js";
import FamilyAcessRoutes from "./src/router/adminRoutes/familyAccessRoutes.js";

// MERN Photo Studio Integrations
import userRouter from "./src/router/userRouter.js";
import googleRouter from "./src/router/adminRoutes/googleRouter.js";
import workRouter from "./src/router/workRouter.js";
import uploadRouter from "./src/router/adminRoutes/uploadRouter.js";
import correctionRouter from "./src/router/adminRoutes/correctionRouter.js";
import galleryRouter from "./src/router/adminRoutes/galleryRouter.js";
import notificationRouter from "./src/router/adminRoutes/notificationRouter.js";
import analyticsRouter from "./src/router/adminRoutes/analyticsRouter.js";

const app = express();

// ==========================================
// MIDDLEWARES PIPELINE
// ==========================================

// Support massive binary buffer chunks for high-res albums and raw cinematic clips
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://me-lyart-xi.vercel.app",
  "https://me-git-main-vineetpancheshwar1611gmailcoms-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("vineetpancheshwar1611gmailcoms-projects.vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
app.use("/api/family-access", FamilyAcessRoutes);

// Mounted REST API endpoints
app.use("/api/users", userRouter);
app.use("/api/google", googleRouter);
app.use("/api/work", workRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/correction", correctionRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/analytics", analyticsRouter);

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

// Set server socket thresholds to 10 minutes to fully support continuous stream chunks upload (500MB files)
server.timeout = 600000;         // 10 Minutes network timeout
server.keepAliveTimeout = 600000; // 10 Minutes stream persistence pipeline