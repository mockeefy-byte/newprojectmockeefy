
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpertDetails from './models/expertModel.js';

dotenv.config();

const debugExperts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB via", process.env.MONGO_URI);

        const experts = await ExpertDetails.find({}, { status: 1, 'personalInformation.userName': 1, userId: 1, availability: 1 });
        console.log(`Also found ${experts.length} total experts.`);
        console.log("---------------------------------------------------");
        experts.forEach(e => {
            console.log(`ID: ${e._id} | User: ${e.personalInformation?.userName} | Status: ${e.status}`);
            console.log("Availability:", JSON.stringify(e.availability, null, 2));
        });

        console.log("------------------ SEARCH: CodeTalk -----------------");
        const user = await import('./models/User.js').then(m => m.default.findOne({ name: /CodeTalk/i }));
        console.log("User found:", user);

        if (user) {
            const expert = await ExpertDetails.findOne({ userId: user._id });
            console.log("Linked Expert Profile:", expert);
        }
        console.log("---------------------------------------------------");

        const pendingCount = await ExpertDetails.countDocuments({ status: 'pending' });
        const verifiedCount = await ExpertDetails.countDocuments({ status: 'verified' });
        console.log(`Pending: ${pendingCount}`);
        console.log(`Verified: ${verifiedCount}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugExperts();
