
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import ExpertDetails from "./models/expertModel.js";
import Category from "./models/Category.js";
import Session from "./models/Session.js";
import Review from "./models/reviewModel.js";

// Load env vars
dotenv.config();

const clearDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Clear Categories (All)
        await Category.deleteMany({});
        console.log("Deleted all Categories.");

        // 2. Clear Sessions (All)
        // Check if session model works (if imported correctly)
        // If Session model isn't exported as default, we might have issues, but assuming standard export.
        try {
            await Session.deleteMany({});
            console.log("Deleted all Sessions.");
        } catch (e) {
            console.log("Error deleting sessions (might be empty or model issue):", e.message);
        }

        // 3. Clear Expert Details (All - they are linked to users usually)
        await ExpertDetails.deleteMany({});
        console.log("Deleted all Expert Profiles.");

        // 4. Clear Reviews (All)
        try {
            await Review.deleteMany({});
            console.log("Deleted all Reviews.");
        } catch (e) { console.log("Error deleting reviews:", e.message); }

        // 5. Clear Users (EXCEPT Admin)
        // We want to keep userType === 'admin'
        const result = await User.deleteMany({ userType: { $ne: 'admin' } });
        console.log(`Deleted ${result.deletedCount} Users (kept admins).`);

        console.log("Database cleared successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

clearDatabase();
