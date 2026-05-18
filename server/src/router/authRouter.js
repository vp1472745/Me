import express from "express";

import {
  register,
  login,
  logout,
} from "../controller/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Routes
// ==========================

router.post("/register", register);

router.post("/login", login);

router.get("/logout",  logout);

export default router;