import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';
import { createRestrictedTestSession } from './services/sessionService.js';

dotenv.config();

const seedSession = async () => {
    try {
        await connectDB();

        const candidateEmail = 'kohsanar2011@gmail.com';
        const expertEmail = 'suresh.babu@example.com';

        // 1. Ensure Candidate Exists
        let candidate = await User.findOne({ email: candidateEmail });
        if (!candidate) {
            console.log(`Creating candidate: ${candidateEmail}`);
            const hashedPassword = await bcrypt.hash('password123', 10);
            candidate = new User({
                email: candidateEmail,
                password: hashedPassword,
                userType: 'candidate',
                name: 'Kohsanar Candidate'
            });
            await candidate.save();
        } else {
             console.log(`Candidate exists: ${candidateEmail}`);
        }

        // 2. Ensure Expert Exists (Suresh Babu)
        let expert = await User.findOne({ email: expertEmail });
        if (!expert) {
             console.log(`Expert not found: ${expertEmail}. Creating basic user entry...`);
             const hashedPassword = await bcrypt.hash('password123', 10);
             expert = new User({
                email: expertEmail,
                password: hashedPassword,
                userType: 'expert',
                name: 'Suresh Babu'
            });
            await expert.save();
        } else {
             console.log(`Expert exists: ${expertEmail}`);
        }

        // 3. Create Session
        console.log('Creating Restricted Session...');
        // Using 'NOW' to make it start in 2 minutes
        const result = await createRestrictedTestSession(expertEmail, candidateEmail, 'NOW'); 
        
        console.log('✅ Session created successfully!');
        console.log('Session ID:', result.session.sessionId);
        console.log('Expert ID:', result.session.expertId);
        console.log('Candidate ID:', result.session.candidateId);
        console.log('Start Time:', result.session.startTime);
        console.log('End Time:', result.session.endTime);
        console.log('Status:', result.session.status);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating session:', error);
        process.exit(1);
    }
};

seedSession();
