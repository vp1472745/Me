import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";


// IMAGE STORAGE

const imageStorage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => ({
      folder: "stories/images",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],

      resource_type: "image",
    }),
  });


// VIDEO STORAGE

const videoStorage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => ({
      folder: "stories/videos",

      resource_type: "video",

      allowed_formats: [
        "mp4",
        "mov",
        "avi",
        "webm",
      ],
    }),
  });


// AUDIO STORAGE

const audioStorage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => ({
      folder: "stories/audio",

      resource_type: "video",

      allowed_formats: [
        "mp3",
        "wav",
      ],
    }),
  });


// IMAGE UPLOAD

export const uploadImages =
  multer({
    storage: imageStorage,
  });


// VIDEO UPLOAD

export const uploadVideos =
  multer({
    storage: videoStorage,
  });


// AUDIO UPLOAD

export const uploadAudio =
  multer({
    storage: audioStorage,
  });