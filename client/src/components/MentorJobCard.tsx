import { Star, ChevronRight, Briefcase, MapPin, Clock, Bookmark } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Types
export interface MentorProfile {
    id: string;
    expertID: string;
    name: string;
    role: string;
    company?: string;
    location: string;
    rating: number;
    reviews: number;
    avatar: string;
    activeTime?: string;
    isVerified: boolean;
    price: string;
    skills: string[];
    experience: string;
    totalSessions: number;
    category?: string;
    allTags?: string[];
}

export const MentorJobCard = ({ mentor }: { mentor: MentorProfile }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(() => {
        const saved = localStorage.getItem("savedExperts");
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.some((m: MentorProfile) => m.expertID === mentor.expertID);
        }
        return false;
    });

    const handleBookNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/book-session`, {
            state: {
                expertId: mentor.expertID,
                profile: { ...mentor }
            }
        });
    };

    const handleCardClick = () => {
        navigate(`/book-session`, {
            state: {
                expertId: mentor.expertID,
                profile: { ...mentor }
            }
        });
    };

    const toggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        const saved = localStorage.getItem("savedExperts");
        let parsed: MentorProfile[] = saved ? JSON.parse(saved) : [];

        if (isSaved) {
            parsed = parsed.filter((m) => m.expertID !== mentor.expertID);
        } else {
            parsed.push(mentor);
        }

        localStorage.setItem("savedExperts", JSON.stringify(parsed));
        setIsSaved(!isSaved);
        // Dispatch a custom event so MySessions can listen for changes if needed
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div
            onClick={handleCardClick}
            className="
                group relative bg-white rounded-[24px] border border-gray-100/80
                w-full min-w-0 h-full flex flex-col p-6
                transition-all duration-300 ease-out hover:-translate-y-1
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-100/50
                cursor-pointer snap-start overflow-hidden
            "
        >
            {/* Header: Title & Time & Avatar */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-[18px] text-gray-900 tracking-tight leading-7 truncate">
                        {mentor.name}
                    </h3>
                    <span className="text-[13px] text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                        <Clock size={14} /> 12h ago
                    </span>
                    <p className="text-[15px] font-medium text-gray-600 tracking-tight line-clamp-2 break-words mt-4">
                        {mentor.role}{mentor.company ? ` at ${mentor.company}` : ""}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                        onClick={toggleSave}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isSaved ? 'bg-blue-50 text-[#004fcb] border-blue-100' : 'bg-white text-gray-300 border-gray-100 hover:bg-gray-50 hover:text-gray-500'}`}
                    >
                        <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
                    </button>
                    {(mentor.avatar && mentor.avatar !== "/default-avatar.png") ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-gray-50 object-cover shrink-0">
                            <img
                                src={mentor.avatar}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100/50 text-[#004fcb] shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Badges: Rating & Category */}
            <div className="flex items-center gap-2.5 mb-6 mt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/40 border border-amber-100/50">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-[12px] font-bold text-gray-800">{mentor.rating.toFixed(1)}+</span>
                </div>
                <div className="px-4 py-1 rounded-full bg-gray-50/80 border border-gray-100 text-[12px] font-bold text-gray-600">
                    {mentor.category || "IT"}
                </div>
            </div>

            {/* Icon-based Meta Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase size={16} strokeWidth={2} />
                    <span className="text-[13px] font-medium text-gray-600">
                        {mentor.experience}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} strokeWidth={2} />
                    <span className="text-[13px] font-medium text-gray-600">
                        {mentor.location || "Global"}
                    </span>
                </div>
            </div>

            {/* Availability Detail */}
            <div className="flex items-center mb-6">
                <div className="px-3 py-1.5 rounded-full bg-emerald-50/80 flex items-center gap-2 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        {mentor.activeTime?.toUpperCase() || "AVAILABLE TODAY"}
                    </span>
                </div>
            </div>

            {/* Skills Section */}
            <div className="mb-6 flex-1">
                {mentor.skills && mentor.skills.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {mentor.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-500 transition-colors">
                                {skill}
                            </span>
                        ))}
                        {mentor.skills.length > 4 && (
                            <span className="text-[11px] font-semibold text-blue-400 hover:text-blue-600 cursor-pointer pl-1 mt-1">
                                +{mentor.skills.length - 4} more
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="h-[20px]"></div>
                )}
            </div>

            {/* Footer Section: Price & Action */}
            <div className="mt-auto flex items-end justify-between pt-1">
                <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Session Fee</p>
                    <div className="flex items-end gap-0.5">
                        <span className="text-[26px] font-extrabold text-gray-900 leading-none tracking-tight">
                            {mentor.price || "₹—"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleBookNow}
                    className="px-5 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-[#004fcb] rounded-xl text-[13px] font-bold tracking-tight transition-all active:scale-95 flex items-center gap-1.5"
                >
                    Book Now <ChevronRight size={14} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
