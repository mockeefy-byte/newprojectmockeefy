import express from "express";
import {
  bulkUpsertPricingRules,
  getRulesByCategory,
  calculatePrice,
  getCalculatePrice,
  listSkillsWithPricing,
  updateSkillBasePrice,
} from "../controllers/pricingController.js";

const router = express.Router();

// Bulk Upsert Rules (legacy)
router.post("/bulk", bulkUpsertPricingRules);

// Get Rules by Category (with optional skillId or base=true query params)
router.get("/category/:categoryId", getRulesByCategory);

// Calculate Price (legacy POST)
router.post("/calculate", calculatePrice);

// ----- Dynamic pricing (skill + expert + duration) -----
// GET /api/pricing/calculate-price?skill=React&expertId=xxx&duration=60
router.get("/calculate-price", getCalculatePrice);

// ----- Admin: skill base prices -----
router.get("/skills", listSkillsWithPricing);
router.put("/skills/:skillId", updateSkillBasePrice);

export default router;
