// driveUpload.js (Interacts with Google Drive via Backend Proxy)
import imageCompression from "browser-image-compression";
import API from "../config/api.js";

const isImageFile = (file) => file.type.startsWith("image/");
const IMAGE_UPLOAD_TARGET_MB = 8.5;

const compressImageFile = async (file) => {
  if (!isImageFile(file)) return file;

  if (file.size <= 9 * 1024 * 1024) {
    return file;
  }

  return imageCompression(file, {
    maxSizeMB: IMAGE_UPLOAD_TARGET_MB,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    initialQuality: 0.85,
  });
};

export const uploadToDrive = async (file, onProgress = () => {}) => {
  const preparedFile = await compressImageFile(file);

  const formData = new FormData();
  formData.append("file", preparedFile);
  
  // Detect if video/audio or image to set subfolder on Google Drive
  const isVideoOrAudio = file.type.startsWith("video/") || file.type.startsWith("audio/");
  formData.append("subFolder", isVideoOrAudio ? "Videos" : "Images");

  const response = await API.post("/upload/public-asset", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 0,
    onUploadProgress: (event) => {
      const percent = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
      onProgress(percent);
    },
  });

  return {
    secure_url: response.data.url,
    public_id: response.data.public_id,
  };
};

export default uploadToDrive;
