import express from "express";
import {
  getGallery,
  downloadFile,
  toggleFavorite,
} from "../../controller/adminController/galleryController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Endpoint routes mapping
router.get("/", getGallery);
router.get("/download", downloadFile);
router.post("/favorite", toggleFavorite);

export default router;
