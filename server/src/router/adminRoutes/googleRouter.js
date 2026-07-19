import express from "express";
import {
  connectDrive,
  driveCallback,
  driveStatus,
  disconnectDrive,
  sendDriveLinkEmail,
} from "../../controller/adminController/googleDriveController.js";
import { authMiddleware, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

// OAuth callback is public since Google redirects here
router.get("/callback", driveCallback);

// Other endpoints require authentication
router.use(authMiddleware);

router.get("/connect/:userId", adminOnly, connectDrive);
router.post("/send-link/:userId", adminOnly, sendDriveLinkEmail);
router.get("/status/:userId", driveStatus);
router.post("/disconnect/:userId", adminOnly, disconnectDrive);

export default router;
