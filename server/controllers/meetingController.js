import * as meetingService from '../services/meetingService.js';
import * as timeCheck from '../utils/timeCheck.js';
import * as authUtils from '../utils/authorization.js';

export const joinMeeting = async (req, res) => {
    try {
        const { sessionId, role, userId } = req.body; // or req.user if auth middleware used

        // 1. Get or Create Meeting
        const meeting = await meetingService.getOrCreateMeeting(sessionId);

        // 2. Authorization Check
        if (!authUtils.canJoinMeeting(meeting, userId)) {
            return res.status(403).json({ message: "You are not authorized to join this meeting." });
        }

        // 3. Time Check
        // If finished, block
        if (meeting.status === 'finished') {
            return res.status(400).json({ message: "Meeting has finished." });
        }

        // Check time constraints (optional strictness: allow join 5 min early?)
        // Requirement (4): Current time < session.endTime. 
        // We'll allow joining slightly early if needed, but strictly enforce end time logic for creation?
        // Actually Req (4) says "Disabled until time >= start && time < end".
        // But if persistent, and time is active, we allow.

        if (timeCheck.hasSessionEnded(meeting.endTime) && meeting.status !== 'live') {
            return res.status(400).json({ message: "Session time has expired." });
        }

        // 4. Update Active Users
        await meetingService.addUserToMeeting(meeting.meetingId, userId);

        res.status(200).json({
            success: true,
            meetingId: meeting.meetingId,
            status: meeting.status
        });

    } catch (error) {
        console.error("Join Error", error);
        res.status(500).json({ message: error.message });
    }
};

export const endMeeting = async (req, res) => {
    try {
        const { meetingId, userId } = req.body;

        const meeting = await meetingService.getMeeting(meetingId);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });

        // Only Expert (Host) can end? 
        if (meeting.expertId !== userId) {
            return res.status(403).json({ message: "Only the expert can end the meeting." });
        }

        const updated = await meetingService.updateMeetingStatus(meetingId, 'finished');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Build ICE servers: STUN (always) + optional self-hosted TURN (coturn) + optional Metered
function buildIceServers() {
    const servers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
    ];

    // Self-hosted TURN (e.g. Coturn) – required for video/audio across different networks (other system)
    const turnHost = process.env.TURN_HOST || process.env.COTURN_HOST;
    const turnPort = process.env.TURN_PORT || process.env.COTURN_PORT || '3478';
    const turnUser = process.env.TURN_USERNAME || process.env.COTURN_USERNAME;
    const turnCred = process.env.TURN_CREDENTIAL || process.env.COTURN_CREDENTIAL;

    if (turnHost && turnUser && turnCred) {
        const hostPort = `${turnHost}${turnPort ? ':' + turnPort : ''}`;
        servers.push({
            urls: [`turn:${hostPort}?transport=udp`, `turn:${hostPort}?transport=tcp`],
            username: turnUser,
            credential: turnCred,
        });
        console.log("[TURN] Using self-hosted TURN at", hostPort);
    }

    return servers;
}

export const getTurnCredentials = async (req, res) => {
    try {
        // Prefer self-hosted TURN (your own coturn) so video/audio works on "other system"
        const baseServers = buildIceServers();

        const apiKey = process.env.METERED_API_KEY;
        if (apiKey) {
            try {
                const response = await fetch(`https://mockeefy.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`);
                if (response.ok) {
                    const metered = await response.json();
                    const combined = Array.isArray(metered) ? [...baseServers, ...metered] : [...baseServers, metered];
                    return res.json(combined);
                }
            } catch (e) {
                console.warn("Metered TURN fetch failed, using STUN + self-hosted TURN only:", e.message);
            }
        }

        res.json(baseServers);
    } catch (error) {
        console.error("Error building ICE servers:", error);
        res.json([
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
        ]);
    }
};
