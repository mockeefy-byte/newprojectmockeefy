import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';

dotenv.config();

const debugAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
        console.log('✅ MongoDB Connected');

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
                    preserveNullAndEmptyArrays: false
                }
            }
        ];

        console.log('Running aggregation...');
        const results = await ExpertDetails.aggregate(pipeline);
        console.log(`📊 Aggregation Result Count: ${results.length}`);

        if (results.length < 20) {
            console.log('⚠️ Count is less than 20! Checking potential issues...');

            const totalActive = await ExpertDetails.countDocuments({ status: "Active" });
            console.log(`- Total Experts with status='Active': ${totalActive}`);

            if (totalActive > 0) {
                const sampleExpert = await ExpertDetails.findOne({ status: "Active" });
                console.log(`- Sample Active Expert UserID: ${sampleExpert.userId}`);
                const userExists = await User.findById(sampleExpert.userId);
                console.log(`- Does that User exist? ${!!userExists}`);
            }
        } else {
            console.log('✅ Pipeline returns 20 documents. The backend logic seems correct.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

debugAggregation();
