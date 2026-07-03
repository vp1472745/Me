import express from "express";
import {
  createFamilyRequest,
  getMyFamilyRequests,
  getAllFamilyRequests,
  approveFamilyRequest,
  rejectFamilyRequest,
} from "../controller/familyAccessController.js";

import {
  authMiddleware,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// User Routes
// ==========================

// Create Family Request
router.post("/request", authMiddleware, createFamilyRequest);

// Get Logged In User Requests
router.get("/my-requests", authMiddleware, getMyFamilyRequests);

// ==========================
// Admin Routes
// ==========================

// Get All Family Requests
router.get("/all-requests", authMiddleware, adminOnly, getAllFamilyRequests);

// Approve Request
router.put(
  "/approve/:userId/:requestId",
  authMiddleware,
  adminOnly,
  approveFamilyRequest
);

// Reject Request
router.put(
  "/reject/:userId/:requestId",
  authMiddleware,
  adminOnly,
  rejectFamilyRequest
);

export default router;