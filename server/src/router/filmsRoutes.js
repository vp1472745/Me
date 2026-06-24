import express from "express";
import { upload } from "../middleware/multer.js";
import {
  createVideo,
  getAllVideos,
  deleteVideo,
} from "../controller/filmsController.js";

const router = express.Router();

router.post("/create", upload.single("video"), createVideo);
router.get("/all", getAllVideos);
router.delete("/delete/:id", deleteVideo);

export default router;