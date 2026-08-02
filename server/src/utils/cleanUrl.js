import config from "../config/config.js";

/**
 * Transforms standard Google Drive URLs or local IDs into environment-aware backend proxy URLs
 */
export const getCleanMediaUrl = (url) => {
  if (!url) return "";
  
  // If it contains the local file indicator, format it
  if (url.includes("/google/file/")) {
    const parts = url.split("/");
    const fileId = parts[parts.length - 1];
    return `${config.SERVER_URL}/api/google/file/${fileId}`;
  }

  // Check standard google drive URL patterns
  if (
    url.includes("drive.google.com/uc") || 
    url.includes("drive.google.com/open") || 
    url.includes("drive.google.com/file")
  ) {
    const match = url.match(/[?&]id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      return `${config.SERVER_URL}/api/google/file/${match[1]}`;
    }
  }

  // If it is just a local ID
  if (url.startsWith("local-")) {
    return `${config.SERVER_URL}/api/google/file/${url}`;
  }

  return url;
};

export default getCleanMediaUrl;
