import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const pipeline = [
            { $match: { status: "Active" } },
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
                          // Removing reviewerRole: candidate just to see total matches first
                       } 
                    }
                  ],
                  as: "reviewsList"
                }
              }
        ];
        const res = await db.collection("expertdetails").aggregate(pipeline).toArray();
        console.log("JOIN RESULT:");
        res.forEach(r => console.log(`Expert ${r.userId} matched ${r.reviewsList.length} reviews.`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
