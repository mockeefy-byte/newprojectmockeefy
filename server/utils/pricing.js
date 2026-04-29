import Category from "../models/Category.js";
import PricingRule from "../models/PricingRule.js";

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const findCategoryByName = async (categoryName) => {
  const name = String(categoryName || "IT").trim();
  return Category.findOne({
    name: { $regex: `^${escapeRegExp(name)}$`, $options: "i" },
  });
};

export const getDisplayPrice = async ({ categoryName, level, duration = 30 }) => {
  const durationNum = Number(duration) || 30;
  const normalizedLevel = String(level || "Intermediate").trim();
  const catDoc = await findCategoryByName(categoryName);

  if (catDoc) {
    const categoryRule = await PricingRule.findOne({
      categoryId: catDoc._id,
      skillId: null,
      level: normalizedLevel,
      duration: durationNum,
      price: { $gt: 0 },
    });

    if (categoryRule) {
      return {
        price: categoryRule.price,
        currency: categoryRule.currency || "INR",
        category: catDoc.name,
        level: normalizedLevel,
        source: "category-rule",
      };
    }

    if (catDoc.amount != null && Number(catDoc.amount) > 0) {
      return {
        price: durationNum === 30 ? catDoc.amount : Math.round(catDoc.amount * 1.8),
        currency: "INR",
        category: catDoc.name,
        level: normalizedLevel,
        source: "category-amount",
      };
    }
  }

  // Legacy/default pricing rows in existing databases may have categoryId null.
  const globalRule = await PricingRule.findOne({
    categoryId: null,
    skillId: null,
    level: normalizedLevel,
    duration: durationNum,
    price: { $gt: 0 },
  });

  if (globalRule) {
    return {
      price: globalRule.price,
      currency: globalRule.currency || "INR",
      category: catDoc?.name || String(categoryName || "IT").trim(),
      level: normalizedLevel,
      source: "global-rule",
    };
  }

  const activeCategoryIds = await Category.distinct("_id");
  const orphanedDefaultRule = await PricingRule.findOne({
    categoryId: { $nin: activeCategoryIds },
    skillId: null,
    level: normalizedLevel,
    duration: durationNum,
    price: { $gt: 0 },
  }).sort({ createdAt: 1 });

  if (orphanedDefaultRule) {
    return {
      price: orphanedDefaultRule.price,
      currency: orphanedDefaultRule.currency || "INR",
      category: catDoc?.name || String(categoryName || "IT").trim(),
      level: normalizedLevel,
      source: "legacy-default-rule",
    };
  }

  return {
    price: null,
    currency: "INR",
    category: catDoc?.name || String(categoryName || "IT").trim(),
    level: normalizedLevel,
    source: "missing",
  };
};
