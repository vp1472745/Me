import express from "express";

import {
  sendOTP,
  register,
  login,
  logout,
  getAllUsers,
  getAllEditors,
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../controller/authController.js";

import {
  authMiddleware,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Public Routes
// ==========================

// Send OTP
router.post("/send-otp", sendOTP);

// Register (OTP Verification Required)
router.post("/register", register);

// Login
router.post("/login", login);

// Login GET Not Allowed
router.get("/login", (req, res) => {
  return res.status(405).json({
    success: false,
    message:
      "Login endpoint requires POST request. Please use the frontend login form.",
  });
});

// ==========================
// Protected Routes
// ==========================

// Logout
router.get("/logout", authMiddleware, logout);

// ==========================
// Admin Protected Routes
// ==========================

// Get All Users (Role = USER)
router.get("/admin/users", authMiddleware, adminOnly, getAllUsers);

// Get All Editors (Role = EDITOR)
router.get("/admin/editors", authMiddleware, adminOnly, getAllEditors);

// Get Pending Approval Users (Status = PENDING)
router.get("/admin/pending", authMiddleware, adminOnly, getPendingUsers);

// Approve User
router.post("/admin/approve", authMiddleware, adminOnly, approveUser);

// Reject User
router.post("/admin/reject", authMiddleware, adminOnly, rejectUser);

export default router;