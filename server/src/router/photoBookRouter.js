import express from "express";

import {
  createWeddingStory,
  getAllWeddingStories,
  getSingleWeddingStory,
  deleteWeddingStory,
} from "../controller/photoBookcontroller.js";

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
      folder: "wedding-stories",

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

  createWeddingStory
);

/* GET ALL */

router.get(
  "/all",
  getAllWeddingStories
);

/* GET SINGLE */

router.get(
  "/:id",
  getSingleWeddingStory
);

/* DELETE */

router.delete(
  "/delete/:id",
  deleteWeddingStory
);

export default router;