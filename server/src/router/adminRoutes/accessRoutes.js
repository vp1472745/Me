import express from "express";

import {
  getAllEditors,
  updatePermissions,
} from "../../controller/adminController/accessController.js";

const router = express.Router();

// ==========================
// Routes
// ==========================

// Get Editors

router.get(
  "/editors",
  getAllEditors,
);

// Update Permissions

router.put(
  "/permissions",
  updatePermissions,
);

export default router;