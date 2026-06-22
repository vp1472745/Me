// ======================================================
// FILE: config/cloudinary.js
// ======================================================
import { v2 as cloudinary } from "cloudinary";

// Safely configure Cloudinary mapping utilizing standard environment injections
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME||'dzopb3luc',
  api_key: process.env.CLOUDINARY_API_KEY||'268212947317322',
  api_secret: process.env.CLOUDINARY_API_SECRET||'uuGoz4k1R6OH1KuuzD9Ar3Cdccs',
  secure: true, // Secure URL parsing injection layer
});

// Structural check to prevent quiet failure on runtime deployment
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("⚠️ CRITICAL FAILURE: CLOUDINARY_CLOUD_NAME environment variable is missing!");
} else {
  console.log("🚀 Cloudinary pipeline verified under tracking space:", process.env.CLOUDINARY_CLOUD_NAME);
}

export default cloudinary;