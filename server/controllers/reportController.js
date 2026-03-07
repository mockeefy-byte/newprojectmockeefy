
import Report from '../models/Report.js';
import Session from '../models/Session.js';

/* -------------------------------------------------------------------------- */
/*                               CREATE REPORT                                */
/* -------------------------------------------------------------------------- */
export const createReport = async (req, res) => {
    try {
        const { sessionId, technical, communication, confidence, systemDesign, problemSolving, strengths, improvements, detailedComments } = req.body;
        const expertId = req.user.userId; // Assuming auth middleware sets this

        // console.log("Creating report for session:", sessionId, "Expert:", expertId);

        // Verify Session
        const session = await Session.findOne({ _id: sessionId, expertId });
        if (!session) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }

        // Check if report already exists
        const existingReport = await Report.findOne({ sessionId });
        if (existingReport) {
            return res.status(400).json({ message: "Report already exists for this session" });
        }

        const newReport = new Report({
            sessionId,
            expertId,
            candidateId: session.candidateId,
            scores: {
                technical,
                communication,
                confidence,
                systemDesign,
                problemSolving
            },
            feedback: {
                strengths,
                improvements,
                detailedComments
            },
            status: 'Submitted'
        });

        await newReport.save();

        // Update session status if needed? (optional)
        // session.status = 'completed'; // usually already completed
        // await session.save();

        res.status(201).json({ message: "Report submitted successfully", report: newReport });

    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* -------------------------------------------------------------------------- */
/*                           GET REPORTS BY EXPERT                            */
/* -------------------------------------------------------------------------- */
export const getReportsByExpert = async (req, res) => {
    try {
        const expertId = req.user.userId;
        const reports = await Report.find({ expertId })
            .populate('candidateId', 'name email')
            .populate('sessionId', 'date timeSlot')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* -------------------------------------------------------------------------- */
/*                            GET REPORT BY ID                                */
/* -------------------------------------------------------------------------- */
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id)
            .populate('candidateId', 'name email')
            .populate('sessionId', 'date timeSlot');

        if (!report) return res.status(404).json({ message: "Report not found" });

        res.json(report);
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ message: "Server error" });
    }
};
