import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const activeExpertStr = "69b27760daed6b9189927d96";

        // Delete the original 2 garbage test reviews (the ones with reviewerRole: 'expert')
        const delResult = await db.collection("reviews").deleteMany({ 
            expertId: { $in: [activeExpertStr, new mongoose.Types.ObjectId(activeExpertStr)] },
            reviewerRole: "expert"
        });
        
        console.log(`Deleted ${delResult.deletedCount} expert role reviews.`);

        const revs = await db.collection("reviews").countDocuments({ 
            expertId: { $in: [activeExpertStr, new mongoose.Types.ObjectId(activeExpertStr)] }
        });
        console.log(`Total reviews for active expert is now: ${revs}`);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
