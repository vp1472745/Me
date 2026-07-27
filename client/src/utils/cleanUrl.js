// src/utils/cleanUrl.js

export const getCleanMediaUrl = (url) => {
  if (!url) return "";
  
  // Check if this is a standard Google Drive sharing/view URL
  if (
    url.includes("drive.google.com/uc") || 
    url.includes("drive.google.com/open") || 
    url.includes("drive.google.com/file")
  ) {
    const match = url.match(/[?&]id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      return `${baseUrl}/google/file/${fileId}`;
    }
  }
  return url;
};

export default getCleanMediaUrl;
