import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const revs = await db.collection("reviews").find({
            feedback: { $in: ["Done", "Good"] }
        }).toArray();
        
        console.log("REVIEWS WITH Done/Good:");
        console.log(JSON.stringify(revs, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
