import { BASE_URL } from "../config/api.js";

export const getCleanMediaUrl = (url) => {
  if (!url) return "";
  
  // If URL is an absolute/relative Google Drive proxy URL from any environment, dynamically rewrite it to the current environment
  if (url.includes("/google/file/")) {
    const parts = url.split("/");
    const fileId = parts[parts.length - 1];
    return `${BASE_URL}/google/file/${fileId}`;
  }

  // Check if this is a standard Google Drive sharing/view URL
  if (
    url.includes("drive.google.com/uc") || 
    url.includes("drive.google.com/open") || 
    url.includes("drive.google.com/file")
  ) {
    const match = url.match(/[?&]id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `${BASE_URL}/google/file/${fileId}`;
    }
  }

  // If it is just a local ID
  if (url.startsWith("local-")) {
    return `${BASE_URL}/google/file/${url}`;
  }

  return url;
};

export default getCleanMediaUrl;
