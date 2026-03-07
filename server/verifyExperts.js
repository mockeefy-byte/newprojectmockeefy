import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    userType: String,
    name: String,
    createdAt: Date
});

// Expert Schema (simplified)
const expertSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    personalInformation: {
        userName: String,
        category: String
    },
    status: String
});

const User = mongoose.model('User', userSchema);
const ExpertDetails = mongoose.model('ExpertDetails', expertSchema);

// Verify Database
const verifyDatabase = async () => {
    try {
        await connectDB();

        // Count users
        const totalUsers = await User.countDocuments();
        const expertUsers = await User.countDocuments({ userType: 'expert' });


        // Count experts
        const totalExperts = await ExpertDetails.countDocuments();
        const activeExperts = await ExpertDetails.countDocuments({ status: 'Active' });


        // Count by category
        const categories = ['IT', 'HR', 'Business', 'Design', 'Marketing', 'Finance', 'AI'];

        for (const category of categories) {
            const count = await ExpertDetails.countDocuments({ 'personalInformation.category': category });
        }

        // List some experts
        const sampleExperts = await ExpertDetails.find()
            .limit(5)
            .select('personalInformation.userName personalInformation.category status');

        sampleExperts.forEach((expert, index) => {
        });

        // List some users
        const sampleUsers = await User.find({ userType: 'expert' })
            .limit(5)
            .select('email name');

        sampleUsers.forEach((user, index) => {
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying database:', error);
        process.exit(1);
    }
};

// Run verification
verifyDatabase();
