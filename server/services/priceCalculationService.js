/**
 * Dynamic pricing for mock interview bookings.
 * Formula: finalPrice = basePrice30 * levelMultiplier * durationMultiplier
 */

import mongoose from "mongoose";
import Skill from "../models/Skill.js";
import ExpertDetails from "../models/expertModel.js";

/** Expert level → multiplier (junior 1, mid 1.5, senior 2) */
export const LEVEL_MULTIPLIERS = {
  junior: 1,
  mid: 1.5,
  senior: 2,
};

/** Duration (minutes) → multiplier. 30 min = 1, 60 min = 1.8 */
export const DURATION_MULTIPLIERS = {
  30: 1,
  60: 1.8,
};

/**
 * Normalize expert level string to our tier (junior | mid | senior).
 * Expert model may have: adminMappings.level (Junior, Mid, Senior) or professionalDetails.level (Beginner, Intermediate, Advanced).
 */
export function normalizeExpertLevel(level) {
  if (!level || typeof level !== "string") return "junior";
  const L = level.trim().toLowerCase();
  if (L === "junior" || L === "beginner") return "junior";
  if (L === "mid" || L === "intermediate" || L === "medium") return "mid";
  if (L === "senior" || L === "advanced" || L === "expert" || L === "principal" || L === "architect") return "senior";
  return "junior";
}

/**
 * Get level multiplier for an expert document.
 * Checks adminMappings.level then professionalDetails.level.
 */
export function getExpertLevelMultiplier(expertDoc) {
  const level =
    expertDoc?.adminMappings?.level ||
    expertDoc?.professionalDetails?.level ||
    "";
  const tier = normalizeExpertLevel(level);
  return LEVEL_MULTIPLIERS[tier] ?? 1;
}

/**
 * Get duration multiplier. Only 30 and 60 are supported.
 */
export function getDurationMultiplier(durationMinutes) {
  const d = Number(durationMinutes);
  return DURATION_MULTIPLIERS[d] ?? (d === 30 ? 1 : d === 60 ? 1.8 : 1);
}

/**
 * Fetch skill base price for 30 min by skillId (ObjectId) or skill name (string).
 * @returns { Promise<{ basePrice30: number, skillId: ObjectId, skillName: string } | null> }
 */
export async function getSkillBasePrice(skillIdOrName) {
  if (!skillIdOrName) return null;

  let skill = null;
  if (mongoose.Types.ObjectId.isValid(skillIdOrName) && String(skillIdOrName).length === 24) {
    skill = await Skill.findOne({ _id: skillIdOrName, isActive: true }).lean();
  } else {
    const name = String(skillIdOrName).trim();
    skill = await Skill.findOne({ name: new RegExp(`^${name}$`, "i"), isActive: true }).lean();
  }

  if (!skill) return null;
  const basePrice30 = skill.basePrice30 != null ? Number(skill.basePrice30) : null;
  return {
    skillId: skill._id,
    skillName: skill.name,
    basePrice30,
  };
}

/**
 * Fetch expert by expertId (ExpertDetails._id or userId).
 */
export async function getExpertById(expertId) {
  if (!expertId) return null;
  const id = expertId.toString().trim();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const expert = await ExpertDetails.findOne({
    $or: [{ _id: id }, { userId: id }],
  }).lean();
  return expert;
}

/**
 * Calculate final price.
 * finalPrice = basePrice30 * levelMultiplier * durationMultiplier
 */
export function calculateFinalPrice(basePrice30, levelMultiplier, durationMultiplier) {
  const base = Number(basePrice30) || 0;
  const level = Number(levelMultiplier) || 1;
  const duration = Number(durationMultiplier) || 1;
  return Math.round(base * level * duration);
}

/**
 * Full calculation for booking: skill + expert + duration.
 * @returns { Promise<{ basePrice, expertLevel, duration, finalPrice, skillName } | { error }> }
 */
export async function calculateBookingPrice(skillIdOrName, expertId, durationMinutes) {
  const duration = Number(durationMinutes);
  if (![30, 60].includes(duration)) {
    return { error: "Duration must be 30 or 60 minutes" };
  }

  const skillResult = await getSkillBasePrice(skillIdOrName);
  if (!skillResult) {
    return { error: "Skill not found" };
  }
  if (skillResult.basePrice30 == null || skillResult.basePrice30 < 0) {
    return { error: "Skill has no base price configured (basePrice30)" };
  }

  const expert = await getExpertById(expertId);
  if (!expert) {
    return { error: "Expert not found" };
  }

  const levelMultiplier = getExpertLevelMultiplier(expert);
  const durationMultiplier = getDurationMultiplier(duration);
  const tier = normalizeExpertLevel(expert?.adminMappings?.level || expert?.professionalDetails?.level || "");

  const finalPrice = calculateFinalPrice(
    skillResult.basePrice30,
    levelMultiplier,
    durationMultiplier
  );

  return {
    basePrice: skillResult.basePrice30,
    expertLevel: tier,
    duration,
    finalPrice,
    skillName: skillResult.skillName,
    levelMultiplier,
    durationMultiplier,
  };
}
