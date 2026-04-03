import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const experts = await db.collection('expertdetails').aggregate([
            { $match: { status: 'Active' } },
            {
                $lookup: {
                  from: "reviews",
                  let: { expertObjId: "$userId", expertStrId: { $toString: "$userId" } },
                  pipeline: [
                    { 
                      $match: { 
                        $expr: { 
                           $or: [
                              { $eq: ["$expertId", "$$expertObjId"] },
                              { $eq: ["$expertId", "$$expertStrId"] }
                           ] 
                        },
                        isVisible: true 
                      } 
                    }
                  ],
                  as: "reviewsList"
                }
            },
            {
                $addFields: {
                  reviewCount: { $size: "$reviewsList" }
                }
            }
        ]).toArray();
        
        console.log("EXPERT PIPELINE RESULT:");
        console.log(JSON.stringify(experts.map(e => ({ userId: e.userId, reviewCount: e.reviewCount, reviewIds: e.reviewsList.map(r => r._id) })), null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
