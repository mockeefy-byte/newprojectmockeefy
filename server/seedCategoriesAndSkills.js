/**
 * Seed dummy Categories and Skills for an IT company (mock interviews / consulting).
 * Does NOT delete users or sessions – only clears and reseeds Category + Skill.
 *
 * Run from server folder: node seedCategoriesAndSkills.js
 * Requires: MONGO_URI in .env
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Category from "./models/Category.js";
import Skill from "./models/Skill.js";
import { categoriesData, skillsData } from "./data/categoriesAndSkills.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Clear only Categories and Skills
    await Category.deleteMany({});
    await Skill.deleteMany({});
    console.log("Cleared existing Categories and Skills.\n");

    // 1. Create categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      const doc = await Category.create({
        name: cat.name,
        description: cat.description || "",
        type: "technical",
        status: "Active",
      });
      categoryMap[cat.name] = doc._id;
      console.log("Created Category:", cat.name);
    }

    // 2. Create skills under each category
    let totalSkills = 0;
    for (const [catName, skillNames] of Object.entries(skillsData)) {
      const catId = categoryMap[catName];
      if (!catId) {
        console.warn("Category not found for skills:", catName);
        continue;
      }
      for (const name of skillNames) {
        await Skill.create({
          name: name.trim(),
          categoryId: catId,
          isActive: true,
        });
        totalSkills++;
      }
      console.log("  Skills for", catName + ":", skillNames.length);
    }

    console.log("\nDone. Created", categoriesData.length, "categories and", totalSkills, "skills.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

run();
