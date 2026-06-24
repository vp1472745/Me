import multer from "multer";
import pkg from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const mimeType = file.mimetype;

    // IMAGE
    if (mimeType.startsWith("image/")) {
      return {
        folder: "stories/images",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }

    // VIDEO
    if (mimeType.startsWith("video/")) {
      return {
        folder: "stories/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "webm", "mkv"],
      };
    }

    // AUDIO
    if (mimeType.startsWith("audio/")) {
      return {
        folder: "stories/audio",
        resource_type: "video", // Cloudinary treats audio as 'video' resource type
        allowed_formats: ["mp3", "wav", "aac", "m4a"],
      };
    }

    throw new Error("Unsupported file type");
  },
});

export const upload = multer({
  storage,
  // ✅ No `limits` – removes file size restriction
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      // Videos
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/x-matroska",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/aac",
      "audio/mp4",
      "audio/x-m4a",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image, video and audio files are allowed"), false);
    }
  },
});