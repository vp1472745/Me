import express from "express";
import { upload } from "../middleware/multer.js";
import { createGallery, getAllGalleries, getSingleGallery, deleteGallery } from "../controller/imageController.js";

const router = express.Router();

// Route: POST /api/gallery/create
// Ensure multer limits in your middleware/multer.js allow up to 10MB-15MB 
// taaki cloud upload me dikkat na aaye.
router.post("/create", upload.array("images", 20), createGallery);
router.get("/all", getAllGalleries);
router.get("/:id", getSingleGallery);
router.delete("/delete/:id", deleteGallery);

export default router;