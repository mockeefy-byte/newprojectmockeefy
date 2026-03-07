// controllers/expertController.js
import path from "path";
import fs from "fs";
import multer from "multer";
import { getFileUrl } from "../middleware/upload.js";
import mongoose from "mongoose";
import ExpertDetails from "../models/expertModel.js"; // adjust if file name differs
import Session from "../models/Session.js";
import Review from "../models/reviewModel.js";
import PricingRule from "../models/PricingRule.js"; // Added
import Category from "../models/Category.js"; // Added
import User from "../models/User.js"; // Added User model

/* -------------------- Helpers -------------------- */
const resolveUserIdFromReq = (req) => {
  if (req.user) {
    const u = req.user;
    if (u.id) return String(u.id);
    if (u._id) return String(u._id);
    if (u.userId) return String(u.userId);
    if (u.user_id) return String(u.user_id);
    if (u.sub) return String(u.sub);
  }

  // fallback: header (only emergency/legacy)
  const headerCandidate = req.headers.userid || req.headers.userId || req.headers["user-id"];
  if (headerCandidate) {
    // header may contain JSON string or object; try normalize
    try {
      if (typeof headerCandidate === "string" && headerCandidate.trim().startsWith("{")) {
        const parsed = JSON.parse(headerCandidate);
        if (parsed.id) return String(parsed.id);
        if (parsed._id) return String(parsed._id);
        if (parsed.userId) return String(parsed.userId);
      }
      if (typeof headerCandidate === "object") {
        if (headerCandidate.id) return String(headerCandidate.id);
        if (headerCandidate._id) return String(headerCandidate._id);
        if (headerCandidate.userId) return String(headerCandidate.userId);
      }
      return String(headerCandidate);
    } catch (e) {
      return String(headerCandidate);
    }
  }

  return null;
};

