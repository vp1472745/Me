import express from "express";

import { upload } from "../../middleware/multer.js";

import {
  createPreWeddingStory,
  getAllPreWeddingStories,
  getSinglePreWeddingStory,
  deletePreWeddingStory,
} from "../../controller/adminController/preWeddingController.js";

const router = express.Router();

/* =========================
   ROUTES
========================= */

/* CREATE */

router.post(
  "/create",

  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "galleryImages",
      maxCount: 20,
    },
  ]),

  createPreWeddingStory
);

/* GET ALL */

router.get(
  "/all",
  getAllPreWeddingStories
);

/* GET SINGLE */

router.get(
  "/:id",
  getSinglePreWeddingStory
);

/* DELETE */

router.delete(
  "/delete/:id",
  deletePreWeddingStory
);

export default router;