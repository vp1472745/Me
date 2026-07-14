import express from "express";
import {
  createAdmin,
  createEditor,
  createUser,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../controller/userController.js";
import { authMiddleware, adminOnly, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user management routes require auth
router.use(authMiddleware);

// Admin Only endpoints
router.post("/create-admin", adminOnly, createAdmin);
router.post("/create-editor", adminOnly, createEditor);
router.get("/pending", adminOnly, getPendingUsers);
router.post("/approve", adminOnly, approveUser);
router.post("/reject", adminOnly, rejectUser);

// Admin & Editor endpoints
router.post("/create-user", roleMiddleware("ADMIN", "EDITOR"), createUser);
router.get("/", roleMiddleware("ADMIN", "EDITOR"), getAllUsers);

export default router;
