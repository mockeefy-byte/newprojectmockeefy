import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const u = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId("69b25001cf55e082674d6ff3") });
        console.log("CANDIDATE NAME:", u?.name);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
