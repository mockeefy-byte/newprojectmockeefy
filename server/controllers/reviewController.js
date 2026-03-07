import Review from "../models/reviewModel.js";
import User from "../models/User.js";

export const getExpertReviews = async (req, res) => {
    try {
        const { expertId } = req.params;

        // Use aggregation to join with User collection (since we store strings instead of ObjectIDs)
        // Alternatively, if we trust the string IDs map to _id strings, we can do a secondary lookup.
        // Given the schemas use String for IDs but User uses default ObjectId (which casts to string), 
        // we need to be careful. The User model has `_id: true`, so it uses ObjectId.
        // The Review model defines `candidateId` as String.
        // Mongoose usually handles casting string query to ObjectId automatically, but for `lookup`, types must match.
        // Strategy: Fetch reviews first, then fetch user details. Simpler and less prone to type mismatch issues in aggregation if IDs are mixed.

        const reviews = await Review.find({
            expertId: expertId,
            isVisible: true,
            reviewerRole: 'candidate' // We usually want to show reviews FROM candidates TO experts
        }).sort({ createdAt: -1 });

        // Populate reviewer details manually
        const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
            const reviewer = await User.findById(review.candidateId).select("name profileImage experience"); // Fetch minimal details

            // Determine a display role/title. 
            // If reviewer has experience array, take the most recent position and company.
            let role = "Candidate";
            if (reviewer && reviewer.experience && reviewer.experience.length > 0) {
                // Assuming experience is sorted or just taking the first/last one marked current? 
                // Let's just take the first one for now as a "Title".
                const currentExp = reviewer.experience.find(e => e.current) || reviewer.experience[0];
                if (currentExp) {
                    role = `${currentExp.position}${currentExp.company ? ` at ${currentExp.company}` : ''}`;
                }
            }

            return {
                id: review._id,
                name: reviewer ? reviewer.name : "Anonymous User",
                role: role,
                rating: review.overallRating,
                comment: review.feedback,
                date: review.createdAt,
                avatar: reviewer ? reviewer.profileImage : null,
                strengths: review.strengths,
                weaknesses: review.weaknesses
            };
        }));

        res.status(200).json({
            success: true,
            data: reviewsWithDetails
        });

    } catch (error) {
        console.error("Error fetching expert reviews:", error);
        res.status(500).json({ success: false, message: "Server error fetching reviews" });
    }
};
