import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const userIdObj = new mongoose.Types.ObjectId("69b27760daed6b9189927d96");
        const userIdStr = "69b27760daed6b9189927d96";

        const revs = await db.collection("reviews").find({
            $or: [
                { expertId: userIdObj },
                { expertId: userIdStr }
            ]
        }).toArray();
        
        console.log("REVIEWS FOR 96 FULL DUMP:");
        console.log(JSON.stringify(revs, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
