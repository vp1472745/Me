

// uploadToCloudinary.js
import axios from "axios";
import imageCompression from "browser-image-compression";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024;
const CHUNK_SIZE = 6 * 1024 * 1024;
const IMAGE_UPLOAD_TARGET_MB = 8.5;

const getResourceType = (file) => {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "video";
  return "image";
};

const getUploadUrl = (resourceType) =>
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

const isImageFile = (file) => file.type.startsWith("image/");

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

const uploadChunked = async (file, resourceType, onProgress) => {
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const uploadUrl = getUploadUrl(resourceType);
  let offset = 0;
  let lastResponse = null;

  while (offset < file.size) {
    const end = Math.min(offset + CHUNK_SIZE, file.size);
    const chunk = file.slice(offset, end);
    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(uploadUrl, formData, {
      timeout: 0,
      headers: {
        "X-Unique-Upload-Id": uploadId,
        "Content-Range": `bytes ${offset}-${end - 1}/${file.size}`,
      },
      onUploadProgress: (event) => {
        const chunkProgress = event.total ? event.loaded / event.total : 0;
        const uploadedBytes = offset + chunkProgress * (end - offset);
        const percent = Math.min(99, Math.round((uploadedBytes * 100) / file.size));
        onProgress(percent);
      },
    });

    lastResponse = response.data;
    offset = end;
    onProgress(Math.min(100, Math.round((offset * 100) / file.size)));
  }

  return lastResponse;
};

export const uploadToCloudinary = async (file, onProgress = () => {}) => {
  const preparedFile = await compressImageFile(file);
  const resourceType = getResourceType(preparedFile);

  if (preparedFile.size > LARGE_FILE_THRESHOLD) {
    return uploadChunked(preparedFile, resourceType, onProgress);
  }

  const formData = new FormData();
  formData.append("file", preparedFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await axios.post(getUploadUrl(resourceType), formData, {
    timeout: 0,
    onUploadProgress: (event) => {
      const percent = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
      onProgress(percent);
    },
  });

  return response.data;
};

export default uploadToCloudinary;