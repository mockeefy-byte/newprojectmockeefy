import Meeting from '../models/Meeting.js';
import Session from '../models/Session.js';

export const getMeeting = async (meetingId) => {
    return await Meeting.findOne({ meetingId });
};

export const getOrCreateMeeting = async (sessionId) => {
    // 1. Check if meeting already exists
    let meeting = await Meeting.findOne({ sessionId });
    
    if (meeting) {
        return meeting;
    }

    // 2. If not, fetch session to create it
    const session = await Session.findOne({ sessionId });
    if (!session) {
        throw new Error("Session not found");
    }

    // 3. Create Meeting
    // We use sessionId as meetingId for simplicity, or generate a new one.
    // Requirement says: "meetingId (generated)" but later "meetingId persists in DB"
    // and "WebSocket roomId = meetingId". 
    // Usually meetingId = sessionId is easiest for 1:1 sessions.
    const meetingId = sessionId; 

    meeting = new Meeting({
        meetingId,
        sessionId: session.sessionId,
        expertId: session.expertId,
        candidateId: session.candidateId,
        startTime: session.startTime,
        endTime: session.endTime,
        status: 'not-started',
        activeUsers: [] 
    });

    await meeting.save();
    return meeting;
};

export const updateMeetingStatus = async (meetingId, status) => {
    return await Meeting.findOneAndUpdate(
        { meetingId }, 
        { status }, 
        { new: true }
    );
};

export const addUserToMeeting = async (meetingId, userId) => {
    return await Meeting.findOneAndUpdate(
        { meetingId },
        { $addToSet: { activeUsers: userId }, status: 'live' },
        { new: true }
    );
};

export const removeUserFromMeeting = async (meetingId, userId) => {
    // We just remove from activeUsers. Logic for ending is handled by check
    return await Meeting.findOneAndUpdate(
        { meetingId },
        { $pull: { activeUsers: userId } },
        { new: true }
    );
};

export const checkAndEndMeeting = async (meetingId) => {
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return null;

    const now = new Date();
    // End ONLY if time expired AND no users
    // OR if manually ended (status finished)
    
    if (meeting.status === 'finished') return meeting;

    if (now >= meeting.endTime && meeting.activeUsers.length === 0) {
        meeting.status = 'finished';
        meeting.lastEndedAt = now;
        await meeting.save();
        return meeting;
    }
    
    return meeting;
};