const isValidObjectId = (id) => {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Convert to mongoose ObjectId only if id is a valid 24-hex string.
 * Otherwise return the original id (so searches against string-stored ids still work).
 */
const toObjectId = (id) => {
  if (!isValidObjectId(id)) return id;
  return new mongoose.Types.ObjectId(id);
};

/* -------------------- getMissingSectionsHelper -------------------- */
const getMissingSections = (expert, user) => {
  const missing = [];

  // Personal Info (Source: User)
  const uName = user?.name;
  const uPhone = user?.personalInfo?.phone;
  const uCity = user?.personalInfo?.city;
  const uState = user?.personalInfo?.state;
  const uCountry = user?.personalInfo?.country;
  const uGender = user?.personalInfo?.gender;

  const personalFilled = uName && uPhone && uGender && uCity && uCountry;
  if (!personalFilled) missing.push("Personal Information");

  // Education (Source: Expert)
  if (!Array.isArray(expert.education) || !expert.education.length) missing.push("Education");

  // Professional Details (Source: Expert)
  const pd = expert.professionalDetails || {};
  const proFilled = pd.title && pd.company && pd.industry && (typeof pd.totalExperience === "number");
  if (!proFilled) missing.push("Professional Details");

  // Skills (Source: Expert)
  const sk = expert.skillsAndExpertise || {};
  // Check either legacy skills fields OR the new expertSkills array
  const hasSkills = (sk.domains?.length || sk.tools?.length || sk.languages?.length) || (expert.expertSkills && expert.expertSkills.length > 0);
  if (!hasSkills) missing.push("Skills & Expertise");

  // Availability (Source: Expert)
  const av = expert.availability || {};
  let weeklyObj = av.weekly || {};
  if (weeklyObj instanceof Map) {
    weeklyObj = Object.fromEntries(weeklyObj);
  }
  const weeklyHasSlots = Object.values(weeklyObj || {}).some(arr => Array.isArray(arr) && arr.length > 0);
  if (!weeklyHasSlots) missing.push("Availability");

  // Profile Photo (Source: User)
  if (!user?.profileImage) missing.push("Profile Photo");

  // Verification (Source: Expert)
  const v = expert.verification || {};
  const verificationFilled = v.companyId?.url && v.aadhar?.url && v.linkedin;
  if (!verificationFilled) missing.push("Verification Documents");

  return missing;
};

/* -------------------- computeCompletion -------------------- */
const computeCompletion = (expert, user) => {
  let score = 0;

  // Personal Info (20%) - From User
  const uName = user?.name;
  const uPhone = user?.personalInfo?.phone;
  const uCity = user?.personalInfo?.city;
  const uState = user?.personalInfo?.state;
  const uCountry = user?.personalInfo?.country;

  // Basic check for personal info completeness
  if (uName && uPhone && uCity && uCountry) score += 20;

  // Education (15%) - From Expert
  if (Array.isArray(expert.education) && expert.education.length) score += 15;

  // Professional Details (20%) - From Expert
  const pd = expert.professionalDetails || {};
  const proFilled = pd.title && pd.company && pd.industry && (typeof pd.totalExperience === "number");
  if (proFilled) score += 20;

  // Skills (15%) - From Expert
  const sk = expert.skillsAndExpertise || {};
  const hasSkills = (sk.domains?.length || sk.tools?.length || sk.languages?.length) || (expert.expertSkills && expert.expertSkills.length > 0);
  if (hasSkills) score += 15;

  // Availability (15%) - From Expert
  const av = expert.availability || {};
  let weeklyObj = av.weekly || {};
  if (weeklyObj instanceof Map) {
    weeklyObj = Object.fromEntries(weeklyObj);
  }
  const weeklyHasSlots = Object.values(weeklyObj || {}).some(arr => Array.isArray(arr) && arr.length > 0);
  if (weeklyHasSlots) score += 15;

  // Profile Photo (5%) - From User
  if (user?.profileImage) score += 5;

  // Verification (10%) - From Expert
  const v = expert.verification || {};
  if (v.companyId?.url && v.aadhar?.url && v.linkedin) score += 10;

  return Math.min(score, 100);
};

// Multer setup removed - reusing middleware/uploadCloudinary.js in routes

/* -------------------- uploadProfilePhoto -------------------- */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded. Use field 'photo'." });

    // Cloudinary returns the secure URL
    const photoUrl = getFileUrl(req, req.file);

    // find expert & user
    const queryUserId = toObjectId(userIdRaw);

    // Update User Profile Image (Source of Truth)
    const user = await User.findByIdAndUpdate(queryUserId, { profileImage: photoUrl }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let expert = await ExpertDetails.findOne({ userId: queryUserId });

    // Auto-create if not found
    if (!expert) {
      expert = new ExpertDetails({
        userId: queryUserId,
        status: "pending",
        personalInformation: {},
        professionalDetails: {},
        education: [],
        skillsAndExpertise: { mode: "Online", domains: [], tools: [], languages: [] },
        availability: { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
        verification: {}
      });
      await expert.save();
    }

    // We do NOT save photo to expert.profileImage anymore.

    const completion = computeCompletion(expert, user);
    const missingSections = getMissingSections(expert, user);

    const profile = {
      name: user.name || "",
      title: expert.professionalDetails?.title || "",
      company: expert.professionalDetails?.company || "",
      photoUrl: user.profileImage || ""
    };

    return res.json({ success: true, message: "Photo uploaded", completion, missingSections, profile });
  } catch (err) {
    console.error("uploadProfilePhoto error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

export const getExpertProfileImage = async (req, res) => {
  try {
    const userIdRaw = req.user?.id || req.user?._id;
    if (!userIdRaw) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const expert = await ExpertDetails.findOne({ userId: userIdRaw }).lean();

    const image = expert?.profileImage || "";

    return res.json({ success: true, image });
  } catch (err) {
    console.error("getExpertProfileImage error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/* -------------------- uploadVerificationDocs -------------------- */
export const uploadVerificationDocs = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert profile not found.' });
    }

    // Initialize verification object if missing
    if (!expert.verification) expert.verification = {};

    // build accessible URL (use host from request)
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;

    // Handle uploaded files (Cloudinary)
    if (req.files) {
      if (req.files.companyIdFile && req.files.companyIdFile[0]) {
        expert.verification.companyId = {
          url: getFileUrl(req, req.files.companyIdFile[0]),
          name: req.files.companyIdFile[0].originalname
        };
      }
      if (req.files.aadharFile && req.files.aadharFile[0]) {
        expert.verification.aadhar = {
          url: getFileUrl(req, req.files.aadharFile[0]),
          name: req.files.aadharFile[0].originalname
        };
      }

      // Handle linkedin URL
      if (req.body.linkedin) {
        expert.verification.linkedin = req.body.linkedin;
      }

      await expert.save({ validateBeforeSave: false });

      return res.json({
        success: true,
        message: 'Verification details updated',
        verification: expert.verification
      });
    }
  } catch (err) {
    console.error("uploadVerificationDocs error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

/* -------------------- resubmitProfile -------------------- */
export const resubmitProfile = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Only allow resubmission if currently rejected
    if (expert.status !== "rejected") {
      return res.status(400).json({ success: false, message: "Only rejected profiles can be resubmitted." });
    }

    expert.status = "pending";
    expert.rejectionReason = ""; // Clear reason on resubmit
    await expert.save();

    return res.json({ success: true, message: "Profile resubmitted for verification", status: "pending" });
  } catch (err) {
    console.error("resubmitProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getExpertProfile -------------------- */
export const getExpertProfile = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);

    // Parallel fetch: Expert Details AND User Identity
    let [expert, user] = await Promise.all([
      ExpertDetails.findOne({ userId: queryUserId }).populate('expertSkills.skillId', 'name'),
      User.findById(queryUserId)
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User identity not found" });
    }

    // Auto-create expert profile if it doesn't exist (Lazy initialization)
    if (!expert) {
      expert = new ExpertDetails({
        userId: queryUserId,
        status: "pending",
        personalInformation: {},
        professionalDetails: {},
        education: [],
        skillsAndExpertise: { mode: "Online", domains: [], tools: [], languages: [] },
        availability: { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
        verification: {}
      });
      await expert.save();
    }

    const expertLean = expert.toObject ? expert.toObject() : expert;

    const profile = {
      // Identity from User
      name: user.name || "",
      mobile: user.personalInfo?.phone || "",
      gender: user.personalInfo?.gender || "",
      dob: user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toISOString().split("T")[0] : "",
      country: user.personalInfo?.country || "",
      state: user.personalInfo?.state || "",
      city: user.personalInfo?.city || "",

      // Expert Specifics
      title: expertLean.professionalDetails?.title || "",
      company: expertLean.professionalDetails?.company || "",
      totalExperience: expertLean.professionalDetails?.totalExperience ?? "",
      industry: expertLean.professionalDetails?.industry || "",
      level: expertLean.professionalDetails?.level || "Intermediate",
      previous: expertLean.professionalDetails?.previous || [],
      education: expertLean.education || [],
      skillsAndExpertise: expertLean.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] },
      expertSkills: expertLean.expertSkills || [],
      availability: expertLean.availability || { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
      verification: expertLean.verification || {},
      status: expertLean.status || "pending",
      rejectionReason: expertLean.rejectionReason || "",

      // Photo from User
      photoUrl: user.profileImage || "",

      // Category from Expert (Personal Info legacy)
      category: expertLean.personalInformation?.category || ""
    };

    const completion = computeCompletion(expertLean, user);
    const missingSections = getMissingSections(expertLean, user);
    return res.json({ success: true, completion, missingSections, profile });
  } catch (err) {
    console.error("getExpertProfile error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

/* -------------------- getExpertById (Admin/Public View) -------------------- */
export const getExpertById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    // Usually we look up by Expert _id, not userId, when we have the specific ID
    let expert = await ExpertDetails.findById(id).lean();

    // If not found, try finding by userId just in case
    if (!expert) {
      expert = await ExpertDetails.findOne({ userId: id }).lean();
    }

    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Populate user details (Crucial for Identity)
    const user = await User.findById(expert.userId).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "Expert identity not found" });
    }

    const profile = {
      _id: expert._id,
      userId: expert.userId,

      // Identity from User
      name: user.name || "Expert",
      mobile: user.personalInfo?.phone || "",
      gender: user.personalInfo?.gender || "",
      dob: user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toISOString().split("T")[0] : "",
      country: user.personalInfo?.country || "",
      state: user.personalInfo?.state || "",
      city: user.personalInfo?.city || "",

      // Expert Details
      title: expert.professionalDetails?.title || "",
      company: expert.professionalDetails?.company || "",
      totalExperience: expert.professionalDetails?.totalExperience ?? "",
      industry: expert.professionalDetails?.industry || "",
      level: expert.professionalDetails?.level || "Intermediate",
      previous: expert.professionalDetails?.previous || [],
      education: expert.education || [],
      skillsAndExpertise: expert.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] },
      availability: expert.availability || { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
      verification: expert.verification || {},
      status: expert.status || "pending",

      // Photo from User
      photoUrl: user.profileImage || "",

      // Category from Expert
      category: expert.personalInformation?.category || ""
    };

    // --- Dynamic Price Calculation ---
    let price = 0; // Default fallback
    try {
      if (profile.category) {
        const catDoc = await Category.findOne({ name: profile.category });
        if (catDoc) {
          const pricingRule = await PricingRule.findOne({
            categoryId: catDoc._id,
            skillId: null, // Base category price
            level: profile.level || "Intermediate",
            duration: 30 // Default 30 min price for profile display
          });
          if (pricingRule) price = pricingRule.price;
        }
      }
    } catch (e) { console.error("Price calc error:", e); }

    profile.price = price; // Add price to response

    return res.json({ success: true, profile });
  } catch (err) {
    console.error("getExpertById error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- getPersonalInfo (uses resolver) -------------------- */
export const getPersonalInfo = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (expert) {
      return res.status(200).json({ success: true, data: expert.personalInformation });
    } else {
      return res.status(200).json({
        success: true,
        data: { userName: "", mobile: "", gender: "", dob: "", country: "", state: "", city: "" }
      });
    }
  } catch (err) {
    console.error("getPersonalInfo error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- updatePersonalInfo -------------------- */
export const updatePersonalInfo = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const { userName, mobile, gender, dob, country, state, city, category, bio } = req.body;

    // 1. Update User Identity
    const userUpdate = {};
    if (userName !== undefined) userUpdate.name = userName; // Map userName -> name
    if (bio !== undefined) userUpdate["personalInfo.bio"] = bio;
    if (mobile !== undefined) userUpdate["personalInfo.phone"] = mobile;
    if (gender !== undefined) userUpdate["personalInfo.gender"] = gender;
    if (dob !== undefined) userUpdate["personalInfo.dateOfBirth"] = dob;
    if (country !== undefined) userUpdate["personalInfo.country"] = country;
    if (state !== undefined) userUpdate["personalInfo.state"] = state;
    if (city !== undefined) userUpdate["personalInfo.city"] = city;

    const user = await User.findByIdAndUpdate(queryUserId, { $set: userUpdate }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Update Expert Profile (Category only)
    let expert = await ExpertDetails.findOne({ userId: queryUserId });

    // Auto-create if missing
    if (!expert) {
      expert = new ExpertDetails({ userId: queryUserId });
    }

    if (category) {
      const existingCat = expert.personalInformation?.category;

      // Strict check: Cannot change category once set
      if (existingCat && existingCat !== category) {
        return res.status(400).json({ success: false, message: "Category has already been set and cannot be changed" });
      }

      // Validate category
      const allowedCategories = ["IT", "HR", "Business", "Design", "Marketing", "Finance", "AI", "IT & Software", "Non-IT Corporate", "Medical", "Legal", "Creative"];
      if (allowedCategories.includes(category)) {
        if (!expert.personalInformation) expert.personalInformation = {};
        expert.personalInformation.category = category;
        await expert.save();
      }
    }

    // Construct response object (Mocking the structure frontend expects)
    const responseData = {
      personalInformation: {
        userName: user.name,
        mobile: user.personalInfo?.phone,
        gender: user.personalInfo?.gender,
        dob: user.personalInfo?.dateOfBirth,
        country: user.personalInfo?.country,
        state: user.personalInfo?.state,
        city: user.personalInfo?.city,
        category: expert.personalInformation?.category,
        bio: user.personalInfo?.bio
      }
    };

    return res.status(200).json({ success: true, message: "Personal info updated successfully", data: responseData });
  } catch (error) {
    console.error("❌ updatePersonalInfo error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getEducation / updateEducation / deleteEducationEntry -------------------- */
export const getEducation = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (expert && expert.education && expert.education.length) return res.status(200).json({ success: true, data: expert.education });
    return res.status(200).json({ success: true, data: [] });
  } catch (err) {
    console.error("getEducation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { education } = req.body;
    if (!education || !Array.isArray(education)) return res.status(400).json({ success: false, message: "Education must be an array" });

    const mapped = education.map(edu => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      field: edu.field || "",
      start: edu.start || null,
      end: edu.end || null
    }));

    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { education: mapped, userId: queryUserId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Education updated", data: expert.education });
  } catch (err) {
    console.error("updateEducation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteEducationEntry = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { idx } = req.params;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!Array.isArray(expert.education) || idx < 0 || idx >= expert.education.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }

    expert.education.splice(idx, 1);
    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Education entry deleted", data: expert.education });
  } catch (err) {
    console.error("deleteEducationEntry error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getProfessional / updateProfessional / deletePreviousExperience -------------------- */
export const getProfessional = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (expert && expert.professionalDetails) return res.status(200).json({ success: true, data: expert.professionalDetails });

    return res.status(200).json({ success: true, data: { title: "", company: "", totalExperience: "", industry: "", level: "Intermediate", previous: [] } });
  } catch (err) {
    console.error("getProfessional error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfessional = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const professionalDetails = req.body.professionalDetails || req.body;
    if (!professionalDetails) return res.status(400).json({ success: false, message: "Professional details required" });

    const payload = {
      title: professionalDetails.title || "",
      company: professionalDetails.company || "",
      totalExperience: Number(professionalDetails.totalExperience) || 0,
      industry: professionalDetails.industry || "",
      level: professionalDetails.level || "Intermediate", // Added level
      previous: Array.isArray(professionalDetails.previous)
        ? professionalDetails.previous.map(exp => ({
          company: exp.company || "",
          title: exp.title || "",
          start: exp.start || null,
          end: exp.end || null
        }))
        : []
    };

    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { professionalDetails: payload, userId: queryUserId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Professional details updated", data: expert.professionalDetails });
  } catch (err) {
    console.error("updateProfessional error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePreviousExperience = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { idx } = req.params;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!expert.professionalDetails || !Array.isArray(expert.professionalDetails.previous) || idx < 0 || idx >= expert.professionalDetails.previous.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }

    expert.professionalDetails.previous.splice(idx, 1);
    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Previous experience deleted", data: expert.professionalDetails.previous });
  } catch (err) {
    console.error("deletePreviousExperience error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getSkillsAndExpertise / updateSkillsAndExpertise -------------------- */
export const getSkillsAndExpertise = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Skills & Expertise fetched successfully",
      data: expert.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] }
    });
  } catch (err) {
    console.error("getSkillsAndExpertise error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSkillsAndExpertise = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const skills = req.body.skillsAndExpertise;

    if (!skills) return res.status(400).json({ success: false, message: "skillsAndExpertise is required in body" });

    const { mode, domains, tools, languages } = skills;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!expert.skillsAndExpertise) expert.skillsAndExpertise = { mode: "Online", domains: [], tools: [], languages: [] };

    if (mode) {
      const allowedModes = ["Online", "Offline", "Hybrid"];
      if (!allowedModes.includes(mode)) return res.status(400).json({ success: false, message: "Invalid mode" });
      expert.skillsAndExpertise.mode = mode;
    }
    if (Array.isArray(domains)) expert.skillsAndExpertise.domains = domains;
    if (Array.isArray(tools)) expert.skillsAndExpertise.tools = tools;
    if (Array.isArray(languages)) expert.skillsAndExpertise.languages = languages;

    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Skills updated", data: expert.skillsAndExpertise });
  } catch (err) {
    console.error("updateSkillsAndExpertise error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getExpertStats -------------------- */
export const getExpertStats = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized" });
    const queryUserId = toObjectId(userIdRaw);

    // Get expertId (string based on schema)
    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Use expert userId as expertId string for sessions (based on current implementation pattern)
    // Or if session uses expert._id, check that. 
    // Session schema says expertId: String. Usually it's the User._id string.
    const expertId = String(queryUserId);



    const now = new Date();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);



    const [
      totalSessions,
      upcomingSessions,
      todaysBookings,
      completedSessions,
      ratings
    ] = await Promise.all([
      // Total
      import("../models/Session.js").then(m => m.default.countDocuments({ expertId })),
      // Upcoming (confirmed & future)
      import("../models/Session.js").then(m => m.default.countDocuments({ expertId, status: 'confirmed', startTime: { $gt: now } })),
      // Today (confirmed & today)
      import("../models/Session.js").then(m => m.default.countDocuments({
        expertId,
        status: 'confirmed',
        startTime: { $gte: startOfDay, $lte: endOfDay }
      })),
      // Completed for revenue
      import("../models/Session.js").then(m => m.default.find({ expertId, status: 'completed' }, 'price')),
      // Ratings
      import("../models/reviewModel.js").then(m => m.default.find({ expertId, reviewerRole: 'candidate' }, 'overallRating')) // Ratings GIVEN to expert
    ]);

    // Calculate revenue
    const revenue = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0);

    // Calculate avg rating
    let avgRating = 0;
    if (ratings.length > 0) {
      const sumRating = ratings.reduce((sum, r) => sum + r.overallRating, 0);
      avgRating = Number((sumRating / ratings.length).toFixed(1));
    }

    // Session completion rate (completed / total created)
    // Simplification: if total is 0, 100%
    const completionRate = totalSessions > 0
      ? Math.round((completedSessions.length / totalSessions) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSessions,
        upcomingSessions,
        todaysBookings,
        revenue,
        rating: avgRating,
        completionRate
      }
    });

  } catch (err) {
    console.error("getExpertStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAvailability = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (expert && expert.availability) return res.status(200).json({ success: true, data: expert.availability });

    return res.status(200).json({ success: true, data: { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] } });
  } catch (err) {
    console.error("getAvailability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const newAvailability = req.body;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    if (!expert.availability) expert.availability = { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] };

    expert.availability.sessionDuration = newAvailability.sessionDuration ?? expert.availability.sessionDuration;
    expert.availability.maxPerDay = newAvailability.maxPerDay ?? expert.availability.maxPerDay;
    // ensure weekly is a plain object
    expert.availability.weekly = newAvailability.weekly ?? expert.availability.weekly ?? {};
    expert.availability.breakDates = newAvailability.breakDates ?? expert.availability.breakDates ?? [];

    await expert.save();
    return res.status(200).json({ success: true, message: "Availability updated", data: expert.availability });
  } catch (err) {
    console.error("updateAvailability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteBreakDate = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { start } = req.body;
    if (!start) return res.status(400).json({ success: false, message: "Break start missing" });

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Normalize and compare ISO strings to be robust for Date/string variants
    const targetIso = new Date(start).toISOString();
    expert.availability = expert.availability || { breakDates: [], weekly: {} };
    expert.availability.breakDates = (expert.availability.breakDates || []).filter(d => {
      try {
        return new Date(d.start).toISOString() !== targetIso;
      } catch (e) {
        // if parsing fails, keep the entry
        return true;
      }
    });

    await expert.save();
    return res.status(200).json({ success: true, message: "Break date removed", data: expert.availability.breakDates });
  } catch (err) {
    console.error("deleteBreakDate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteWeeklySlot = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { day, from } = req.body;
    if (!day || !from) return res.status(400).json({ success: false, message: "Day or from missing" });

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    expert.availability = expert.availability || { weekly: {} };
    const weekly = expert.availability.weekly || {};
    const slots = Array.isArray(weekly[day]) ? weekly[day] : [];
    weekly[day] = slots.filter(slot => slot.from !== from);
    expert.availability.weekly = weekly;

    await expert.save();
    return res.status(200).json({ success: true, message: "Slot removed", data: expert.availability.weekly[day] });
  } catch (err) {
    console.error("deleteWeeklySlot error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getPendingExperts (Pending verification) -------------------- */
/* -------------------- getPendingExperts (Pending verification) -------------------- */
export const getPendingExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.aggregate([
      { $match: { status: "pending" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    // Format matches frontend expectation + joined data
    const formatted = await Promise.all(experts.map(async expert => {
      // Manually populate expertSkills.skillId
      await ExpertDetails.populate(expert, { path: 'expertSkills.skillId', select: 'name' });

      return {
        _id: expert._id,
        userId: expert.userId,
        profileImage: expert.profileImage || "",
        education: expert.education || [],
        personalInformation: {
          userName: expert.userDetails?.name || "Expert",
          mobile: expert.userDetails?.personalInfo?.phone || expert.personalInformation?.mobile || "",
          gender: expert.userDetails?.personalInfo?.gender || expert.personalInformation?.gender || "",
          dob: expert.userDetails?.personalInfo?.dateOfBirth || expert.personalInformation?.dob || null,
          country: expert.userDetails?.personalInfo?.country || expert.personalInformation?.country || "",
          state: expert.userDetails?.personalInfo?.state || expert.personalInformation?.state || "",
          city: expert.userDetails?.personalInfo?.city || expert.personalInformation?.city || "",
          category: expert.personalInformation?.category || "IT"
        },
        professionalDetails: {
          title: expert.professionalDetails?.title || "",
          company: expert.professionalDetails?.company || "",
          totalExperience: expert.professionalDetails?.totalExperience || 0,
          industry: expert.professionalDetails?.industry || "",
          level: expert.professionalDetails?.level || "Intermediate",
          previous: expert.professionalDetails?.previous || []
        },
        skillsAndExpertise: {
          mode: expert.skillsAndExpertise?.mode || "Online",
          domains: expert.skillsAndExpertise?.domains || [],
          // Map expertSkills to tools for legacy frontend compatibility
          tools: (expert.skillsAndExpertise?.tools && expert.skillsAndExpertise.tools.length > 0)
            ? expert.skillsAndExpertise.tools
            : (expert.expertSkills ? expert.expertSkills.map(s => s.skillId?.name).filter(Boolean) : []),
          languages: expert.skillsAndExpertise?.languages || []
        },
        availability: {
          sessionDuration: expert.availability?.sessionDuration || 30,
          maxPerDay: expert.availability?.maxPerDay || 1,
          weekly: expert.availability?.weekly || {},
          breakDates: expert.availability?.breakDates || []
        },
        verification: expert.verification || {},
        userDetails: {
          email: expert.userDetails?.email || "",
          _id: expert.userDetails?._id
        }
      };
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error("getPendingExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- getVerifiedExperts (Active experts only) -------------------- */
/* -------------------- getRejectedExperts (Rejected experts only) -------------------- */
/* -------------------- getRejectedExperts (Rejected experts only) -------------------- */
export const getRejectedExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.aggregate([
      { $match: { status: "rejected" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    // Format matches frontend expectation + joined data
    const formatted = await Promise.all(experts.map(async expert => {
      // Manually populate expertSkills.skillId
      await ExpertDetails.populate(expert, { path: 'expertSkills.skillId', select: 'name' });

      return {
        _id: expert._id,
        userId: expert.userId,
        profileImage: expert.profileImage || "",
        education: expert.education || [],
        personalInformation: {
          userName: expert.userDetails?.name || "Expert",
          mobile: expert.userDetails?.personalInfo?.phone || expert.personalInformation?.mobile || "",
          gender: expert.userDetails?.personalInfo?.gender || expert.personalInformation?.gender || "",
          dob: expert.userDetails?.personalInfo?.dateOfBirth || expert.personalInformation?.dob || null,
          country: expert.userDetails?.personalInfo?.country || expert.personalInformation?.country || "",
          state: expert.userDetails?.personalInfo?.state || expert.personalInformation?.state || "",
          city: expert.userDetails?.personalInfo?.city || expert.personalInformation?.city || "",
          category: expert.personalInformation?.category || "IT"
        },
        professionalDetails: {
          title: expert.professionalDetails?.title || "",
          company: expert.professionalDetails?.company || "",
          totalExperience: expert.professionalDetails?.totalExperience || 0,
          industry: expert.professionalDetails?.industry || "",
          level: expert.professionalDetails?.level || "Intermediate",
          previous: expert.professionalDetails?.previous || []
        },
        skillsAndExpertise: {
          mode: expert.skillsAndExpertise?.mode || "Online",
          domains: expert.skillsAndExpertise?.domains || [],
          // Map expertSkills to tools for legacy frontend compatibility
          tools: (expert.skillsAndExpertise?.tools && expert.skillsAndExpertise.tools.length > 0)
            ? expert.skillsAndExpertise.tools
            : (expert.expertSkills ? expert.expertSkills.map(s => s.skillId?.name).filter(Boolean) : []),
          languages: expert.skillsAndExpertise?.languages || []
        },
        availability: {
          sessionDuration: expert.availability?.sessionDuration || 30,
          maxPerDay: expert.availability?.maxPerDay || 1,
          weekly: expert.availability?.weekly || {},
          breakDates: expert.availability?.breakDates || []
        },
        verification: expert.verification || {},
        rejectionReason: expert.rejectionReason || "",
        userDetails: {
          email: expert.userDetails?.email || "",
          _id: expert.userDetails?._id
        }
      };
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error("getRejectedExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
/* -------------------- getVerifiedExperts (Active experts only) -------------------- */
export const getVerifiedExperts = async (req, res) => {
  try {
    const { category } = req.query;

    const pipeline = [
      { $match: { status: "Active" } }
    ];

    if (category && category !== "all") {
      pipeline[0].$match["personalInformation.category"] = category;
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false // Only show experts with valid user account
        }
      }
    );

    const experts = await ExpertDetails.aggregate(pipeline);

    // Format matches frontend expectation + joined data
    const formatted = await Promise.all(experts.map(async expert => {
      // 1. Manually populate expertSkills.skillId because we are using aggregation
      await ExpertDetails.populate(expert, { path: 'expertSkills.skillId', select: 'name' });

      // Pricing Logic
      let price = 0;
      try {
        const catName = expert.personalInformation?.category;
        const level = expert.professionalDetails?.level || "Intermediate";

        if (catName) {
          const catDoc = await Category.findOne({ name: catName });
          if (catDoc) {
            const rule = await PricingRule.findOne({
              categoryId: catDoc._id,
              level: level,
              duration: 30, // Default to 30 mins
              skillId: null
            });
            if (rule) price = rule.price;
          }
        }
      } catch (e) { console.error("Price fetch error", e); }

      return {
        _id: expert._id,
        userId: expert.userId,
        profileImage: expert.profileImage || "",
        price: price, // Dynamic Price
        personalInformation: {
          userName: expert.userDetails?.name || "Expert",
          mobile: expert.userDetails?.personalInfo?.phone || expert.personalInformation?.mobile || "",
          gender: expert.userDetails?.personalInfo?.gender || expert.personalInformation?.gender || "",
          dob: expert.userDetails?.personalInfo?.dateOfBirth || expert.personalInformation?.dob || null,
          country: expert.userDetails?.personalInfo?.country || expert.personalInformation?.country || "",
          state: expert.userDetails?.personalInfo?.state || expert.personalInformation?.state || "",
          city: expert.userDetails?.personalInfo?.city || expert.personalInformation?.city || "",
          category: expert.personalInformation?.category || "IT"
        },
        professionalDetails: {
          title: expert.professionalDetails?.title || "",
          company: expert.professionalDetails?.company || "",
          totalExperience: expert.professionalDetails?.totalExperience || 0,
          industry: expert.professionalDetails?.industry || "",
          level: expert.professionalDetails?.level || "Intermediate",
          previous: expert.professionalDetails?.previous || []
        },
        skillsAndExpertise: {
          mode: expert.skillsAndExpertise?.mode || "Online",
          domains: expert.skillsAndExpertise?.domains || [],
          // Map expertSkills to tools for legacy frontend compatibility if tools are empty
          tools: (expert.skillsAndExpertise?.tools && expert.skillsAndExpertise.tools.length > 0)
            ? expert.skillsAndExpertise.tools
            : (expert.expertSkills ? expert.expertSkills.map(s => s.skillId?.name).filter(Boolean) : []),
          languages: expert.skillsAndExpertise?.languages || []
        },
        // Enhanced Skills Data
        expertSkills: expert.expertSkills ? expert.expertSkills.map(s => ({
          _id: s._id,
          skillId: s.skillId?._id || s.skillId, // Handle both populated and unpopulated cases safely
          skillName: s.skillId?.name || "Unknown Skill",
          level: s.level,
          isEnabled: s.isEnabled
        })) : [],
        availability: {
          sessionDuration: expert.availability?.sessionDuration || 30,
          maxPerDay: expert.availability?.maxPerDay || 1,
          weekly: expert.availability?.weekly || {},
          breakDates: expert.availability?.breakDates || []
        },
        verification: expert.verification || {},
        userDetails: {
          email: expert.userDetails?.email || "",
          _id: expert.userDetails?._id
        }
      };
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });

  } catch (err) {
    console.error("getVerifiedExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- getAllExperts (Public Listing) -------------------- */
export const getAllExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.find().populate('userId').lean();

    const formatted = await Promise.all(experts.map(async expert => {
      let price = 0;
      try {
        const catName = expert.personalInformation?.category || expert.category;
        if (catName) {
          const catDoc = await Category.findOne({ name: catName });
          if (catDoc) {
            const rule = await PricingRule.findOne({
              categoryId: catDoc._id,
              skillId: null,
              level: expert.professionalDetails?.level || "Intermediate",
              duration: 30 // Default 30 min for listing
            });
            if (rule) price = rule.price;
          }
        }
      } catch (e) { }

      return {
        id: expert._id,
        name: expert.userId?.name || expert.personalInformation?.userName || "Expert",
        role: expert.professionalDetails?.title || "",
        experience: (expert.professionalDetails?.totalExperience || 0) + " yrs",
        skills: expert.skillsAndExpertise?.languages || [],
        rating: 4.8,
        price: price > 0 ? price : 499, // Fallback to 499 if no rule found
        category: expert.personalInformation?.category || expert.category,
        company: expert.professionalDetails?.company || "",
        avatar: expert.userId?.profileImage || expert.profileImage || "",
        location: expert.userId?.personalInfo?.city || expert.personalInformation?.city || "",
        reviews: 32,
        responseTime: "1 hour",
        successRate: 92,
        isVerified: true
      };
    }));

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("getAllExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- Approve Expert -------------------- */
export const approveExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const expert = await ExpertDetails.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    return res.json({ success: true, message: "Expert approved successfully", data: expert });
  } catch (err) {
    console.error("approveExpert error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- Reject Expert -------------------- */
export const rejectExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const expert = await ExpertDetails.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason: reason
      },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    return res.json({ success: true, message: "Expert rejected successfully", data: expert });
  } catch (err) {
    console.error("rejectExpert error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- Get Active Experts -------------------- */
export const getActiveExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.find({ status: { $in: ["verified", "Active"] } })
      .select("user personalInformation expertSkills adminMappings status");

    res.json(experts);
  } catch (error) {
    console.error("Error fetching active experts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- Search Experts (User Booking) -------------------- */
export const searchExperts = async (req, res) => {
  try {
    const { category, skillId, level, duration } = req.body;

    // Base Query: Active experts only
    const query = { status: "Active" };

    // 1. Filter by Category
    if (category) {
      query["personalInformation.category"] = category;
    }

    // 2. Filter by Skill (if provided)
    if (skillId) {
      query["expertSkills.skillId"] = skillId;
      query["expertSkills.isEnabled"] = true;
    }

    // Fetch experts
    let experts = await ExpertDetails.find(query)
      .populate("userId", "name email profileImage") // To get name
      .populate("expertSkills.skillId", "name"); // To show skill names

    // 3. Filter/Sort by Level (Client side or in-memory filtering for MVP)
    // Logic: specific level matching
    if (skillId && level) {
      experts = experts.filter(e => {
        const skill = e.expertSkills.find(s => s.skillId._id.toString() === skillId && s.isEnabled);
        if (!skill) return false;

        // Simple level checks (Exact match or higher?)
        // For now, exact match or let user decide in UI, 
        // but typically "Intermediate" can do "Beginner".
        const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
        const expertLevelIdx = levels.indexOf(skill.level);
        const reqLevelIdx = levels.indexOf(level);

        return expertLevelIdx >= reqLevelIdx;
      });
    }

    // Transform for UI
    const results = await Promise.all(experts.map(async (e) => {
      // Calculate Price using Pricing Model
      let price = 0;
      const categoryName = e.personalInformation?.category || "IT";
      // Determine level: if skillId provided, use that skill's level, else default/avg
      let levelToPrice = "Intermediate"; // Default fallback

      if (skillId) {
        const skill = e.expertSkills.find(s => s.skillId._id.toString() === skillId);
        if (skill && skill.level) levelToPrice = skill.level;
      } else if (level) {
        levelToPrice = level;
      }

      const dur = Number(duration) || 60; // Default to 60 for search, or whatever the UI expects

      try {
        // Resolve Category Name to ID
        const catDoc = await Category.findOne({ name: categoryName });

        if (catDoc) {
          const pricingRule = await PricingRule.findOne({
            categoryId: catDoc._id,
            level: levelToPrice, // Correct field name
            duration: dur
          });

          if (pricingRule) price = pricingRule.price;
        }

      } catch (err) {
        // console.error("Price lookup failed in search", err);
      }

      return {
        _id: e._id,
        name: e.userId?.name || e.personalInformation?.userName || "Expert",
        title: e.professionalDetails?.title || "Professional",
        company: e.professionalDetails?.company || "Confidential",
        price: price, // Now from Pricing Table
        rating: e.metrics?.avgRating || 0,
        skills: e.expertSkills.map(s => s.skillId?.name).filter(Boolean),
        profileImage: e.userId?.profileImage || e.profileImage
      };
    }));

    res.json(results);

  } catch (error) {
    console.error("Search experts error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

/* -------------------- Update My Skills (Expert Self-Service) -------------------- */
export const updateMySkills = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ message: "Unauthorized" });
    const queryUserId = toObjectId(userIdRaw);

    const { expertSkills } = req.body; // Array of { skillId, level, priceAdjustment }

    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { $set: { expertSkills } },
      { new: true }
    ).populate('expertSkills.skillId', 'name');

    if (!expert) return res.status(404).json({ message: "Expert not found" });

    res.json(expert.expertSkills);
  } catch (error) {
    console.error("Update my skills error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
