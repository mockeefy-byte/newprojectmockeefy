
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Session from "./models/sessionModel.js";
import Expert from "./models/expertModel.js";
import User from "./models/User.js";
import fs from 'fs';

const debugData = async () => {
    try {
        await connectDB();

        let output = "========== DEBUG START ==========\n";

        const sessions = await Session.find().limit(10).lean();
        output += `Found ${sessions.length} sessions\n`;

        for (const session of sessions) {
            output += "\n--- SESSION ---\n";
            output += `ID: ${session.sessionId}\n`;
            output += `ExpertID (Raw): ${session.expertId}\n`;

            let expert = null;

            if (mongoose.Types.ObjectId.isValid(session.expertId)) {
                expert = await Expert.findOne({ userId: session.expertId });
                if (expert) output += "FOUND by userId (ObjectId)\n";

                if (!expert) {
                    expert = await Expert.findById(session.expertId);
                    if (expert) output += "FOUND by _id (ObjectId)\n";
                }
            } else if (typeof session.expertId === 'string' && session.expertId.includes('@')) {
                const user = await User.findOne({ email: session.expertId });
                if (user) {
                    expert = await Expert.findOne({ userId: user._id });
                    if (expert) output += "FOUND by email -> userId\n";
                }
            }

            if (expert) {
                output += `Name: ${expert.personalInformation?.userName}\n`;
                output += `Role: ${expert.professionalDetails?.title}\n`;
                output += `Image: ${expert.profileImage}\n`;
            } else {
                output += "!!! EXPERT NOT FOUND !!!\n";
            }
        }

        fs.writeFileSync('debug_output.txt', output);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugData();
