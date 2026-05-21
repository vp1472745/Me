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

export default API;