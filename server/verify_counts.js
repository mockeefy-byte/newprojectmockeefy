import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';

dotenv.config({ path: './server/.env' });

const verifyCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
        console.log('✅ MongoDB Connected');

        const userCount = await User.countDocuments({ userType: 'expert' });
        const expertCount = await ExpertDetails.countDocuments();

        console.log(`📊 Current Counts:`);
        console.log(`- Users (expert): ${userCount}`);
        console.log(`- ExpertDetails: ${expertCount}`);

        if (expertCount > 0) {
            const sample = await ExpertDetails.findOne().select('personalInformation.userName personalInformation.category');
            console.log('🔍 Sample Expert:', sample.personalInformation);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying:', error);
        process.exit(1);
    }
};

verifyCounts();
