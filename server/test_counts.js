import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const experts = await db.collection("expertdetails").find({}).toArray();
        console.log("ALL EXPERTS:");
        for (const exp of experts) {
            const userIdObj = exp.userId;
            const userIdStr = userIdObj.toString();
            
            const reviewsCount = await db.collection("reviews").countDocuments({
                $or: [
                    { expertId: userIdObj },
                    { expertId: userIdStr }
                ]
            });
            
            const reviewsCountVisible = await db.collection("reviews").countDocuments({
                $or: [
                    { expertId: userIdObj },
                    { expertId: userIdStr }
                ],
                isVisible: true
            });

            console.log(`Expert ID: ${userIdStr} | Status: ${exp.status} | Total Reviews: ${reviewsCount} | Visible Reviews: ${reviewsCountVisible}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
