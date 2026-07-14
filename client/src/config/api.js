// import axios from "axios";

// const BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://me-vp02.onrender.com/api";

// console.log("BASE_URL =", BASE_URL);

// const API = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// // ==========================
// // Auth APIs
// // ==========================

// export const loginUser = async (data) => {
//   return API.post("/auth/login", data);
// };

// export const registerUser = async (data) => {
//   return API.post("/auth/register", data);
// };

// export const logoutUser = async () => {
//   return API.get("/auth/logout");
// };

// // ==========================
// // Access APIs
// // ==========================

// export const getEditors = async () => {
//   return API.get("/access/editors");
// };

// export const updateEditorPermissions = async (data) => {
//   return API.put("/access/permissions", data);
// };

// // ==========================
// // Hero Section APIs
// // ==========================

// export const createHeroSection = async (data) => {
//   return API.post("/hero/create", data);
// };

// export const getAllHeroSections = async () => {
//   return API.get("/hero/all");
// };

// export const getSingleHeroSection = async (id) => {
//   return API.get(`/hero/${id}`);
// };

// export const updateHeroSection = async (id, data) => {
//   return API.put(`/hero/update/${id}`, data);
// };

// export const deleteHeroSection = async (id) => {
//   return API.delete(`/hero/delete/${id}`);
// };

// // ==========================
// // Story APIs (UPDATED TO JSON)
// // ==========================

// export const createStory = async (data) => {
//   return API.post("/story/create", data);
// };

// export const getAllStories = async () => {
//   return API.get("/story/all");
// };

// export const getSingleStory = async (id) => {
//   return API.get(`/story/${id}`);
// };

// export const updateStory = async (id, data) => {
//   return API.put(`/story/update/${id}`, data);
// };

// export const deleteStory = async (id) => {
//   return API.delete(`/story/delete/${id}`);
// };

// // ==========================
// // Wedding Story APIs (UPDATED TO JSON)
// // ==========================

// export const createWeddingStory = async (data) => {
//   return API.post("/photo-book/create", data);
// };

// export const getAllWeddingStories = async () => {
//   return API.get("/photo-book/all");
// };

// export const getSingleWeddingStory = async (id) => {
//   return API.get(`/photo-book/${id}`);
// };

// export const updateWeddingStory = async (id, data) => {
//   return API.put(`/photo-book/update/${id}`, data);
// };

// export const deleteWeddingStory = async (id) => {
//   return API.delete(`/photo-book/delete/${id}`);
// };

// // ==========================
// // Gallery APIs (UPDATED TO JSON)
// // ==========================

// export const createGallery = async (data) => {
//   return API.post("/image/create", data);
// };

// export const getAllGalleries = async () => {
//   return API.get("/image/all");
// };

// export const getSingleGallery = async (id) => {
//   return API.get(`/image/${id}`);
// };

// export const updateGallery = async (id, data) => {
//   return API.put(`/image/update/${id}`, data);
// };

// export const deleteGallery = async (id) => {
//   return API.delete(`/image/delete/${id}`);
// };

// // ==========================
// // Video (Film) APIs (UPDATED TO JSON)
// // ==========================

// export const createVideo = async (data) => {
//   return API.post("/film/create", data);
// };

// export const getAllVideos = async () => {
//   return API.get("/film/all");
// };

// export const getSingleVideo = async (id) => {
//   return API.get(`/film/${id}`);
// };

// export const updateVideo = async (id, data) => {
//   return API.put(`/film/update/${id}`, data);
// };

// export const deleteVideo = async (id) => {
//   return API.delete(`/film/delete/${id}`);
// };

// // ==========================
// // Pre-Wedding Story APIs (UPDATED TO JSON)
// // ==========================

// export const createPreWeddingStory = async (data) => {
//   return API.post("/pre-wedding/create", data);
// };

// export const getAllPreWeddingStories = async () => {
//   return API.get("/pre-wedding/all");
// };

// export const getSinglePreWeddingStory = async (id) => {
//   return API.get(`/pre-wedding/${id}`);
// };

// export const updatePreWeddingStory = async (id, data) => {
//   return API.put(`/pre-wedding/update/${id}`, data);
// };

// export const deletePreWeddingStory = async (id) => {
//   return API.delete(`/pre-wedding/delete/${id}`);
// };





// // family access APIs

// export const createFamilyRequest = async (data) => {
//   return API.post("/family-access/request", data);
// };

