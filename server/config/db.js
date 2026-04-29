import mongoose from "mongoose";

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file (use mockeefy Atlas connection)");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected (mockeefy)");

  } catch (error) {
    const isSrvError = error.message && error.message.includes('querySrv');
    if (isSrvError) {
      console.error(`
❌ MongoDB connection failed: querySrv (DNS lookup blocked).
   Your IP is allowed; the problem is DNS/network.
👉 Fix: Use the STANDARD connection string (no SRV).
   1. Atlas → Database → Connect (your cluster) → Drivers
   2. Get the "standard" connection string (mongodb://... with host:27017,...)
   3. Put it in .env as MONGO_URI (replace the mongodb+srv://... line)
   4. Restart the server.
   Details: server/MONGODB_ATLAS_SETUP.md
      `);
    } else if (error.code === 'ECONNREFUSED' || error.name === 'MongoServerSelectionError') {
      console.error(`
❌ MongoDB connection failed: Network error.
👉 Whitelist your IP: Atlas → Network Access → ADD IP ADDRESS.
   See server/MONGODB_ATLAS_SETUP.md
      `);
    }
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;
