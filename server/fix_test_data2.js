import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const activeExpertStr = "69b27760daed6b9189927d96";
        const oldExpertStr = "69b27763daed6b9189927d9f";

        // Find candidate reviews for old expert
        const revsToUpdate = await db.collection("reviews").find({ 
            expertId: { $in: [oldExpertStr, new mongoose.Types.ObjectId(oldExpertStr)] },
            reviewerRole: "candidate"
        }).toArray();
        
        console.log(`Found ${revsToUpdate.length} candidate reviews to update.`);
        
        for (const rev of revsToUpdate) {
            await db.collection("reviews").updateOne(
                { _id: rev._id },
                { $set: { expertId: activeExpertStr } } // Use string just like the old ID was mostly stored
            );
        }

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
