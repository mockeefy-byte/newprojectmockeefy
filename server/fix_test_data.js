import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const activeExpertId = "69b27760daed6b9189927d96";
        const oldExpertId = "69b27763daed6b9189927d9f";

        // Delete the 2 garbage test reviews currently on the active expert
        await db.collection("reviews").deleteMany({ expertId: activeExpertId });
        console.log("Deleted old test reviews for active expert.");

        // Move the 3 valid candidate reviews (and the 1 expert review) from the old expert ID to the active expert ID
        // Actually let's only move the 3 candidate reviews to make it perfectly 3.
        const updateResult = await db.collection("reviews").updateMany(
            { expertId: oldExpertId, reviewerRole: "candidate" },
            { $set: { expertId: activeExpertId } }
        );
        console.log(`Transferred ${updateResult.modifiedCount} candidate reviews to the active expert.`);
        
        // Ensure ratings update correctly by triggering a re-read from DB.
        const revs = await db.collection("reviews").countDocuments({ expertId: activeExpertId });
        console.log(`Total reviews for active expert is now: ${revs}`);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
