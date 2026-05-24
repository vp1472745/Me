import express from "express";

import {
  createPreWeddingStory,
  getAllPreWeddingStories,
  getSinglePreWeddingStory,
  deletePreWeddingStory,
} from "../controller/preWeddingController.js";

import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* =========================
   CLOUDINARY STORAGE
========================= */

const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => ({
      folder: "pre-wedding-stories",

      resource_type: "image",

      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp",
      ],
    }),
  });

const upload = multer({
  storage,
});

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