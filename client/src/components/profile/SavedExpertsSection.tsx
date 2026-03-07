import { useState, useEffect } from "react";
import axios from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { Bookmark, Star, Zap, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "../../lib/imageUtils";

interface SavedExpertItem {
    _id: string; // The saved entry ID
    expertId: any; // Populated expert object
    categoryId: string;
    createdAt: string;
}

export default function SavedExpertsSection() {
    const { user } = useAuth();
    const [savedExperts, setSavedExperts] = useState<SavedExpertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchSavedExperts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/user/saved-experts');
            if (res.data.success) {
                setSavedExperts(res.data.data);
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to load saved experts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSavedExperts();
        }
    }, [user]);

    const handleRemove = async (expertId: string) => {
        // Optimistic update
        setSavedExperts(prev => prev.filter(item => item.expertId._id !== expertId));
        try {
            await axios.delete(`/api/user/saved-experts/${expertId}`);
        } catch (error) {
            console.error("Failed to remove", error);
            // Re-fetch to ensure sync? Or toast error?
            fetchSavedExperts();
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#004fcb]" />
        </div>
    );

    if (error) return (
        <div className="text-center py-10 text-red-500 font-medium">
            {error}
        </div>
    );

    if (savedExperts.length === 0) return (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bookmark className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No saved experts</h3>
            <p className="text-sm text-gray-500 mb-4">Start bookmarking experts you're interested in.</p>
            <button
                onClick={() => navigate('/')}
                className="text-[#004fcb] font-bold text-sm hover:underline"
            >
                Browse Experts
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Saved Experts</h2>
                    <p className="text-sm text-gray-500">{savedExperts.length} professionals in your wishlist</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedExperts.map((item) => {
                    const expert = item.expertId;
                    if (!expert) return null; // Should be filtered by backend but logic safety

                    const displayName = expert.personalInformation?.userName || "Expert";
                    const displayRole = expert.professionalDetails?.title || expert.personalInformation?.category || "Consultant";
                    const displayCompany = expert.professionalDetails?.company;
                    const displayRating = expert.metrics?.avgRating || 0;
                    const displayReviews = expert.metrics?.totalReviews || 0;
                    const avatarUrl = getProfileImageUrl(expert.profileImage);
                    const isVerified = expert.status === "Active";

                    return (
                        <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="relative shrink-0">
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                            onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
                                        />
                                        {isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                                                <Shield className="w-3 h-3 text-[#004fcb] fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-[#004fcb] transition-colors line-clamp-1 text-sm">
                                            {displayName}
                                        </h3>
                                        <p className="text-gray-500 text-xs line-clamp-1 mb-0.5">
                                            {displayRole}
                                        </p>
                                        {displayCompany && (
                                            <p className="text-gray-400 text-[10px] font-medium">
                                                at {displayCompany}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(expert._id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    title="Remove from saved"
                                >
                                    <Bookmark className="w-5 h-5 fill-current text-[#004fcb]" />
                                </button>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                    <span className="font-bold text-gray-900">{displayRating.toFixed(1)}</span>
                                    <span className="text-gray-400">({displayReviews})</span>
                                </div>
                                <div className="w-px h-3 bg-gray-300"></div>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Fast response</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto pt-2">
                                <button
                                    onClick={() => navigate(`/book-session`, { state: { expertId: expert._id } })}
                                    className="w-full py-2.5 bg-gray-900 hover:bg-[#004fcb] text-white text-sm font-bold rounded-lg transition-all shadow-sm active:scale-95"
                                >
                                    Book Session
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
