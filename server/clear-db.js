/**
 * Clear entire mockeefy database: all users and all data.
 * Uses MONGO_URI from .env (must point to mockeefy DB).
 *
 * Run: node clear-db.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import ExpertDetails from "./models/expertModel.js";
import Category from "./models/Category.js";
import Session from "./models/Session.js";
import Review from "./models/reviewModel.js";
import Skill from "./models/Skill.js";
import PricingRule from "./models/PricingRule.js";
import SavedExpert from "./models/SavedExpert.js";
import Notification from "./models/Notification.js";
import Otp from "./models/Otp.js";
import Meeting from "./models/Meeting.js";
import Report from "./models/Report.js";
import AiSession from "./models/AiSession.js";

dotenv.config();

const clearDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB (mockeefy)...");

        const models = [
            [Session, "Sessions"],
            [Meeting, "Meetings"],
            [Report, "Reports"],
            [Review, "Reviews"],
            [AiSession, "AiSessions"],
            [SavedExpert, "SavedExperts"],
            [Notification, "Notifications"],
            [ExpertDetails, "ExpertDetails"],
            [PricingRule, "PricingRules"],
            [Category, "Categories"],
            [Skill, "Skills"],
            [Otp, "Otps"],
            [User, "Users"],
        ];

        for (const [Model, name] of models) {
            try {
                const result = await Model.deleteMany({});
                console.log(`Deleted ${result.deletedCount} ${name}.`);
            } catch (e) {
                console.log(`Error clearing ${name}:`, e.message);
            }
        }

        console.log("Database cleared successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

clearDatabase();
