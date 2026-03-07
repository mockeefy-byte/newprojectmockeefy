import express from "express";
import { getExpertReviews } from "../controllers/reviewController.js";

const router = express.Router();

// Get reviews for a specific expert
// Public route (anyone can view reviews)
router.get("/expert/:expertId", getExpertReviews);

export default router;
