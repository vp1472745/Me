const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

export const config = {
  CLIENT_URL: isProd
    ? (process.env.PROD_CLIENT_URL?.trim() || "https://me-lyart-xi.vercel.app")
    : (process.env.LOCAL_CLIENT_URL?.trim() || process.env.CLIENT_URL?.trim() || "http://localhost:5173"),

  SERVER_URL: isProd
    ? (process.env.PROD_SERVER_URL?.trim() || "https://me-vp02.onrender.com")
    : (process.env.LOCAL_SERVER_URL?.trim() || process.env.SERVER_URL?.trim() || "http://localhost:5000"),

  GOOGLE_REDIRECT_URI: isProd
    ? (process.env.PROD_GOOGLE_REDIRECT_URI?.trim() || "https://me-vp02.onrender.com/api/google/callback")
    : (process.env.LOCAL_GOOGLE_REDIRECT_URI?.trim() || process.env.GOOGLE_REDIRECT_URI?.trim() || "http://localhost:5000/api/google/callback"),
};

export default config;
