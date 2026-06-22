

// uploadToCloudinary.js
import axios from "axios";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file, onProgress = () => {}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  // Note: Cloudinary treats both audio and video files under the 'video' resource type endpoints
  const resourceType = file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("audio/")
    ? "video"
    : "image";

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    formData,
    {
      timeout: 0,
      onUploadProgress: (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      },
    }
  );

  return response.data; // Contains secure_url
};

export default uploadToCloudinary;