import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';

dotenv.config({ path: './server/.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🧹 Clearing existing expert data...');
        // Find existing experts to delete their details
        const expertUsers = await User.find({ userType: 'expert' });
        const expertUserIds = expertUsers.map(u => u._id);

        await ExpertDetails.deleteMany({ userId: { $in: expertUserIds } });
        await User.deleteMany({ userType: 'expert' });

        console.log('🌱 Generating 20 experts...');

        const categories = ["IT", "HR", "Business", "Design", "Marketing", "Finance", "AI"];
        const firstNames = ["James", "Sarah", "Michael", "Emma", "Robert", "Olivia", "David", "Sophia", "John", "Emily", "William", "Ava", "Richard", "Isabella", "Joseph", "Mia", "Thomas", "Charlotte", "Charles", "Amelia"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

        const companies = ["Google", "Microsoft", "Amazon", "Netflix", "Meta", "Apple", "Tesla", "IBM", "Oracle", "Salesforce"];
        const degrees = ["B.Tech", "MBA", "B.Des", "BBA", "M.Tech", "BS", "MS", "B.Com"];
        const institutions = ["MIT", "Stanford", "Harvard", "IIT Bombay", "IIT Delhi", "Oxford", "Cambridge", "Yale"];

        const expertDocs = [];
        const userDocs = [];

        // Pre-hash password for performance
        const hashedPassword = await bcrypt.hash('password123', 10);

        for (let i = 0; i < 20; i++) {
            const firstName = firstNames[i];
            const lastName = lastNames[i];
            const fullName = `${firstName} ${lastName}`;
            const category = categories[i % categories.length]; // Distribute evenly

            // Create User Document
            const user = new User({
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
                password: hashedPassword,
                userType: 'expert',
                name: fullName,
                profileImage: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
                personalInfo: {
                    phone: `+1555000${1000 + i}`,
                    dateOfBirth: new Date(1990 + (i % 10), i % 12, (i % 28) + 1),
                    gender: i % 2 === 0 ? "Male" : "Female",
                    country: "USA",
                    state: "California",
                    city: "San Francisco",
                    bio: `Experienced ${category} professional with a passion for mentoring.`
                },
                profileCompletion: 100
            });

            userDocs.push(user);

            // Create Expert Details Document
            const eduStart = 2010 + (i % 5);
            const eduEnd = eduStart + 4;
            const expStart = eduEnd;
            const expEnd = 2024;

            const expert = new ExpertDetails({
                userId: user._id, // Link to User
                profileImage: user.profileImage, // Sync image
                personalInformation: {
                    userName: fullName,
                    mobile: user.personalInfo.phone,
                    gender: user.personalInfo.gender,
                    dob: user.personalInfo.dateOfBirth,
                    country: user.personalInfo.country,
                    state: user.personalInfo.state,
                    city: user.personalInfo.city,
                    category: category
                },
                education: [{
                    degree: degrees[i % degrees.length],
                    institution: institutions[i % institutions.length],
                    field: category,
                    start: eduStart,
                    end: eduEnd
                }],
                professionalDetails: {
                    title: `Senior ${category} Consultant`,
                    company: companies[i % companies.length],
                    totalExperience: 2024 - expStart,
                    industry: category,
                    previous: [{
                        company: companies[(i + 1) % companies.length],
                        title: `Junior ${category} Associate`,
                        start: expStart,
                        end: expEnd
                    }]
                },
                skillsAndExpertise: {
                    mode: "Online",
                    domains: [category, "Consulting", "Strategy"],
                    tools: ["Jira", "Slack", "Zoom", "VS Code"],
                    languages: ["English", "Spanish"]
                },
                availability: {
                    sessionDuration: 30,
                    maxPerDay: 4,
                    weekly: {
                        "Monday": [{ from: "09:00", to: "17:00" }],
                        "Wednesday": [{ from: "09:00", to: "17:00" }],
                        "Friday": [{ from: "09:00", to: "17:00" }]
                    },
                    breakDates: []
                },
                verification: {
                    linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`
                },
                pricing: {
                    hourlyRate: 500 + (i * 10),
                    currency: "INR",
                    customPricing: false
                },
                metrics: {
                    totalSessions: Math.floor(Math.random() * 50) + 10,
                    completedSessions: Math.floor(Math.random() * 40) + 5,
                    cancelledSessions: Math.floor(Math.random() * 5),
                    avgRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                    totalReviews: Math.floor(Math.random() * 20) + 1,
                    avgResponseTime: Math.floor(Math.random() * 24) + 1
                },
                status: "Active"
            });

            expertDocs.push(expert);
        }

        // Save all documents
        await User.insertMany(userDocs);
        await ExpertDetails.insertMany(expertDocs);

        console.log(`✅ Successfully seeded ${userDocs.length} experts!`);
        console.log('Sample User credentials:');
        console.log(`Email: ${userDocs[0].email}`);
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
