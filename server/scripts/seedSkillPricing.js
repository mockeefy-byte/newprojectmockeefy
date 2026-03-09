/**
 * Seed default basePrice30 for skills (dynamic pricing).
 * Run: node scripts/seedSkillPricing.js
 * Requires: MONGO_URI and existing Skills in DB (run seed_data.js first if needed).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Skill from "../models/Skill.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MONGO_URI is required in .env (mockeefy Atlas connection)");
    process.exit(1);
}

const DEFAULT_BASE_PRICES_30 = {
  "React JS": 300,
  "React": 300,
  "Node JS": 300,
  "Node": 300,
  "Java Spring": 350,
  "Java": 350,
  "Python Django": 350,
  "Python": 350,
  "System Design": 500,
  "JavaScript": 300,
  "Angular": 350,
  ".NET": 350,
  "AWS": 400,
  "Docker": 300,
  "Kubernetes": 400,
  "Communication": 250,
  "Behavioral Interview": 300,
  "Leadership": 350,
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    let updated = 0;
    for (const [nameOrPattern, basePrice30] of Object.entries(DEFAULT_BASE_PRICES_30)) {
      const result = await Skill.updateMany(
        { name: new RegExp(`^${nameOrPattern}$`, "i"), isActive: true },
        { $set: { basePrice30 } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ${nameOrPattern} → basePrice30 = ${basePrice30}`);
        updated += result.modifiedCount;
      }
    }

    console.log(`Done. Updated ${updated} skill(s) with base prices.`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
