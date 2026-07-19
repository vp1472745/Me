import express from "express";
import {
  createWork,
  submitDuration,
  approveDuration,
  completeWork,
  getWorkList,
  getHistoryLogs,
  muteProjectAlarm,
} from "../controller/adminController/workController.js";
import { authMiddleware, adminOnly, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Admin Only routes
router.post("/create", adminOnly, createWork);
router.post("/assign", adminOnly, createWork); // Alias
router.post("/approve-duration", adminOnly, approveDuration);
router.post("/mute-alarm", adminOnly, muteProjectAlarm);

// Editor Only routes
router.post("/duration", roleMiddleware("EDITOR"), submitDuration);
router.post("/complete", roleMiddleware("EDITOR"), completeWork);
router.post("/start", roleMiddleware("EDITOR"), (req, res) => {
  // Automatically handled during duration approval, return success
  return res.status(200).json({ success: true, message: "Project started." });
});

// Shared routes
router.get("/history", getHistoryLogs);
router.get("/", getWorkList);

export default router;
