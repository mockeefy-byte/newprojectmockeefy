
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Category from './models/Category.js';
import Skill from './models/Skill.js';
import PricingRule from './models/PricingRule.js';
import User from './models/User.js';
import ExpertDetails from './models/expertModel.js';
import Session from './models/Session.js';

// Convert to ES Module if needed or run with "type": "module" in package.json
// Usage: node seed_data.js

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/interviewmock";

/* -------------------------------------------------------------------------- */
/*                                SEED CONFIG                                 */
/* -------------------------------------------------------------------------- */

const categoriesData = [
    { name: "IT & Software", type: "technical", icon: "Code" },
    { name: "Non-IT Corporate", type: "behavioral", icon: "Briefcase" },
    { name: "Medical", type: "specialized", icon: "Stethoscope" },
    { name: "Legal", type: "specialized", icon: "Scale" },
    { name: "Creative", type: "creative", icon: "Palette" }
];

const skillsData = {
    "IT & Software": [
        { name: "Frontend Development", sub: ["React JS", "Angular", "JavaScript", "HTML/CSS"] },
        { name: "Backend Development", sub: ["Node JS", "Java Spring", "Python Django", ".NET"] },
        { name: "Fullstack Development", sub: ["MERN Stack", "MEAN Stack"] },
        { name: "Testing", sub: ["Manual Testing", "Selenium", "API Testing"] },
        { name: "DevOps", sub: ["AWS", "Docker", "Kubernetes"] }
    ],
    "Non-IT Corporate": [
        { name: "HR", sub: ["Recruitment", "Employee Relations"] },
        { name: "Sales", sub: ["Sales Pitch", "Lead Generation"] },
        { name: "Accounts", sub: ["Accounting Basics", "Taxation"] },
        { name: "Soft Skills", sub: ["Communication", "Behavioral Interview", "Leadership"] }
    ],
    "Medical": [
        { name: "General Practice", sub: ["Diagnosis", "Patient Care"] }
    ],
    "Legal": [
        { name: "Corporate Law", sub: ["Contracts", "Compliance"] }
    ],
    "Creative": [
        { name: "Graphic Design", sub: ["Photoshop", "Illustrator"] },
        { name: "UX Design", sub: ["Figma", "User Research"] }
    ]
};

const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = [30, 60];

const pricingMatrix = {
    "Beginner": { 30: 299, 60: 549 },
    "Intermediate": { 30: 499, 60: 899 },
    "Advanced": { 30: 699, 60: 1299 }
};

