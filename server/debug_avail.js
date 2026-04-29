
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpertDetails from './models/expertModel.js';

dotenv.config();

const debugAvail = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const experts = await ExpertDetails.find({ status: 'Active' });
        console.log(`Found ${experts.length} Active experts.`);

        experts.forEach(e => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${e._id} | User: ${e.personalInformation?.userName}`);
            // Check if availability.weekly is a map or object
            const weekly = e.availability?.weekly;
            console.log("Weekly Type:", weekly instanceof Map ? "Map" : typeof weekly);
            if (weekly instanceof Map) {
                console.log("Weekly Keys:", [...weekly.keys()]);
                console.log("Weekly Data (Map):", JSON.stringify(Object.fromEntries(weekly), null, 2));
            } else {
                console.log("Weekly Data (Object):", JSON.stringify(weekly, null, 2));
            }
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugAvail();
