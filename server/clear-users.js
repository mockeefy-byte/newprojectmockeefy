/**
 * Clear all users from the mockeefy database.
 * This deletes every document in the Users collection.
 *
 * Uses MONGO_URI from .env – be very sure it points to the
 * correct database (e.g. staging) before running.
 *
 * Run from the /server folder:
 *   node clear-users.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const clearUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB (mockeefy)...");

    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Users.`);

    console.log("All users cleared successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing users:", error);
    process.exit(1);
  }
};

clearUsers();

