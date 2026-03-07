import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';
import Category from './models/Category.js';
import Skill from './models/Skill.js';
import PricingRule from './models/PricingRule.js';

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const seed3RSExpert = async () => {
    try {
        await connectDB();
        console.log('🌱 Generating 3 INR Expert...');

        // 1. Find or create a Category
        let category = await Category.findOne({ name: "IT & Software" });
        if (!category) {
            category = await Category.create({
                name: "IT & Software",
                type: "technical",
                icon: "Code",
                status: 'Active'
            });
        }

        // 2. Create a specific Skill for this promo so it doesn't affect other experts
        let skill = await Skill.findOne({ name: "Promo 3RS Session" });
        if (!skill) {
            skill = await Skill.create({
                name: "Promo 3RS Session",
                categoryId: category._id,
                description: "Special promotional skill for testing 3 INR sessions",
                isActive: true
            });
        }

        // 3. Create a Pricing Rule for 3 INR
        await PricingRule.findOneAndUpdate(
            { categoryId: category._id, skillId: null, level: "Beginner", duration: 30 },
            { price: 3, currency: 'INR' },
            { upsert: true, new: true }
        );

        // 4. Create User Document
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.findOneAndUpdate(
            { email: 'promo3rs@example.com' },
            {
                password: hashedPassword,
                userType: 'expert',
                name: "Test 3RS Expert",
                profileImage: `https://ui-avatars.com/api/?name=Test+Expert&background=random`,
                personalInfo: {
                    phone: `+15550009999`,
                    dateOfBirth: new Date("1995-01-01"),
                    gender: "Female",
                    country: "India",
                    state: "Karnataka",
                    city: "Bangalore",
                    bio: `Special promotional expert for testing.`
                },
                profileCompletion: 100,
                isVerified: true
            },
            { upsert: true, new: true }
        );

        // 5. Create Expert Details Document
        await ExpertDetails.findOneAndUpdate(
            { userId: user._id },
            {
                profileImage: user.profileImage,
                personalInformation: {
                    userName: "Test 3RS Expert",
                    mobile: "+15550009999",
                    gender: "Female",
                    category: "IT & Software",
                    country: "India",
                    state: "Karnataka",
                    city: "Bangalore"
                },
                professionalDetails: {
                    title: "Promo Consultant",
                    company: "Mockeefy",
                    totalExperience: 5,
                    industry: "IT & Software",
                    level: "Beginner"
                },
                expertSkills: [{
                    skillId: skill._id,
                    level: "Beginner",
                    isEnabled: true
                }],
                availability: {
                    sessionDuration: 30,
                    maxPerDay: 4,
                    weekly: {
                        "Monday": [{ from: "09:00", to: "17:00" }],
                        "Tuesday": [{ from: "09:00", to: "17:00" }],
                        "Wednesday": [{ from: "09:00", to: "17:00" }],
                        "Thursday": [{ from: "09:00", to: "17:00" }],
                        "Friday": [{ from: "09:00", to: "17:00" }]
                    }
                },
                metrics: {
                    totalSessions: 0,
                    completedSessions: 0,
                    cancelledSessions: 0,
                    avgRating: 5.0,
                    totalReviews: 0,
                    avgResponseTime: 1
                },
                status: "Active" // Equivalent to "approved" in this system
            },
            { upsert: true, new: true }
        );

        console.log(`✅ Successfully seeded 3 INR Expert!`);
        console.log('Use these credentials to log in as the expert:');
        console.log(`Email: promo3rs@example.com`);
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seed3RSExpert();
