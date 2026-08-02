export const getCleanMediaUrl = (url) => {
  if (!url) return "";
  
  // If URL is an absolute/relative Google Drive proxy URL from any environment, dynamically rewrite it to the current environment
  if (url.includes("/google/file/")) {
    const parts = url.split("/");
    const fileId = parts[parts.length - 1];
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (isLocal ? "http://localhost:5000/api" : "https://me-vp02.onrender.com/api");
    return `${baseUrl}/google/file/${fileId}`;
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
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        (isLocal ? "http://localhost:5000/api" : "https://me-vp02.onrender.com/api");
      return `${baseUrl}/google/file/${fileId}`;
    }
  }
  return url;
};

export default getCleanMediaUrl;
