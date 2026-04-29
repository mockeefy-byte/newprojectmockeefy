/**
 * Clear all non-admin data from the mockeefy database.
 * Keeps: Admin users, Categories, Skills, PricingRules
 * Deletes: Regular users (experts & candidates), Experts, Meetings, Sessions, Reviews, Certificates, SavedExperts, Notifications, OTPs, Reports, AiSessions
 * 
 * Uses MONGO_URI from .env – be very sure it points to the correct database before running.
 *
 * Run from the /server folder:
 *   node clear-expert-data.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import ExpertDetails from "./models/expertModel.js";
import Session from "./models/Session.js";
import Review from "./models/reviewModel.js";
import SavedExpert from "./models/SavedExpert.js";
import Notification from "./models/Notification.js";
import Otp from "./models/Otp.js";
import Meeting from "./models/Meeting.js";
import Report from "./models/Report.js";
import AiSession from "./models/AiSession.js";

dotenv.config();

const clearExpertData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB (mockeefy)...");
    console.log("\n=== Starting data cleanup (keeping admin data) ===\n");

    // Step 1: Delete all non-admin users (experts and candidates)
    try {
      const result = await User.deleteMany({ userType: { $ne: "admin" } });
      console.log(`✓ Deleted ${result.deletedCount} non-admin users (experts & candidates)`);
    } catch (e) {
      console.log(`✗ Error deleting users:`, e.message);
    }

    // Step 2: Delete all expert details
    try {
      const result = await ExpertDetails.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} expert profiles`);
    } catch (e) {
      console.log(`✗ Error deleting expert details:`, e.message);
    }

    // Step 3: Delete all meetings
    try {
      const result = await Meeting.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} meetings`);
    } catch (e) {
      console.log(`✗ Error deleting meetings:`, e.message);
    }

    // Step 4: Delete all sessions
    try {
      const result = await Session.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} sessions`);
    } catch (e) {
      console.log(`✗ Error deleting sessions:`, e.message);
    }

    // Step 5: Delete all reviews
    try {
      const result = await Review.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} reviews`);
    } catch (e) {
      console.log(`✗ Error deleting reviews:`, e.message);
    }

    // Step 6: Delete all saved experts
    try {
      const result = await SavedExpert.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} saved experts`);
    } catch (e) {
      console.log(`✗ Error deleting saved experts:`, e.message);
    }

    // Step 7: Delete all notifications
    try {
      const result = await Notification.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} notifications`);
    } catch (e) {
      console.log(`✗ Error deleting notifications:`, e.message);
    }

    // Step 8: Delete all OTPs
    try {
      const result = await Otp.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} OTPs`);
    } catch (e) {
      console.log(`✗ Error deleting OTPs:`, e.message);
    }

    // Step 9: Delete all reports
    try {
      const result = await Report.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} reports`);
    } catch (e) {
      console.log(`✗ Error deleting reports:`, e.message);
    }

    // Step 10: Delete all AI sessions
    try {
      const result = await AiSession.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} AI sessions`);
    } catch (e) {
      console.log(`✗ Error deleting AI sessions:`, e.message);
    }

    // Show remaining admin users
    try {
      const adminCount = await User.countDocuments({ userType: "admin" });
      console.log(`\n✓ Remaining admin users: ${adminCount}`);
    } catch (e) {
      console.log(`\n✗ Error counting admin users:`, e.message);
    }

    console.log("\n=== Data cleanup completed successfully! ===\n");
    console.log("✓ Deleted: Users (non-admin), Experts, Meetings, Sessions, Reviews, SavedExperts, Notifications, OTPs, Reports, AiSessions");
    console.log("✓ Kept: Admin users, Categories, Skills, PricingRules\n");

    process.exit(0);
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
};

clearExpertData();
