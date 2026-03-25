/**
 * User Profile Controller
 * Handles user profile CRUD operations and profile completion calculation
 */

import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getFileUrl } from "../middleware/upload.js";

/* ----------------- Profile Completion Calculator ------------------ */
function calculateProfileCompletion(user) {
    let score = 0;
    const isFresher = String(user?.preferences?.experienceLevel || "").toLowerCase() === "fresher";

    // Personal Info (20%)
    if (user.name) score += 5;
    if (user.personalInfo?.phone) score += 5;
    if (user.personalInfo?.city && user.personalInfo?.state) score += 5;
    if (user.personalInfo?.bio) score += 5;

    // Profile Image (10%)
    if (user.profileImage) score += 10;

    // Education (20%)
    if (user.education && user.education.length > 0) score += 20;

    // Experience (20%)
    // For fresher profiles, experience section is considered complete even without company history.
    if ((user.experience && user.experience.length > 0) || isFresher) score += 20;

    // Certifications (5%)
    if (user.certifications && user.certifications.length > 0) score += 5;

    // Skills (15%)
    if (user.skills?.technical && user.skills.technical.length > 0) score += 5;
    if (user.skills?.soft && user.skills.soft.length > 0) score += 5;
    if (user.skills?.languages && user.skills.languages.length > 0) score += 5;

    // Preferences (10%)
    if (user.preferences?.jobType) score += 3;
    if (user.preferences?.expectedSalary) score += 3;
    if (user.preferences?.noticePeriod) score += 2;
    if (user.preferences?.willingToRelocate !== undefined) score += 2;

    return Math.min(score, 100);
}

function getProfileWarnings(user) {
    const warnings = [];
    const isFresher = String(user?.preferences?.experienceLevel || "").toLowerCase() === "fresher";

    if (!user.name) warnings.push("Add your full name.");
    if (!user.personalInfo?.phone) warnings.push("Add your phone number.");
    if (!(user.personalInfo?.city && user.personalInfo?.state)) warnings.push("Add your city and state.");
    if (!user.personalInfo?.bio) warnings.push("Add a short bio.");
    if (!user.profileImage) warnings.push("Upload a profile image.");
    if (!(user.education && user.education.length > 0)) warnings.push("Add at least one education entry.");
    if (!isFresher && !(user.experience && user.experience.length > 0)) warnings.push("Add work experience or mark yourself as Fresher in Preferences.");
    if (!(user.certifications && user.certifications.length > 0)) warnings.push("Add at least one certification.");
    if (!(user.skills?.technical && user.skills.technical.length > 0)) warnings.push("Add technical skills.");
    if (!(user.skills?.soft && user.skills.soft.length > 0)) warnings.push("Add soft skills.");
    if (!(user.skills?.languages && user.skills.languages.length > 0)) warnings.push("Add languages.");
    if (!user.preferences?.jobType) warnings.push("Select preferred job type.");
    if (user.preferences?.willingToRelocate === undefined) warnings.push("Set relocation preference.");
    if (!isFresher) {
        if (!user.preferences?.expectedSalary) warnings.push("Set expected salary.");
        if (!user.preferences?.noticePeriod) warnings.push("Set notice period.");
    }

    return warnings;
}

