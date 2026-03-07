import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Session from './models/Session.js';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';

dotenv.config();

const seedSessions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Use Specific Actors
        const candidateId = "6981ef7557604eb0183e632e";
        const expertId = "697c66144e7ee69edfadb8a0";

        console.log(`Using Expert ID: ${expertId}`);
        console.log(`Using Candidate ID: ${candidateId}`);

        // 3. Create 5 Sessions
        // Start from 5 mins in the future from NOW
        const now = new Date();
        const baseTime = new Date(now.getTime() + 5 * 60000); // Start 5 mins from now
        const sessions = [];

        // Use CLIENT_URL from env or fallback to Vercel/Localhost
        const clientUrl = process.env.CLIENT_URL || "https://ownproject-interview.vercel.app";

        for (let i = 0; i < 5; i++) {
            const startTime = new Date(baseTime.getTime() + i * 45 * 60000); // +45 mins each (sequential)
            const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 min duration

            const session = new Session({
                sessionId: `live-test-${i + 1}-${Date.now()}`, // Unique ID
                expertId: expertId,
                candidateId: candidateId,
                startTime: startTime,
                endTime: endTime,
                topics: ["Mock Interview", "System Design", "Algorithm"],
                status: 'confirmed',
                price: 1500,
                duration: 45,
                notes: "Booked via Seeding Script for Live Test"
            });

            sessions.push(session);
        }

        await Session.insertMany(sessions);

        console.log("\n✅ Created 5 Specific Dummy Sessions:");
        sessions.forEach((s, i) => {
            console.log(`\n${i + 1}. [${s.status.toUpperCase()}] ${s.topics[0]}`);
            console.log(`   ID: ${s.sessionId}`);
            console.log(`   Time (Local): ${s.startTime.toLocaleString()}`);
            console.log(`   Link: ${clientUrl}/live-meeting?meetingId=${s.sessionId}`);
        });

        process.exit(0);

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedSessions();
