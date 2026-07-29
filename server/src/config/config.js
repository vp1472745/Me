const isProd = process.env.NODE_ENV === "production";

export const config = {
  CLIENT_URL: isProd
    ? (process.env.PROD_CLIENT_URL || "https://me-lyart-xi.vercel.app")
    : (process.env.LOCAL_CLIENT_URL || process.env.CLIENT_URL || "http://localhost:5173"),

  SERVER_URL: isProd
    ? (process.env.PROD_SERVER_URL || "https://me-vp02.onrender.com")
    : (process.env.LOCAL_SERVER_URL || process.env.SERVER_URL || "http://localhost:5000"),

  GOOGLE_REDIRECT_URI: isProd
    ? (process.env.PROD_GOOGLE_REDIRECT_URI || "https://me-vp02.onrender.com/api/google/callback")
    : (process.env.LOCAL_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/google/callback"),
};

export default config;
