import AiSession from '../models/AiSession.js';

// Create a new session
export const createSession = async (req, res) => {
    try {
        const { config } = req.body;

        if (!config || !config.role) {
            return res.status(400).json({ success: false, message: 'Invalid configuration' });
        }

        const newSession = new AiSession({
            userId: req.user.userId, // Assumes auth middleware populates req.user
            config,
            status: 'live'
        });

        await newSession.save();

        res.status(201).json({
            success: true,
            data: newSession
        });
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update session (add transcript or update status)
export const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { transcript, status, duration } = req.body;

        const session = await AiSession.findOne({ _id: id, userId: req.user.userId });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (transcript) {
            // Append new messages to transcript
            // Expecting transcript to be an array of new messages or a single message object
            if (Array.isArray(transcript)) {
                session.transcript.push(...transcript);
            } else {
                session.transcript.push(transcript);
            }
        }

        if (status) session.status = status;
        if (duration) session.duration = duration;

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Update Session Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// End session
export const endSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { duration, feedback } = req.body;

        const session = await AiSession.findOne({ _id: id, userId: req.user.userId });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.status = 'completed';
        if (duration) session.duration = duration;
        if (feedback) session.feedback = feedback;

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('End Session Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get User Sessions
export const getUserSessions = async (req, res) => {
    try {
        const sessions = await AiSession.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get User Sessions Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Single Session
export const getSession = async (req, res) => {
    try {
        const session = await AiSession.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
