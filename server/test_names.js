import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const user96 = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId("69b27760daed6b9189927d96") });
        const user9f = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId("69b27763daed6b9189927d9f") });
        
        console.log("USER 96 Name:", user96?.name, "Role:", user96?.role);
        console.log("USER 9F Name:", user9f?.name, "Role:", user9f?.role);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
