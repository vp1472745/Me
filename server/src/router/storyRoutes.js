import express from "express";
import {
  createStory,
  getAllStories,
  getSingleStory,
  updateStory,
  deleteStory,
} from "../controller/storyController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

/* =========================
   ROUTING MATRIX ENTRIES (Clean JSON Handlers)
========================= */
router.post("/create", (req, res, next) => {
  console.log("👉 DEBUG RAW HEADERS:", req.headers["content-type"]);
  console.log("👉 DEBUG RECEIVED BODY:", req.body);
  next();
}, createStory);
router.get("/all", getAllStories);
router.get("/:id", getSingleStory);
router.put("/update/:id", (req, res, next) => {
  console.log("👉 DEBUG RAW HEADERS:", req.headers["content-type"]);
  console.log("👉 DEBUG RECEIVED BODY:", req.body);
  next();
}, updateStory); // Multer middleware removed
router.delete("/delete/:id", (req, res, next) => {
  console.log("👉 DEBUG RAW HEADERS:", req.headers["content-type"]);
  console.log("👉 DEBUG RECEIVED BODY:", req.body);
  next();
}, deleteStory);

export default router;