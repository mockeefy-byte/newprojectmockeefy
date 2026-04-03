import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import ExpertDetails from './models/expertModel.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        
        const pipeline = [
          { $match: { status: "Active" } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: false // Only show experts with valid user account
            }
          },
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
                    reviewerRole: "candidate",
                    isVisible: true 
                  } 
                }
              ],
              as: "reviewsList"
            }
          },
          {
            $addFields: {
              avgRating: {
                $cond: {
                   if: { $gt: [{ $size: "$reviewsList" }, 0] },
                   then: { $round: [{ $avg: "$reviewsList.overallRating" }, 1] },
                   else: 0
                }
              },
              reviewCount: { $size: "$reviewsList" }
            }
          }
        ];

        const experts = await ExpertDetails.aggregate(pipeline);
        console.log("PIPELINE RESULT COUNT:", experts.length);

    } catch (e) {
        console.error("PIPELINE PIPELINE ERROR:", e);
    } finally {
        mongoose.disconnect();
    }
}
run();
