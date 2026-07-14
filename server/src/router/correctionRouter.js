import express from "express";
import {
  createCorrection,
  updateCorrection,
  getCorrectionHistory,
  approveImage,
  getCorrectionsList,
} from "../controller/correctionController.js";
import { uploadMiddleware } from "../controller/uploadController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Endpoint mappings
router.post("/create", roleMiddleware("USER"), createCorrection);
router.post("/update", uploadMiddleware.single("file"), updateCorrection); // POST for multipart uploads
router.get("/history", getCorrectionHistory);
router.post("/approve", roleMiddleware("USER"), approveImage);
router.get("/", getCorrectionsList);

export default router;
