// import schedule from 'node-schedule'; // Removed to avoid dependency
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createNotification } from '../controllers/notificationController.js';

// Since we cannot easily install node-schedule without approval, we'll use setInterval
// This is a simple in-process scheduler. For production, use a dedicated job queue (e.g. Bull, Agenda).

const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

export const initScheduler = () => {
    console.log("Initializing Meeting Reminder Scheduler...");

    setInterval(async () => {
        try {
            const now = new Date();
            // Look for sessions starting in 10-11 minutes from now
            // This window ensures we only pick them up once (since we run every 1 min)
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
            const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000);

            const upcomingSessions = await Session.find({
                startTime: {
                    $gte: tenMinutesFromNow,
                    $lt: elevenMinutesFromNow
                },
                status: 'confirmed'
            });

            if (upcomingSessions.length > 0) {
                console.log(`Found ${upcomingSessions.length} sessions starting in ~10 mins`);
            }

            for (const session of upcomingSessions) {
                // Send to Expert (if valid User)
                if (session.expertId && session.expertId.length === 24) { // Basic ObjectId check, assuming standard ID
                    // ... Or better, assume we store strict IDs. 
                    // In current app, expertId can be String/Email. Notification model requires User ObjectId.
                    // We'll try to resolve user.
                    const expertUser = await resolveUser(session.expertId);
                    if (expertUser) {
                        await createNotification({
                            userId: expertUser._id,
                            type: 'meeting_reminder',
                            title: 'Meeting Starting Soon',
                            message: `Your session on ${session.topics?.[0] || 'Topics'} starts in 10 minutes.`,
                            metadata: { sessionId: session.sessionId, link: `/expert/sessions` }
                        });
                    }
                }

                // Send to Candidate
                if (session.candidateId) {
                    const candidateUser = await resolveUser(session.candidateId);
                    if (candidateUser) {
                        await createNotification({
                            userId: candidateUser._id,
                            type: 'meeting_reminder',
                            title: 'Meeting Starting Soon',
                            message: `Your session on ${session.topics?.[0] || 'Topics'} starts in 10 minutes.`,
                            metadata: { sessionId: session.sessionId, link: `/my-sessions` }
                        });
                    }
                }
            }

        } catch (error) {
            console.error("Scheduler Error:", error);
        }
    }, CHECK_INTERVAL);
};

// Helper: Try to find a User ID from the session string (email or ID)
async function resolveUser(identifier) {
    if (!identifier) return null;

    // Check if it's already an ObjectId string (24 hex chars)
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
        return { _id: identifier }; // Assume valid, or verify with DB if strictness needed
    }

    // Check if email
    if (identifier.includes('@')) {
        const user = await User.findOne({ email: identifier });
        return user;
    }

    return null;
}
