import express from "express";
// Ab multer middleware ki zarurat yahan nahi hai kyunki frontend se strings (URLs) aa rahi hain
import {
  createWeddingStory,
  getAllWeddingStories,
  getSingleWeddingStory,
  deleteWeddingStory,
} from "../../controller/adminController/photoBookcontroller.js";

const router = express.Router();

/* =========================
    ROUTES
========================= */

// CREATE - Ab yeh normal JSON request accept karega
router.post(
  "/create",
  createWeddingStory
);

// GET ALL
router.get(
  "/all",
  getAllWeddingStories
);

// GET SINGLE
router.get(
  "/:id",
  getSingleWeddingStory
);

// DELETE
router.delete(
  "/delete/:id",
  deleteWeddingStory
);

export default router;