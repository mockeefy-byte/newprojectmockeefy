import User from '../models/User.js';
import Expert from '../models/expertModel.js';

export const canJoinMeeting = async (meeting, userId) => {
    console.log(`[Auth] Verifying user ${userId} for meeting ${meeting._id} (Expert: ${meeting.expertId}, Candidate: ${meeting.candidateId})`);
    // 1. Direct Match (String comparison)
    if (String(meeting.expertId) === String(userId) || String(meeting.candidateId) === String(userId)) {
        return true;
    }

    // 2. Expert Profile Match (if user is expert but meeting has Profile ID)
    try {
        const expertDoc = await Expert.findOne({ userId: userId });
        if (expertDoc) {
            if (String(expertDoc._id) === String(meeting.expertId) || String(expertDoc.userId) === String(meeting.expertId)) {
                return true;
            }
        }
    } catch (e) {
        console.error("Auth Check Expert Error:", e);
    }

    // 3. Email Fallback (Legacy/Dev)
    try {
        const user = await User.findById(userId);
        if (user && user.email) {
            const email = user.email.toLowerCase();
            if (String(meeting.candidateId).toLowerCase() === email || String(meeting.expertId).toLowerCase() === email) {
                return true;
            }
        }
    } catch (e) {
        console.error("Auth Check Email Error:", e);
    }

    return false;
};
