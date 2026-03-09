import PricingRule from "../models/PricingRule.js";
import Category from "../models/Category.js";
import * as priceCalculationService from "../services/priceCalculationService.js";
import Skill from "../models/Skill.js";

/* -------------------- Bulk Upsert Pricing Rules -------------------- */
export const bulkUpsertPricingRules = async (req, res) => {
    try {
        const { rules } = req.body;

        if (!rules || !Array.isArray(rules) || rules.length === 0) {
            return res.status(400).json({ success: false, message: "No rules provided" });
        }

        const operations = rules.map(rule => {
            const { categoryId, skillId, level, duration, price, currency } = rule;

            // Define filter: unique combo of category, skill, level, duration
            // Note: skillId can be null, we explicitly query for it.
            const filter = {
                categoryId,
                skillId: skillId || null,
                level,
                duration
            };

            const update = { price, currency: currency || 'INR' };

            return {
                updateOne: {
                    filter,
                    update,
                    upsert: true
                }
            };
        });

        await PricingRule.bulkWrite(operations);

        res.json({ success: true, message: "Pricing rules updated successfully" });
    } catch (error) {
        console.error("Bulk Upsert Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* -------------------- Get Rules by Category -------------------- */
export const getRulesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { skillId, base } = req.query;

        let query = { categoryId };

        if (base === 'true') {
            query.skillId = null;
        } else if (skillId) {
            query.skillId = skillId;
        }

        const rules = await PricingRule.find(query);
        res.json(rules);
    } catch (error) {
        console.error("Get Rules Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* -------------------- Calculate Price (Public/Booking) - legacy POST -------------------- */
export const calculatePrice = async (req, res) => {
    try {
        let { categoryId, skillId, level, duration } = req.body;

        if (!categoryId || !level || !duration) {
            return res.status(400).json({ success: false, message: "Missing filtering criteria" });
        }

        // Resolve Category ID if name is passed
        if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            const categoryDoc = await Category.findOne({ name: categoryId });
            if (categoryDoc) {
                categoryId = categoryDoc._id;
            } else {
                return res.status(404).json({ success: false, message: "Category not found" });
            }
        }

        // 1. Try to find specific skill price
        let priceRule = null;
        if (skillId) {
            priceRule = await PricingRule.findOne({ categoryId, skillId, level, duration: Number(duration) });
        }

        // 2. If no skill price, find category base price
        if (!priceRule) {
            priceRule = await PricingRule.findOne({ categoryId, skillId: null, level, duration: Number(duration) });
        }

        if (!priceRule) {
            return res.status(404).json({ success: false, message: "Pricing not configured for this selection" });
        }

        res.json({ success: true, price: priceRule.price, currency: priceRule.currency });
    } catch (error) {
        console.error("Calculate Price Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* -------------------- GET /calculate-price (dynamic: skill + expert + duration) -------------------- */
export const getCalculatePrice = async (req, res) => {
    try {
        const { skill, expertId, duration } = req.query;
        if (!skill || !expertId || !duration) {
            return res.status(400).json({
                success: false,
                message: "Missing required query params: skill, expertId, duration",
            });
        }
        const result = await priceCalculationService.calculateBookingPrice(skill, expertId, duration);
        if (result.error) {
            const status = result.error === "Skill not found" || result.error === "Expert not found" ? 404 : 400;
            return res.status(status).json({ success: false, message: result.error });
        }
        res.json({
            success: true,
            basePrice: result.basePrice,
            expertLevel: result.expertLevel,
            duration: result.duration,
            finalPrice: result.finalPrice,
            skillName: result.skillName,
            levelMultiplier: result.levelMultiplier,
            durationMultiplier: result.durationMultiplier,
        });
    } catch (error) {
        console.error("Get Calculate Price Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* -------------------- Admin: List skills with base prices -------------------- */
export const listSkillsWithPricing = async (req, res) => {
    try {
        const skills = await Skill.find({ isActive: true })
            .select("name categoryId basePrice30")
            .populate("categoryId", "name")
            .lean();
        res.json({ success: true, data: skills });
    } catch (error) {
        console.error("List Skills Pricing Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* -------------------- Admin: Update skill base price (basePrice30) -------------------- */
export const updateSkillBasePrice = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { basePrice30 } = req.body;
        if (basePrice30 == null || Number(basePrice30) < 0) {
            return res.status(400).json({ success: false, message: "basePrice30 is required and must be >= 0" });
        }
        const skill = await Skill.findByIdAndUpdate(
            skillId,
            { basePrice30: Number(basePrice30) },
            { new: true }
        );
        if (!skill) {
            return res.status(404).json({ success: false, message: "Skill not found" });
        }
        res.json({
            success: true,
            message: "Skill base price updated",
            data: { skillId: skill._id, skillName: skill.name, basePrice30: skill.basePrice30 },
        });
    } catch (error) {
        console.error("Update Skill Base Price Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

