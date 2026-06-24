import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"; // Default to localhost if not set in .env

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

export const loginUser = async (data) => {
  return API.post("/auth/login", data);
};

export const registerUser = async (data) => {
  return API.post("/auth/register", data);
};

export const logoutUser = async () => {
  return API.get("/auth/logout");
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
// Story APIs (UPDATED TO JSON)
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
// Wedding Story APIs (UPDATED TO JSON)
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
// Gallery APIs (UPDATED TO JSON)
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
// Video (Film) APIs (UPDATED TO JSON)
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
// Pre-Wedding Story APIs (UPDATED TO JSON)
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

export default API;