/* ----------------- Get User Profile ------------------ */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.headers.userid;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate profile completion
        const profileCompletion = calculateProfileCompletion(user);

        return res.json({
            success: true,
            data: {
                ...user.toObject(),
                profileCompletion,
                profileWarnings: getProfileWarnings(user)
            }
        });
    } catch (err) {
        console.error("getUserProfile error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Personal Info ------------------ */
export const updatePersonalInfo = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { name, phone, dateOfBirth, gender, country, state, city, bio } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update name if provided
        if (name) user.name = name;

        // Update personal info
        user.personalInfo = {
            phone: phone || user.personalInfo?.phone,
            dateOfBirth: dateOfBirth || user.personalInfo?.dateOfBirth,
            gender: gender || user.personalInfo?.gender,
            country: country || user.personalInfo?.country,
            state: state || user.personalInfo?.state,
            city: city || user.personalInfo?.city,
            bio: bio || user.personalInfo?.bio
        };

        // Calculate and update profile completion
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Personal info updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updatePersonalInfo error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Education ------------------ */
export const updateEducation = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { education } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.education = education;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Education updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateEducation error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Experience ------------------ */
export const updateExperience = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { experience } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.experience = experience;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Experience updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateExperience error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Certifications ------------------ */
export const updateCertifications = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { certifications } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.certifications = certifications;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Certifications updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateCertifications error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Skills ------------------ */
export const updateSkills = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { technical, soft, languages } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.skills = {
            technical: technical || user.skills?.technical || [],
            soft: soft || user.skills?.soft || [],
            languages: languages || user.skills?.languages || []
        };

        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Skills updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateSkills error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Preferences ------------------ */
export const updatePreferences = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { experienceLevel, jobType, expectedSalary, noticePeriod, willingToRelocate } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isFresher = experienceLevel === "Fresher";
        user.preferences = {
            experienceLevel: experienceLevel !== undefined ? experienceLevel : user.preferences?.experienceLevel,
            jobType: jobType || user.preferences?.jobType,
            expectedSalary: isFresher ? null : (expectedSalary !== undefined && expectedSalary !== "" ? Number(expectedSalary) : user.preferences?.expectedSalary),
            noticePeriod: isFresher ? "" : (noticePeriod !== undefined ? noticePeriod : user.preferences?.noticePeriod),
            willingToRelocate: willingToRelocate !== undefined ? willingToRelocate : user.preferences?.willingToRelocate
        };

        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Preferences updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updatePreferences error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

// Multer setup removed - reusing middleware/uploadCloudinary.js in routes

export const saveProfileImage = async (req, res) => {
    try {
        const userId = req.headers.userid;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // (Optional) We could delete the old image from Cloudinary here using the public_id
        // For now, we just overwrite the URL in the database

        // Get URL: Cloudinary sets secure_url/url on req.file; local storage uses getFileUrl path
        let imageUrl = getFileUrl(req, req.file);
        if (!imageUrl && req.file) {
            imageUrl = req.file.secure_url || req.file.url || (req.file.path && req.file.path.startsWith("http") ? req.file.path : "") || "";
        }
        user.profileImage = imageUrl || user.profileImage;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Profile image uploaded successfully",
            imageUrl: user.profileImage || "",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("saveProfileImage error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Get Resume Data (Profile + Performance) ------------------ */
export const getResumeData = async (req, res) => {
    try {
        const userId = req.headers.userid;
        if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

        const user = await User.findById(userId).select("-password").lean();
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Fetch Interview Performance (Reviews from Experts)
        // Note: candidateId in Review is String, user._id is ObjectId. Convert if needed.
        const Review = (await import("../models/reviewModel.js")).default;
        const reviews = await Review.find({
            candidateId: String(user._id),
            reviewerRole: "expert"
        }).sort({ createdAt: -1 }).limit(5).lean();

        // Calculate Stats
        const totalSessions = reviews.length;
        const avgTechnical = totalSessions > 0
            ? (reviews.reduce((sum, r) => sum + (r.technicalRating || 0), 0) / totalSessions).toFixed(1)
            : 0;
        const avgCommunication = totalSessions > 0
            ? (reviews.reduce((sum, r) => sum + (r.communicationRating || 0), 0) / totalSessions).toFixed(1)
            : 0;

        // Collect unique strengths from all reviews
        const allStrengths = new Set();
        reviews.forEach(r => {
            if (Array.isArray(r.strengths)) {
                r.strengths.forEach(s => allStrengths.add(s));
            }
        });

        const rawExperience = Array.isArray(user.experience) ? user.experience : [];
        const normalizedExperience = rawExperience.filter((exp) =>
            exp && (exp.company || exp.position || exp.description || exp.startDate || exp.endDate)
        );
        const isFresher = String(user.preferences?.experienceLevel || "").toLowerCase() === "fresher";
        const experienceForResume = normalizedExperience.length > 0
            ? normalizedExperience
            : (isFresher ? [{
                company: "Fresher",
                position: "Entry Level Candidate",
                startDate: null,
                endDate: null,
                current: false,
                description: "Fresher profile. Open to entry-level opportunities and actively building practical interview skills."
            }] : []);

        const resumeData = {
            personalInfo: {
                name: user.name,
                email: user.email,
                phone: user.personalInfo?.phone || "",
                location: [user.personalInfo?.city, user.personalInfo?.state].filter(Boolean).join(", "),
                bio: user.personalInfo?.bio || "",
                links: {
                    linkedin: "", // Todo: Add these to User model later if needed
                    portfolio: ""
                }
            },
            education: user.education || [],
            experience: experienceForResume,
            certifications: user.certifications || [],
            skills: user.skills || { technical: [], soft: [], languages: [] },
            preferences: user.preferences || {},
            sectionCounts: {
                experience: experienceForResume.length,
                education: Array.isArray(user.education) ? user.education.length : 0,
                certifications: Array.isArray(user.certifications) ? user.certifications.length : 0,
                technicalSkills: Array.isArray(user.skills?.technical) ? user.skills.technical.length : 0,
                softSkills: Array.isArray(user.skills?.soft) ? user.skills.soft.length : 0,
                languages: Array.isArray(user.skills?.languages) ? user.skills.languages.length : 0
            },
            experienceSummary: {
                isFresher,
                hasProfessionalExperience: normalizedExperience.length > 0
            },
            performance: {
                totalInterviews: totalSessions,
                avgTechnical,
                avgCommunication,
                highlights: Array.from(allStrengths).slice(0, 8), // Top 8 strengths
                recentFeedback: reviews.map(r => ({
                    date: r.createdAt,
                    rating: r.overallRating,
                    feedback: r.feedback
                }))
            }
        };

        return res.json({ success: true, data: resumeData });
    } catch (err) {
        console.error("getResumeData error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};
