// ==============================
// router/galleryRoutes.js
// ==============================

import express from "express";

import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

import {
  createGallery,
  getAllGalleries,
  getSingleGallery,
  deleteGallery,
} from "../controller/imageController.js";

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
      file
    ) => ({
      folder:
        "wedding_gallery",

      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp",
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

// CREATE GALLERY

router.post(
  "/create",
  upload.array("images", 20),
  createGallery
);


// GET ALL

router.get(
  "/all",
  getAllGalleries
);


// GET SINGLE

router.get(
  "/:id",
  getSingleGallery
);


// DELETE

router.delete(
  "/delete/:id",
  deleteGallery
);

export default router;