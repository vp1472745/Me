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

// GET /login - returns error message (login is POST only)
router.get("/login", (req, res) => {
  return res.status(405).json({
    success: false,
    message: "Login endpoint requires POST request. Please use the frontend login form.",
  });
});

router.get("/logout",  logout);

export default router;