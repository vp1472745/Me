import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
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

export default API;