import * as sessionService from '../services/sessionService.js';
import * as meetingService from '../services/meetingService.js';
import PricingRule from '../models/PricingRule.js';
import ExpertDetails from '../models/expertModel.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
    try {
        const { expertId, candidateId, userId, startTime, endTime, topics, level, status, skill } = req.body;

        // Use provided ID or generate one
        const sessionId = req.body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Calculate Duration
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMinutes = Math.round((end - start) / (1000 * 60));

        // Fetch Expert to get Category
        let expert = await ExpertDetails.findOne({ $or: [{ _id: expertId }, { userId: expertId }] });
        if (!expert) {
            return res.status(404).json({ success: false, message: "Expert not found" });
        }

        // --- PRICING: category-based only (no skill). Uses PricingRule: category + level + duration ---
        const categoryName = expert.personalInformation?.category || "IT";
        const selectedLevel = level || expert.professionalDetails?.level || "Intermediate";

        const Category = (await import('../models/Category.js')).default;
        const catDoc = await Category.findOne({ name: categoryName });
        if (!catDoc) {
            return res.status(400).json({ success: false, message: `Category '${categoryName}' not configured in system.` });
        }

        let finalPrice = null;
        const pricingRule = await PricingRule.findOne({
            categoryId: catDoc._id,
            skillId: null,
            level: selectedLevel,
            duration: Number(durationMinutes),
        });
        if (pricingRule) {
            finalPrice = pricingRule.price;
        } else if (catDoc.amount != null && catDoc.amount >= 0) {
            finalPrice = durationMinutes === 30 ? catDoc.amount : Math.round(catDoc.amount * 1.8);
        }
        if (finalPrice == null) {
            return res.status(400).json({
                success: false,
                message: `Pricing not configured for ${categoryName} - ${selectedLevel} - ${durationMinutes} mins. Set base in Admin → Categories or rules in Admin → Pricing.`,
            });
        }

        const sessionData = {
            sessionId,
            expertId,
            candidateId: candidateId || userId, // Handle alias
            startTime: start,
            endTime: end,
            topics: topics || [],
            price: finalPrice, // ALWAYS use server-calculated price
            status: status || 'confirmed',
            meetingLink: expert?.availability?.defaultMeetingLink || null,
        };

        const session = await sessionService.createSession(sessionData);
        res.status(201).json({ success: true, message: "Session created successfully", data: session });
    } catch (error) {
        console.error("Create Session Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const updateMeetingLink = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { meetingLink } = req.body;
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        const updated = await sessionService.updateSessionMeetingLink(sessionId, meetingLink);
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update meeting link error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const completeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        await sessionService.completeSession(sessionId);
        try {
            await meetingService.updateMeetingStatus(sessionId, 'finished');
        } catch (_) { /* meeting may not exist */ }
        return res.json({ success: true, message: "Session completed" });
    } catch (error) {
        console.error("Complete session error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // --- ENRICHMENT LOGIC (Single Session) ---
        const Expert = (await import('../models/expertModel.js')).default;
        const User = (await import('../models/User.js')).default;
        const mongoose = (await import('mongoose')).default;

        let expert = null;
        let candidate = null;
        const lookupId = session.expertId;

        try {
            if (mongoose.Types.ObjectId.isValid(lookupId)) {
                const oid = new mongoose.Types.ObjectId(lookupId);
                expert = await Expert.findOne({ userId: oid }).populate('userId');
                if (!expert) expert = await Expert.findById(oid).populate('userId');
            }
            if (!expert && typeof lookupId === 'string' && lookupId.includes('@')) {
                const userByEmail = await User.findOne({ email: lookupId.toLowerCase() });
                if (userByEmail) {
                    expert = await Expert.findOne({ userId: userByEmail._id }).populate('userId');
                }
            }
        } catch (e) {
            console.error("Expert lookup failed", e);
        }

        // Candidate Lookup
        try {
            if (mongoose.Types.ObjectId.isValid(session.candidateId)) {
                candidate = await User.findById(session.candidateId);
            } else if (typeof session.candidateId === 'string' && session.candidateId.includes('@')) {
                candidate = await User.findOne({ email: session.candidateId.toLowerCase() });
            }
        } catch (e) {
            console.error("Candidate lookup failed", e);
        }

        // Details construction
        let expertName = 'Unknown Expert';
        let expertRole = 'Expert';
        let expertCompany = 'N/A';
        let expertImage = null;

        if (expert) {
            expertName = expert.personalInformation?.userName || expert.userId?.name || 'Expert';
            expertRole = expert.professionalDetails?.title || 'Expert';
            expertCompany = expert.professionalDetails?.company || 'N/A';
            expertImage = expert.profileImage || expert.userId?.profileImage || null;
        } else {
            // Fallback to User if Expert Profile missing
            try {
                if (mongoose.Types.ObjectId.isValid(lookupId)) {
                    const u = await User.findById(lookupId);
                    if (u) {
                        expertName = u.name;
                        expertImage = u.profileImage;
                    }
                } else if (typeof lookupId === 'string') {
                    expertName = lookupId;
                }
            } catch (e) { }
        }

        const candidateName = candidate?.name || (typeof session.candidateId === 'string' ? session.candidateId : 'Candidate');
        const candidateImage = candidate?.profileImage || null;
        const candidateEmail = candidate?.email || "";

        const enrichedSession = {
            ...session.toObject(),
            expertDetails: {
                name: expertName,
                role: expertRole,
                company: expertCompany,
                profileImage: expertImage
            },
            candidateDetails: {
                name: candidateName,
                email: candidateEmail,
                profileImage: candidateImage
            }
        };

        res.json(enrichedSession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionsByExpert = async (req, res) => {
    try {
        const { expertId } = req.params;
        const sessions = await sessionService.getSessionsByExpertId(expertId);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionsByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const sessions = await sessionService.getSessionsByCandidateId(candidateId);

        // Import Expert, User and mongoose
        const Expert = (await import('../models/expertModel.js')).default;
        const User = (await import('../models/User.js')).default;
        const mongoose = (await import('mongoose')).default;

        // Enrichment
        const enrichedSessions = await Promise.all(
            sessions.map(async (session) => {
                let expert = null;
                const lookupId = session.expertId;

                try {
                    // Logic: expertId could be a User ObjectId, an ExpertDetails ObjectId, or an Email
                    if (mongoose.Types.ObjectId.isValid(lookupId)) {
                        const oid = new mongoose.Types.ObjectId(lookupId);

                        // 1. Try finding ExpertDetails by userId
                        expert = await Expert.findOne({ userId: oid }).populate('userId');

                        // 2. Try finding ExpertDetails by its own _id
                        if (!expert) {
                            expert = await Expert.findById(oid).populate('userId');
                        }
                    }

                    // 3. Email fallback
                    if (!expert && typeof lookupId === 'string' && lookupId.includes('@')) {
                        const userByEmail = await User.findOne({ email: lookupId.toLowerCase() });
                        if (userByEmail) {
                            expert = await Expert.findOne({ userId: userByEmail._id }).populate('userId');
                        }
                    }
                } catch (lookupErr) {
                    console.error(`[SessionController] Expert lookup error for ${lookupId}:`, lookupErr);
                }

                // --- NAME RESOLUTION ---
                let expertName = 'Unknown Expert';
                let expertRole = 'Expert';
                let expertCompany = 'N/A';
                let expertImage = null;

                if (expert) {
                    expertName = expert.personalInformation?.userName || expert.userId?.name || 'Expert';
                    expertRole = expert.professionalDetails?.title || 'Expert';
                    expertCompany = expert.professionalDetails?.company || 'N/A';
                    expertImage = expert.profileImage || expert.userId?.profileImage || null;
                } else {
                    // Failover: Try to find the USER directly if Expert doc is missing
                    try {
                        let userFallback = null;
                        if (mongoose.Types.ObjectId.isValid(lookupId)) {
                            userFallback = await User.findById(lookupId);
                            if (!userFallback) {
                                // One last aggressive try: check if it's stored as string _id
                                userFallback = await User.findOne({ _id: lookupId.toString() });
                            }
                        } else if (typeof lookupId === 'string' && lookupId.includes('@')) {
                            userFallback = await User.findOne({ email: lookupId.toLowerCase() });
                        }

                        if (userFallback) {
                            expertName = userFallback.name || expertName;
                            expertImage = userFallback.profileImage || null;
                        } else {
                            // If it's a non-ID string (email/name), use it. 
                            // If it's an ID we can't find, it'll still be "Unknown Expert" -> we will fix that below.
                            if (lookupId && !mongoose.Types.ObjectId.isValid(lookupId)) {
                                expertName = lookupId;
                            }
                        }
                    } catch (e) { }
                }

                // ULTIMATE FALLBACK: If we still have "Unknown Expert" but a valid ID string, 
                // it means we have a session linked to a missing or hidden user. 
                // We show the ID so the user knows WHO it is (or at least it's not generic).
                if (expertName === 'Unknown Expert' && lookupId) {
                    expertName = lookupId;
                }

                // Match Review - Expert's review (marks/feedback for candidate) and Candidate's review
                const ReviewDetails = (await import('../models/reviewModel.js')).default;
                const [expertReview, candidateReview] = await Promise.all([
                    ReviewDetails.findOne({ sessionId: session.sessionId, reviewerRole: 'expert' }),
                    ReviewDetails.findOne({ sessionId: session.sessionId, reviewerRole: 'candidate' })
                ]);

                return {
                    ...session.toObject(),
                    expertReview: expertReview ? {
                        overallRating: expertReview.overallRating,
                        technicalRating: expertReview.technicalRating,
                        communicationRating: expertReview.communicationRating,
                        strengths: expertReview.strengths,
                        weaknesses: expertReview.weaknesses,
                        feedback: expertReview.feedback
                    } : null,
                    candidateReview: candidateReview ? {
                        overallRating: candidateReview.overallRating,
                        technicalRating: candidateReview.technicalRating,
                        communicationRating: candidateReview.communicationRating,
                        strengths: candidateReview.strengths,
                        weaknesses: candidateReview.weaknesses,
                        feedback: candidateReview.feedback
                    } : null,
                    expertDetails: {
                        name: expertName,
                        role: expertRole,
                        company: expertCompany,
                        category: expert?.personalInformation?.category || 'General',
                        profileImage: expertImage,
                        rating: expert?.metrics?.avgRating || 4.8,
                        reviews: expert?.metrics?.totalReviews || 0,
                        expertise: expert?.skillsAndExpertise?.domains || []
                    }
                };
            })
        );

        res.json(enrichedSessions);
    } catch (error) {
        console.error('Get Sessions By Candidate Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Seed restricted test session (Dev only)
export const devSeedSession = async (req, res) => {
    // Check dev flag if needed. For now assuming route protection or local env.
    const { expertEmail, candidateEmail, startTime, endTime } = req.body;

    if (!expertEmail || !candidateEmail) {
        return res.status(400).json({ message: "Expert and Candidate emails required" });
    }

    try {
        const result = await sessionService.createRestrictedTestSession(expertEmail, candidateEmail, startTime, endTime);
        res.status(201).json({
            message: "Restricted test session created",
            ...result
        });
    } catch (error) {
        console.error("Seed Error:", error);
        res.status(404).json({ message: error.message });
    }
};

export const getUserSessions = async (req, res) => {
    try {
        const { userId, role } = req.params;
        const sessions = await sessionService.getSessionsForUser(userId, role);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const joinSession = async (req, res) => {
    const { sessionId } = req.params;
    const { userId } = req.body; // In real app, get from req.user

    if (!userId) return res.status(401).json({ message: "User ID required" });

    try {
        const session = await sessionService.getSessionById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        // 1. Validate Identity (Resilient check for ID or Email or Expert Profile)
        const mongoose = (await import('mongoose')).default;
        const User = (await import('../models/User.js')).default;
        const Expert = (await import('../models/expertModel.js')).default;

        let isParticipant = false;

        // Convert session IDs to strings for comparison
        const sExpert = session.expertId?.toString() || "";
        const sCandidate = session.candidateId?.toString() || "";
        const uId = userId.toString();

        // Check 1: Direct ID Match
        if (sExpert === uId || sCandidate === uId) {
            isParticipant = true;
        }

        // Check 2: Expert Profile Match (if user is expert but session has ExpertDoc ID)
        if (!isParticipant) {
            const expertDoc = await Expert.findOne({ userId: userId });
            if (expertDoc && (expertDoc._id.toString() === sExpert || expertDoc.userId.toString() === sExpert)) {
                isParticipant = true;
            }
        }

        // Check 3: Email Fallback (Legacy/Dev)
        if (!isParticipant) {
            const user = await User.findById(userId);
            if (user && user.email) {
                const uEmail = user.email.toLowerCase();
                if (sExpert.toLowerCase() === uEmail || sCandidate.toLowerCase() === uEmail) {
                    isParticipant = true;
                }
            }
        }

        if (!isParticipant) {
            return res.status(403).json({ message: "Access Denied: You are not a participant of this session." });
        }

        // 2. Validate Time
        const now = new Date();
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        // Allow joining 10 mins early
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000);

        if (now < bufferStart) {
            return res.status(400).json({
                message: "Session has not started yet.",
                startTime: start
            });
        }

        if (now > end) {
            // Buffer: Allow joining for up to 30 mins after end time just in case
            const bufferEnd = new Date(end.getTime() + 30 * 60 * 1000);
            if (now > bufferEnd) {
                return res.status(400).json({ message: "Session has ended.", endTime: end });
            }
        }

        // 3. Success -> Return Meeting Data
        await meetingService.getOrCreateMeeting(session.sessionId); // Ensure Meeting doc exists

        res.json({
            permitted: true,
            meetingId: session.sessionId, // Using sessionId as meetingId
            role: (sExpert === uId || (isParticipant && sExpert.includes('@'))) ? 'expert' : 'candidate'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed endpoint (optional, but good for manual trigger)
export const seedSession = async (req, res) => {
    try {
        const session = await sessionService.seedTestSession();
        res.json(session);
    } catch (error) {
    }
};

/* -------------------- ADMIN: Get All Sessions -------------------- */
export const getAllSessions = async (req, res) => {
    try {
        const sessions = await sessionService.getAllSessions();
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error("Get All Sessions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* -------------------- Submit Review -------------------- */
export const submitReview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { overallRating, technicalRating, communicationRating, feedback, strengths, weaknesses, expertId, candidateId, reviewerRole } = req.body;

        // Validation
        if (!sessionId || !overallRating || !reviewerRole) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Dynamically import models and services
        const ReviewDetails = (await import('../models/reviewModel.js')).default;
        const User = (await import('../models/User.js')).default;
        const sessionService = (await import('../services/sessionService.js'));
        const emailService = (await import('../services/emailService.js'));

        // Check if review already exists for this role
        const existingReview = await ReviewDetails.findOne({ sessionId, reviewerRole });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "Review already submitted for this session" });
        }

        const newReview = new ReviewDetails({
            sessionId,
            expertId,      // Passed from frontend
            candidateId,   // Passed from frontend
            reviewerRole,
            overallRating,
            technicalRating: technicalRating || 0,
            communicationRating: communicationRating || 0,
            feedback,
            strengths: strengths || [],
            weaknesses: weaknesses || []
        });

        await newReview.save();

        // Update Session status
        const session = await sessionService.getSessionById(sessionId);
        let walletCreditResult = null;
        if (session) {
            if (session.status !== 'completed') {
                session.status = 'completed'; // Ensure it's marked completed
                await session.save();
            }

            if (reviewerRole === 'expert') {
                try {
                    const payoutAmount = Number(session.price || 0);
                    if (!session.payoutCredited && payoutAmount > 0) {
                        let expertUser = null;
                        const rawExpertId = session.expertId || expertId;

                        if (rawExpertId) {
                            if (typeof rawExpertId === 'string' && rawExpertId.includes('@')) {
                                expertUser = await User.findOne({ email: rawExpertId.toLowerCase() });
                            } else {
                                expertUser = await User.findById(rawExpertId).catch(() => null);
                            }
                        }

                        if (expertUser) {
                            expertUser.walletBalance = Number(expertUser.walletBalance || 0) + payoutAmount;
                            await expertUser.save();

                            session.payoutCredited = true;
                            session.payoutCreditedAt = new Date();
                            session.payoutAmount = payoutAmount;
                            await session.save();

                            walletCreditResult = { credited: true, amount: payoutAmount };

                            const { createNotification } = await import('../controllers/notificationController.js');
                            await createNotification({
                                userId: expertUser._id,
                                type: 'wallet_credit',
                                title: 'Session payout credited',
                                message: `₹${payoutAmount} has been credited to your wallet for session ${session.sessionId}.`,
                                metadata: {
                                    sessionId: session.sessionId,
                                    amount: payoutAmount,
                                    link: '/dashboard/sessions'
                                }
                            });
                        } else {
                            walletCreditResult = { credited: false, amount: 0, reason: 'Expert user not found' };
                        }
                    } else {
                        walletCreditResult = {
                            credited: false,
                            amount: Number(session.payoutAmount || 0),
                            reason: session.payoutCredited ? 'Already credited' : 'Session amount is zero'
                        };
                    }
                } catch (walletErr) {
                    console.error("Wallet credit failed:", walletErr);
                    walletCreditResult = { credited: false, amount: 0, reason: 'Wallet credit failed' };
                }
            }

            // --- SEND EMAIL NOTIFICATION ---
            if (reviewerRole === 'expert') {
                try {
                    let candidateEmail = null;
                    let candidateUserId = null;

                    if (candidateId.includes('@')) {
                        candidateEmail = candidateId;
                        const user = await User.findOne({ email: candidateId });
                        if (user) candidateUserId = user._id;
                    } else {
                        const candidate = await User.findById(candidateId);
                        if (candidate) {
                            candidateEmail = candidate.email;
                            candidateUserId = candidate._id;
                        }
                    }

                    if (candidateEmail) {
                        let expertName = "An Expert";
                        await emailService.notifyReviewReceived(
                            expertName,
                            candidateEmail,
                            session.topics?.[0] || "Mock Interview",
                            { overallRating, technicalRating, communicationRating, feedback }
                        );
                    }

                    if (candidateUserId) {
                        const { createNotification } = await import('../controllers/notificationController.js');
                        await createNotification({
                            userId: candidateUserId,
                            type: 'review_received',
                            title: 'New Feedback Received',
                            message: `Your expert has submitted feedback for the session on ${session.topics?.[0] || 'Mock Interview'}. Rating: ${overallRating}/5.`,
                            metadata: {
                                sessionId: sessionId,
                                link: `/my-sessions`
                            }
                        });
                    }
                } catch (emailErr) {
                    console.error("Failed to send review email/notification:", emailErr);
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: newReview,
            walletCredit: walletCreditResult
        });
    } catch (error) {
        console.error("Submit Review Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/* -------------------- Get Session Reviews -------------------- */
export const getSessionReviews = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const Review = (await import('../models/reviewModel.js')).default;
        const reviews = await Review.find({ sessionId });

        const expertReview = reviews.find(r => r.reviewerRole === 'expert') || null;
        const candidateReview = reviews.find(r => r.reviewerRole === 'candidate') || null;

        res.json({
            success: true,
            data: {
                expertReview,
                candidateReview
            }
        });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
