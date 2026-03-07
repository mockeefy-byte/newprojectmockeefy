import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Models
import User from "./models/User.js";
import ExpertDetails from "./models/expertModel.js";
import Category from "./models/Category.js";
import Skill from "./models/Skill.js";
import Session from "./models/Session.js";

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI;

const categoriesData = [
    { name: "IT", description: "Information Technology" },
    { name: "HR", description: "Human Resources" },
    { name: "Business", description: "Business Administration" },
    { name: "Design", description: "Graphic and UI/UX Design" },
    { name: "Marketing", description: "Digital and Traditional Marketing" },
    { name: "Finance", description: "Finance and Accounting" },
    { name: "AI", description: "Artificial Intelligence and ML" },
    { name: "Legal", description: "Legal Services" },
    { name: "Medical", description: "Healthcare and Medicine" },
    { name: "Creative", description: "Creative Arts" },
];

const skillsData = {
    "IT": ["JavaScript", "Python", "React", "Node.js", "Java", "C++", "AWS", "Docker"],
    "HR": ["Recruitment", "Employee Relations", "Payroll", "Conflict Resolution"],
    "Business": ["Project Management", "Business Analysis", "Strategic Planning", "Leadership"],
    "Design": ["Photoshop", "Figma", "Illustrator", "UI Design", "UX Research"],
    "Marketing": ["SEO", "Content Marketing", "Social Media", "Email Marketing", "Google Ads"],
    "Finance": ["Financial Analysis", "Accounting", "Taxation", "Investment Banking"],
    "AI": ["Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch"],
    "Legal": ["Corporate Law", "Intellectual Property", "Contract Law"],
    "Medical": ["General Medicine", "Pediatrics", "Surgery"],
    "Creative": ["Writing", "Music Production", "Video Editing"]
};

// Helpers
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    try {
        console.log("🚀 Starting Seed Process...");

        // 1. Create Categories
        console.log("Creating Categories...");
        const createdCategories = [];
        for (const cat of categoriesData) {
            let category = await Category.findOne({ name: cat.name });
            if (!category) {
                category = await Category.create(cat);
                console.log(`Created Category: ${cat.name}`);
            }
            createdCategories.push(category);
        }

        // 2. Create Skills
        console.log("Creating Skills...");
        for (const cat of createdCategories) {
            const skills = skillsData[cat.name] || [];
            for (const skillName of skills) {
                const exists = await Skill.findOne({ name: skillName, categoryId: cat._id });
                if (!exists) {
                    await Skill.create({ name: skillName, categoryId: cat._id });
                }
            }
        }

        // 3. Create Experts (Users + ExpertDetails)
        console.log("Creating Experts...");
        const experts = [];
        for (let i = 1; i <= 10; i++) {
            const email = `expert${i}@example.com`;
            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    name: `Expert User ${i}`,
                    email,
                    password: "password123", // Dummy password
                    userType: "expert",
                    status: "Active",
                    profileCompletion: 80,
                    personalInfo: {
                        bio: `I am an expert in my field with ${5 + i} years of experience.`,
                        country: "India",
                    },
                    skills: {
                        technical: i % 2 === 0 ? ["React", "Node.js"] : ["Python", "Django"],
                        languages: ["English", "Hindi"]
                    }
                });

                const category = getRandom(createdCategories);

                const startHour1 = 9 + Math.floor(Math.random() * 4); // 9-12
                const startHour2 = 14 + Math.floor(Math.random() * 4); // 14-17
                const weeklyRaw = {};
                ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach(day => {
                    weeklyRaw[day] = [
                        { from: `${startHour1}:00`, to: `${startHour1 + 1}:00` },
                        { from: `${startHour2}:00`, to: `${startHour2 + 1}:00` }
                    ];
                });

                await ExpertDetails.create({
                    userId: user._id,
                    personalInformation: {
                        userName: `expert_user_${i}`,
                        category: category.name,
                        gender: i % 2 === 0 ? "Male" : "Female"
                    },
                    professionalDetails: {
                        title: "Senior Consultant",
                        company: "Tech Corp " + i,
                        totalExperience: 5 + i,
                        level: i > 5 ? "Advanced" : "Intermediate",
                        industry: "Technology"
                    },
                    availability: {
                        sessionDuration: 60,
                        maxPerDay: 4,
                        weekly: weeklyRaw
                    },
                    status: "Active",
                    metrics: {
                        totalSessions: Math.floor(Math.random() * 50),
                        avgRating: (3 + Math.random() * 2).toFixed(1)
                    }
                });
                console.log(`Created Expert: ${email}`);
            }
            experts.push(user);
        }

        // 4. Create Users (Candidates)
        console.log("Creating Candidates...");
        const candidates = [];
        for (let i = 1; i <= 10; i++) {
            const email = `candidate${i}@example.com`;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name: `Candidate User ${i}`,
                    email,
                    password: "password123",
                    userType: "candidate",
                    status: "Active",
                });
                console.log(`Created Candidate: ${email}`);
            }
            candidates.push(user);
        }

        // 5. Create Sessions
        console.log("Creating Sessions...");
        for (let i = 0; i < 15; i++) {
            const expert = getRandom(experts);
            // Find expert details to get the correct expertId (usually userId or _id depending on schema usage, but typically for display we might want expert name)
            // Session schema uses expertId as string. Ideally valid ObjectId string.

            const candidate = getRandom(candidates);
            const startTime = getRandomDate(new Date(), new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

            // Check if session exists (simplified check)
            const sessionExists = await Session.findOne({ expertId: expert._id.toString(), candidateId: candidate._id.toString(), startTime });

            if (!sessionExists) {
                const expertDetails = await ExpertDetails.findOne({ userId: expert._id });

                await Session.create({
                    sessionId: `SESS-${Date.now()}-${i}`,
                    expertId: expert._id,
                    candidateId: candidate._id,
                    categoryId: createdCategories.find(c => c.name === expertDetails.personalInformation.category)?._id,
                    level: expertDetails.professionalDetails.level,
                    startTime,
                    endTime,
                    price: 500 + Math.floor(Math.random() * 1000),
                    status: getRandom(['confirmed', 'completed', 'pending', 'cancelled']),
                    topics: ["Mock Interview", "Code Review"],
                    duration: 60
                });
                console.log(`Created Session ${i + 1}`);
            }
        }

        console.log("✅ Seeding Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seed();
