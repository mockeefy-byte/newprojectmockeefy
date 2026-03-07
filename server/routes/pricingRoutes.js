import express from "express";
import { bulkUpsertPricingRules, getRulesByCategory, calculatePrice } from "../controllers/pricingController.js";

const router = express.Router();

// Bulk Upsert Rules
router.post("/bulk", bulkUpsertPricingRules);

// Get Rules by Category (with optional skillId or base=true query params)
router.get("/category/:categoryId", getRulesByCategory);

// Calculate Price (Public)
router.post("/calculate", calculatePrice);

export default router;
