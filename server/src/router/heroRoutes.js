import express from "express";

import {
  createHeroSection,
  getAllHeroSections,
  getSingleHeroSection,
  updateHeroSection,
  deleteHeroSection,
} from "../controller/heroController.js";

const router = express.Router();

// CREATE
router.post(
  "/create",
  createHeroSection
);

// GET ALL
router.get(
  "/all",
  getAllHeroSections
);

// GET SINGLE
router.get(
  "/:id",
  getSingleHeroSection
);

// UPDATE
router.put(
  "/update/:id",
  updateHeroSection
);

// DELETE
router.delete(
  "/delete/:id",
  deleteHeroSection
);

export default router;