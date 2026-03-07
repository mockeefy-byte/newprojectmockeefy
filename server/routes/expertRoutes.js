// routes/expertRoutes.js
import express from "express";
import {
  getExpertProfile,
  uploadProfilePhoto,
  getPersonalInfo,
  updatePersonalInfo,
  getEducation,
  updateEducation,
  deleteEducationEntry,
  getProfessional,
  updateProfessional,
  deletePreviousExperience,
  getSkillsAndExpertise,
  updateSkillsAndExpertise,
  getAvailability,
  updateAvailability,
  deleteBreakDate,
  deleteWeeklySlot,
  uploadVerificationDocs, getExpertProfileImage,
  getAllExperts,
  getVerifiedExperts,
  getPendingExperts,
  getExpertById,
  getRejectedExperts,
  approveExpert,
  rejectExpert,
  resubmitProfile,
  getExpertStats,
  searchExperts,
  updateMySkills
} from "../controllers/expertController.js";

import { authenticateToken } from "../controllers/authController.js";
import { uploadProfile, uploadVerification } from "../middleware/upload.js";


const router = express.Router();

// Public Routes
router.post('/search', searchExperts); // Public search
router.get("/all-experts", getAllExperts);
router.get("/pending", getPendingExperts);
router.get("/verified", getVerifiedExperts);
router.get("/rejected", getRejectedExperts);
router.put("/approve/:id", approveExpert);
router.put("/reject/:id", rejectExpert);

// Protect all expert routes
router.use(authenticateToken);

// Profile
router.get("/profile", getExpertProfile);
router.get("/stats", getExpertStats);
router.get("/admin/profile/:id", getExpertById);
router.post("/profile/photo", uploadProfile.single("photo"), uploadProfilePhoto);
router.get("/profile/image", getExpertProfileImage);

// The rest of your expert routes (implementations must exist in controller)
router.get("/personalinfo", getPersonalInfo);
router.put("/personalinfo", updatePersonalInfo);

router.get("/education", getEducation);
router.put("/education", updateEducation);
router.delete("/education/:idx", deleteEducationEntry);

router.get("/profession", getProfessional);
router.put("/profession", updateProfessional);
router.delete("/profession/previous/:idx", deletePreviousExperience);

router.get("/skills", getSkillsAndExpertise);
router.put("/skills", updateSkillsAndExpertise);
router.put('/myskills', updateMySkills); // Advanced mapping self-service

router.get("/availability", getAvailability);
router.put("/availability", updateAvailability);
router.delete("/availability/delbreak", deleteBreakDate);
router.delete("/availability/delslot", deleteWeeklySlot);
router.post("/resubmit", resubmitProfile);

// Verification
router.put(
  "/verification",
  uploadVerification.fields([
    { name: "companyIdFile", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  uploadVerificationDocs
);

export default router;