// export const getMyFamilyRequests = async () => {
//   return API.get("/family-access/my-request");
// }

// export const getAllFamilyRequests = async () => {
//   return API.get("/family-access/all");
// }

// export const approveFamilyRequest = async (userId, requestId) => {
//   return API.put(`/family-access/approve/${userId}/${requestId}`);
// }

// export const rejectFamilyRequest = async (userId, requestId) => {
//   return API.put(`/family-access/reject/${userId}/${requestId}`);
// }








// export default API;





// src/config/api.js
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://me-vp02.onrender.com/api";

console.log("BASE_URL =", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// Auth APIs
// ==========================

// ==========================
// Send OTP
// ==========================

export const sendOTP = async (email) => {
  return API.post("/auth/send-otp", {
    email,
  });
};

// ==========================
// Register
// ==========================

export const registerUser = async (data) => {
  return API.post("/auth/register", data);
};

// Alias
export const createUser = registerUser;

// ==========================
// Login
// ==========================

export const loginUser = async (data) => {
  return API.post("/auth/login", data);
};

// ==========================
// Logout
// ==========================

export const logoutUser = async () => {
  return API.get("/auth/logout");
};

// ==========================
// Admin User Management APIs
// ==========================

export const getAdminUsers = async () => {
  return API.get("/auth/admin/users");
};

export const getAdminEditors = async () => {
  return API.get("/auth/admin/editors");
};

export const getAdminPendingUsers = async () => {
  return API.get("/auth/admin/pending");
};

export const approveUserRequest = async (userId) => {
  return API.post("/auth/admin/approve", { userId });
};

export const rejectUserRequest = async (userId) => {
  return API.post("/auth/admin/reject", { userId });
};
// ==========================
// Access APIs
// ==========================

export const getEditors = async () => {
  return API.get("/access/editors");
};

export const updateEditorPermissions = async (data) => {
  return API.put("/access/permissions", data);
};

// ==========================
// Hero Section APIs
// ==========================

export const createHeroSection = async (data) => {
  return API.post("/hero/create", data);
};

export const getAllHeroSections = async () => {
  return API.get("/hero/all");
};

export const getSingleHeroSection = async (id) => {
  return API.get(`/hero/${id}`);
};

export const updateHeroSection = async (id, data) => {
  return API.put(`/hero/update/${id}`, data);
};

export const deleteHeroSection = async (id) => {
  return API.delete(`/hero/delete/${id}`);
};

// ==========================
// Story APIs
// ==========================

export const createStory = async (data) => {
  return API.post("/story/create", data);
};

export const getAllStories = async () => {
  return API.get("/story/all");
};

export const getSingleStory = async (id) => {
  return API.get(`/story/${id}`);
};

export const updateStory = async (id, data) => {
  return API.put(`/story/update/${id}`, data);
};

export const deleteStory = async (id) => {
  return API.delete(`/story/delete/${id}`);
};

// ==========================
// Wedding Story APIs (Photo Books)
// ==========================

export const createWeddingStory = async (data) => {
  return API.post("/photo-book/create", data);
};

export const getAllWeddingStories = async () => {
  return API.get("/photo-book/all");
};

export const getSingleWeddingStory = async (id) => {
  return API.get(`/photo-book/${id}`);
};

export const updateWeddingStory = async (id, data) => {
  return API.put(`/photo-book/update/${id}`, data);
};

export const deleteWeddingStory = async (id) => {
  return API.delete(`/photo-book/delete/${id}`);
};

// ==========================
// Gallery APIs
// ==========================

export const createGallery = async (data) => {
  return API.post("/image/create", data);
};

export const getAllGalleries = async () => {
  return API.get("/image/all");
};

export const getSingleGallery = async (id) => {
  return API.get(`/image/${id}`);
};

export const updateGallery = async (id, data) => {
  return API.put(`/image/update/${id}`, data);
};

export const deleteGallery = async (id) => {
  return API.delete(`/image/delete/${id}`);
};

// ==========================
// Video (Film) APIs
// ==========================

export const createVideo = async (data) => {
  return API.post("/film/create", data);
};

export const getAllVideos = async () => {
  return API.get("/film/all");
};

export const getSingleVideo = async (id) => {
  return API.get(`/film/${id}`);
};

export const updateVideo = async (id, data) => {
  return API.put(`/film/update/${id}`, data);
};

export const deleteVideo = async (id) => {
  return API.delete(`/film/delete/${id}`);
};

// ==========================
// Pre-Wedding Story APIs
// ==========================

export const createPreWeddingStory = async (data) => {
  return API.post("/pre-wedding/create", data);
};

export const getAllPreWeddingStories = async () => {
  return API.get("/pre-wedding/all");
};

export const getSinglePreWeddingStory = async (id) => {
  return API.get(`/pre-wedding/${id}`);
};

export const updatePreWeddingStory = async (id, data) => {
  return API.put(`/pre-wedding/update/${id}`, data);
};

export const deletePreWeddingStory = async (id) => {
  return API.delete(`/pre-wedding/delete/${id}`);
};

// ==========================
// Family Access APIs
// ==========================

export const createFamilyRequest = async (data) => {
  return API.post("/family-access/request", data);
};

export const getMyFamilyRequests = async () => {
  return API.get("/family-access/my-request");
};

export const getAllFamilyRequests = async () => {
  return API.get("/family-access/all");
};

export const approveFamilyRequest = async (userId, requestId) => {
  return API.put(`/family-access/approve/${userId}/${requestId}`);
};

export const rejectFamilyRequest = async (userId, requestId) => {
  return API.put(`/family-access/reject/${userId}/${requestId}`);
};

// ==========================
// Photo Studio MERN Extensions APIs
// ==========================

// User Creation
export const createAdminUser = async (data) => {
  return API.post("/users/create-admin", data);
};

export const createEditorUser = async (data) => {
  return API.post("/users/create-editor", data);
};

export const createClientUser = async (data) => {
  return API.post("/users/create-user", data);
};

export const getAllDirectoryUsers = async (params) => {
  return API.get("/users", { params });
};

export const getPendingDirectoryUsers = async () => {
  return API.get("/users/pending");
};

export const approveDirectoryUser = async (data) => {
  return API.post("/users/approve", data);
};

export const rejectDirectoryUser = async (data) => {
  return API.post("/users/reject", data);
};

// Google Drive
export const connectGoogleDrive = async (userId) => {
  return API.get(`/google/connect/${userId}`);
};

export const getGoogleDriveStatus = async (userId) => {
  return API.get(`/google/status/${userId}`);
};

export const disconnectGoogleDrive = async (userId) => {
  return API.post(`/google/disconnect/${userId}`);
};

export const sendGoogleDriveLinkEmail = async (userId) => {
  return API.post(`/google/send-link/${userId}`);
};

// Work / Assignments
export const createWorkAssignment = async (data) => {
  return API.post("/work/create", data);
};

export const submitWorkDuration = async (data) => {
  return API.post("/work/duration", data);
};

export const approveWorkDuration = async (data) => {
  return API.post("/work/approve-duration", data);
};

export const completeWorkAssignment = async (data) => {
  return API.post("/work/complete", data);
};

export const getWorkAssignments = async () => {
  return API.get("/work");
};

export const getWorkHistoryLogs = async (params) => {
  return API.get("/work/history", { params });
};

// Uploads (Form Data required)
export const uploadFileToDrive = async (formData) => {
  return API.post("/upload/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadMultipleFilesToDrive = async (formData) => {
  return API.post("/upload/multiple", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Corrections
export const createCorrectionRequest = async (data) => {
  return API.post("/correction/create", data);
};

export const updateCorrectionRequest = async (formData) => {
  return API.post("/correction/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getCorrectionRequestHistory = async (fileId) => {
  return API.get("/correction/history", { params: { fileId } });
};

export const approveCorrectedImage = async (data) => {
  return API.post("/correction/approve", data);
};

export const getCorrectionsList = async () => {
  return API.get("/correction");
};

// Gallery
export const getGalleryDeliverables = async (params) => {
  return API.get("/gallery", { params });
};

export const downloadGalleryFile = async (fileId, workId) => {
  return API.get("/gallery/download", {
    params: { fileId, workId },
    responseType: "blob", // Important for file download streaming
  });
};

export const toggleFavoriteGalleryFile = async (data) => {
  return API.post("/gallery/favorite", data);
};

// Notifications
export const getNotifications = async () => {
  return API.get("/notification");
};

export const markNotificationRead = async (notificationId) => {
  return API.put(`/notification/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  return API.post("/notification/read-all");
};

// Analytics
export const getDashboardAnalytics = async () => {
  return API.get("/analytics/stats");
};

export default API;