/* -------------------------------------------------------------------------- */
/*                                 SEED LOGIC                                 */
/* -------------------------------------------------------------------------- */

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("🔥 Connected to MongoDB...");

        // CLEAR EXISTING DATA
        await Category.deleteMany({});
        await Skill.deleteMany({});

        // Drop collection to reset indexes for PricingRule
        try {
            await PricingRule.collection.drop();
        } catch (e) {
            console.log("PricingRule collection might not exist, skipping drop.");
        }

        await User.deleteMany({ userType: { $in: ["expert", "candidate"] } }); // Keep admin if needed
        await ExpertDetails.deleteMany({});
        await Session.deleteMany({});
        console.log("🧹 Cleared existing data...");

        // 1. CREATE CATEGORIES
        const categoryMap = {}; // name -> _id
        for (const cat of categoriesData) {
            const newCat = await Category.create({
                name: cat.name,
                type: cat.type,
                icon: cat.icon,
                status: 'Active'
            });
            categoryMap[cat.name] = newCat._id;
            console.log(`✅ Created Category: ${cat.name}`);
        }

        // 2. CREATE SKILLS
        const skillMap = {}; // name -> _id
        const subSkillMap = {}; // "React JS" -> parent Skill Object

        for (const [catName, domains] of Object.entries(skillsData)) {
            const catId = categoryMap[catName];
            if (!catId) continue;

            for (const domain of domains) {
                for (const skillName of domain.sub) {
                    const newSkill = await Skill.create({
                        name: skillName,
                        categoryId: catId,
                        description: `${domain.name} skill`,
                        isActive: true
                    });
                    skillMap[skillName] = newSkill._id;
                    subSkillMap[skillName] = newSkill;
                }
            }
        }
        console.log(`✅ Created ${Object.keys(skillMap).length} Skills`);

        // 3. CREATE PRICING RULES (Base Category Rules)
        for (const [catName, catId] of Object.entries(categoryMap)) {
            for (const level of levels) {
                for (const duration of durations) {
                    const basePrice = pricingMatrix[level][duration];
                    await PricingRule.create({
                        categoryId: catId,
                        skillId: null, // Base rule
                        level,
                        duration,
                        price: basePrice, // Default matrix
                        currency: 'INR'
                    });
                }
            }
        }

        // Specific Skill Overrides (Example)
        const reactId = skillMap["React JS"];
        if (reactId && categoryMap["IT & Software"]) {
            // React is slightly more expensive
            await PricingRule.create({
                categoryId: categoryMap["IT & Software"],
                skillId: reactId,
                level: "Advanced",
                duration: 60,
                price: 1499, // Override
                currency: 'INR'
            });
        }
        console.log("✅ Created Pricing Rules");

        // 4. CREATE USERS & EXPERTS
        const passwordHash = await bcrypt.hash("password123", 10);

        // Expert 1: Arun (Frontend - React/JS)
        const expertUser1 = await User.create({
            name: "Arun Kumar",
            email: "arun.expert@example.com",
            password: passwordHash,
            userType: "expert",
            isVerified: true
        });

        const expertDetails1 = await ExpertDetails.create({
            userId: expertUser1._id,
            personalInformation: {
                userName: "Arun Kumar",
                mobile: "9876543210",
                gender: "Male",
                category: "IT & Software", // String enum in model
                country: "India",
                state: "Karnataka",
                city: "Bangalore"
            },
            professionalDetails: {
                title: "Senior Frontend Engineer",
                company: "TechCorp",
                totalExperience: 8,
                industry: "IT"
            },
            expertSkills: [
                {
                    skillId: skillMap["React JS"],
                    level: "Expert",
                    priceAdjustment: 200,
                    isEnabled: true
                },
                {
                    skillId: skillMap["JavaScript"],
                    level: "Advanced",
                    priceAdjustment: 100,
                    isEnabled: true
                }
            ],
            status: "Active",
            pricing: { hourlyRate: 1000 },
            availability: {
                sessionDuration: 30, // Default pref
                weekly: {
                    "Monday": [{ from: "10:00", to: "12:00" }, { from: "14:00", to: "16:00" }],
                    "Wednesday": [{ from: "10:00", to: "12:00" }],
                    "Friday": [{ from: "18:00", to: "20:00" }]
                }
            }
        });

        // Expert 2: Priya (HR - Communication)
        const expertUser2 = await User.create({
            name: "Priya Sharma",
            email: "priya.expert@example.com",
            password: passwordHash,
            userType: "expert",
            isVerified: true
        });

        await ExpertDetails.create({
            userId: expertUser2._id,
            personalInformation: {
                userName: "Priya Sharma",
                mobile: "9876543211",
                gender: "Female",
                category: "Non-IT Corporate",
                country: "India",
                state: "Maharashtra",
                city: "Mumbai"
            },
            professionalDetails: {
                title: "HR Manager",
                company: "GlobalInc",
                totalExperience: 12,
                industry: "Human Resources"
            },
            expertSkills: [
                {
                    skillId: skillMap["Communication"],
                    level: "Expert",
                    priceAdjustment: 0,
                    isEnabled: true
                },
                {
                    skillId: skillMap["Behavioral Interview"],
                    level: "Advanced",
                    priceAdjustment: 0,
                    isEnabled: true
                }
            ],
            status: "Active",
            pricing: { hourlyRate: 800 },
            availability: {
                sessionDuration: 60,
                weekly: {
                    "Tuesday": [{ from: "09:00", to: "13:00" }],
                    "Thursday": [{ from: "14:00", to: "18:00" }]
                }
            }
        });
        console.log("✅ Created Experts: Arun & Priya");

        // 5. CREATE REGULAR USER
        const regularUser = await User.create({
            name: "Rahul Student",
            email: "rahul.student@example.com",
            password: passwordHash,
            userType: "candidate",
            isVerified: true
        });
        console.log("✅ Created User: Rahul (candidate)");

        // 6. CREATE BOOKING (Session) - Past & Future
        // Future booking for Arun
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2); // 2 days later
        futureDate.setHours(10, 0, 0, 0);

        const endDate = new Date(futureDate);
        endDate.setMinutes(futureDate.getMinutes() + 30);

        await Session.create({
            sessionId: "MOCK-123456",
            expertId: expertUser1._id,
            candidateId: regularUser._id,
            startTime: futureDate,
            endTime: endDate,
            duration: 30,
            status: "Upcoming",
            meetingLink: "https://meet.google.com/abc-defg-hij",
            price: 799,
            notes: "Mock Interview Session"
        });
        console.log("✅ Created Dummy Bookings");

    } catch (error) {
        console.error("❌ Seed Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected.");
    }
};

seed();
