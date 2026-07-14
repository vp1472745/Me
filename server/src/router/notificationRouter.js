import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controller/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/:notificationId/read", markAsRead);
router.post("/read-all", markAllAsRead);

export default router;
