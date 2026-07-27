import express from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadMiddleware,
  uploadPublicAsset,
} from "../../controller/adminController/uploadController.js";
import { authMiddleware, roleMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Upload routes require authenticated ADMIN or EDITOR role
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN", "EDITOR"));

// Route mappings
router.post("/photo", uploadMiddleware.single("file"), uploadSingleFile);
router.post("/video", uploadMiddleware.single("file"), uploadSingleFile);
router.post("/multiple", uploadMiddleware.array("files", 20), uploadMultipleFiles);
router.post("/public-asset", uploadMiddleware.single("file"), uploadPublicAsset);

export default router;
