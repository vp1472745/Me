import express from "express";
import { getAnalyticsStats } from "../controller/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/stats", getAnalyticsStats);

export default router;
