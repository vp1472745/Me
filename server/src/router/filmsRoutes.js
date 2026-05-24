import express from "express";

import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary
  from "../config/cloudinary.js";

import {

  createVideo,

  getAllVideos,

  deleteVideo,

} from "../controller/filmsController.js";

const router =
  express.Router();


// ==============================
// CLOUDINARY STORAGE
// ==============================

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file,
    ) => ({

      folder:
        "wedding_films",

      resource_type:
        "video",

      allowed_formats: [
        "mp4",
        "mov",
        "avi",
      ],
    }),
  });

const upload =
  multer({
    storage,
  });


// ==============================
// ROUTES
// ==============================

router.post(

  "/create",

  upload.single("video"),

  createVideo,
);

router.get(
  "/all",
  getAllVideos,
);

router.delete(
  "/delete/:id",
  deleteVideo,
);

export default router;