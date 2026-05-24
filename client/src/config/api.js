import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: BASE_URL,
timeout: 180000 ,
  headers: {
    "Content-Type": "application/json",
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
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

// Get All Editors

export const getEditors = async () => {
  return API.get("/access/editors");
};

// Update Permissions

export const updateEditorPermissions =
  async (data) => {
    return API.put(
      "/access/permissions",
      data,
    );
  };













  // ==========================
// STORY APIs
// ==========================


// CREATE STORY

export const createStory =
  async (formData) => {

    return API.post(
      "/story/create",
      formData,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  };


// GET ALL STORIES

export const getAllStories =
  async () => {

    return API.get(
      "/story/all"
    );
  };


// GET SINGLE STORY

// GET SINGLE STORY
export const getSingleStory = async (id) => {
  return API.get(`/story/${id}`);
};


// DELETE STORY

export const deleteStory =
  async (id) => {

    return API.delete(
      `/story/delete/${id}`
    );
  };
// ==========================
// WEDDING STORY APIs
// ==========================

// CREATE WEDDING STORY

export const createWeddingStory =
  async (formData) => {

    return API.post(
      "/photo-book/create",
      formData,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  };


// GET ALL WEDDING STORIES

export const getAllWeddingStories =
  async () => {

    return API.get(
      "/photo-book/all"
    );
  };


// GET SINGLE WEDDING STORY

export const getSingleWeddingStory =
  async (id) => {

    return API.get(
      `/photo-book/${id}`
    );
  };


// DELETE WEDDING STORY

export const deleteWeddingStory =
  async (id) => {

    return API.delete(
      `/photo-book/delete/${id}`
    );
  };



  // ==============================
// services/api.js
// ==============================


// ==============================
// GALLERY APIs
// ==============================


// CREATE GALLERY

export const createGallery =
  async (formData) => {

    return API.post(
      "/image/create",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  };


// GET ALL GALLERIES

export const getAllGalleries =
  async () => {

    return API.get(
      "/image/all"
    );
  };


// GET SINGLE GALLERY

export const getSingleGallery =
  async (id) => {

    return API.get(
      `/image/${id}`
    );
  };


// DELETE GALLERY

export const deleteGallery =
  async (id) => {

    return API.delete(
      `/image/delete/${id}`
    );
  };














  // ==============================
// CREATE VIDEO
// ==============================

export const createVideo =
  async (formData) => {

    return await API.post(

      "/film/create",

      formData,

      {
        headers: {

          "Content-Type":
            "multipart/form-data",
        },
      },
    );
  };


// ==============================
// GET ALL VIDEOS
// ==============================

export const getAllVideos =
  async () => {

    return await API.get(
      "/film/all",
    );
  };


// ==============================
// GET SINGLE VIDEO
// ==============================

export const getSingleVideo =
  async (id) => {

    return await API.get(
      `/film/${id}`,
    );
  };


// ==============================
// UPDATE VIDEO
// ==============================

export const updateVideo =
  async (
    id,
    formData,
  ) => {

    return await API.put(

      `/film/update/${id}`,

      formData,

      {
        headers: {

          "Content-Type":
            "multipart/form-data",
        },
      },
    );
  };


// ==============================
// DELETE VIDEO
// ==============================

export const deleteVideo =
  async (id) => {

    return await API.delete(

      `/film/delete/${id}`,
    );
  };









  // preWedding api





  
export const createPreWeddingStory =
  async (formData) => {

    return API.post(
      "/pre-wedding/create",
      formData,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  };


// GET ALL PRE-WEDDING STORIES

export const getAllPreWeddingStories =
  async () => {

    return API.get(
      "/pre-wedding/all"
    );
  };


// GET SINGLE PRE-WEDDING STORY

export const getSinglePreWeddingStory =
  async (id) => {

    return API.get(
      `/pre-wedding/${id}`
    );
  };


// DELETE PRE-WEDDING STORY

export const deletePreWeddingStory =
  async (id) => {

    return API.delete(
      `/pre-wedding/delete/${id}`
    );
  };



export default API;