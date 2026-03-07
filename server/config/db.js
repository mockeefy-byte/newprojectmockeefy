import mongoose from "mongoose";

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI  // ✅ get from .env
    // if(uri==="mongodb+srv://gobynow_123_2:vT5JChy5p4g8A4Ui@cluster0.7abgh0l.mongodb.net/?appName=Cluster0") return process.env.MONGO_URI_LOCAL

    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas connected!");

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('querySrv')) {
        console.error(`
❌ MongoDB connection failed: Network error.
👉 This often happens if your IP address is not whitelisted in MongoDB Atlas.
👉 Go to MongoDB Atlas -> Network Access -> Add IP Address -> Add Current IP.
        `);
    }
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;
