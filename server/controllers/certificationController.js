import Certification from '../models/Certification.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const getCertificationStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Calculate Progress (Completed Sessions)
        // Count 'completed' sessions where the user was the CANDIDATE
        const completedSessionsCount = await Session.countDocuments({
            candidateId: userId,
            status: 'completed'
        });

        // 2. Fetch Issued Certifications
        const certifications = await Certification.find({ userId }).sort({ issueDate: -1 });

        // 3. Determine Eligibility for "Mock Interview Completion" (Rule: 3 sessions)
        // Check if they already have this specific cert
        const hasCompletionCert = certifications.some(c => c.name === 'Mock Interview Completion');
        const isEligible = !hasCompletionCert && completedSessionsCount >= 3;

        res.json({
            success: true,
            data: {
                completedSessions: completedSessionsCount,
                targetSessions: 3,
                isEligibleForCertificate: isEligible,
                certifications,
                nextMilestone: hasCompletionCert ? "Advanced Certification (Coming Soon)" : "Mock Interview Completion"
            }
        });

    } catch (error) {
        console.error("Get Certification Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const issueCertificate = async (req, res) => {
    try {
        const { userId, type } = req.body; // type defaults to 'completion' usually

        // Re-verify eligibility server-side
        const completedSessionsCount = await Session.countDocuments({
            candidateId: userId,
            status: 'completed'
        });

        if (completedSessionsCount < 3) {
            return res.status(400).json({ success: false, message: "Not eligible yet. Complete 3 sessions." });
        }

        // Check if already exists
        const existing = await Certification.findOne({ userId, name: 'Mock Interview Completion' });
        if (existing) {
            return res.status(400).json({ success: false, message: "Certificate already issued." });
        }

        // Issue
        const newCert = new Certification({
            userId,
            name: 'Mock Interview Completion',
            certificateId: `MCK-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            metadata: {
                sessionCount: completedSessionsCount
            }
        });

        await newCert.save();

        res.status(201).json({ success: true, message: "Certificate issued!", data: newCert });

    } catch (error) {
        console.error("Issue Certificate Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
