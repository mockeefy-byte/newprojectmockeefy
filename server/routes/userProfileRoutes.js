/**
 * User Profile Routes
 */

import express from "express";
import {
    getUserProfile,
    updatePersonalInfo,
    updateEducation,
    updateExperience,
    updateSkills,
    updatePreferences,
    saveProfileImage,
    updateCertifications,
    getResumeData
} from "../controllers/userProfileController.js";
import { uploadUserProfile } from "../middleware/upload.js";

const router = express.Router();

// Get user profile
router.get("/profile", getUserProfile);

// Get Resume Data (New)
router.get("/profile/resume", getResumeData);

// Update personal info
router.put("/profile/personal", updatePersonalInfo);

// Update education
router.put("/profile/education", updateEducation);

// Update experience
router.put("/profile/experience", updateExperience);

// Update certifications
router.put("/profile/certifications", updateCertifications);

// Update skills
router.put("/profile/skills", updateSkills);

// Update preferences
router.put("/profile/preferences", updatePreferences);

// Upload profile image
router.post("/profile/image", uploadUserProfile.single("profileImage"), saveProfileImage);

export default router;
