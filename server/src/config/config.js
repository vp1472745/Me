// ==============================================================================
// FILE: src/config/config.js
// Environment-Aware Dynamic Configuration Matrix
// ==============================================================================
import "./loadEnv.js";

const isProd =
  process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// Helper to strip any trailing slashes so URL concatenation never creates double slashes
const cleanUrl = (url = "") => url.trim().replace(/\/+$/, "");

export const config = {
  isProd,
  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: cleanUrl(
    process.env.CLIENT_URL ||
      (isProd
        ? process.env.PROD_CLIENT_URL || "https://me-lyart-xi.vercel.app"
        : process.env.LOCAL_CLIENT_URL || "http://localhost:5173")
  ),

  SERVER_URL: cleanUrl(
    process.env.SERVER_URL ||
      (isProd
        ? process.env.PROD_SERVER_URL || "https://me-tkrs.onrender.com"
        : process.env.LOCAL_SERVER_URL || "http://localhost:5000")
  ),

  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    (isProd
      ? process.env.PROD_GOOGLE_REDIRECT_URI?.trim() ||
        "https://me-tkrs.onrender.com/api/google/callback"
      : process.env.LOCAL_GOOGLE_REDIRECT_URI?.trim() ||
        "http://localhost:5000/api/google/callback"),
};

export default config;
