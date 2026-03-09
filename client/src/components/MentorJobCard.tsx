import { Star, ChevronRight, Briefcase, MapPin, Clock, Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "../lib/imageUtils";

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
                group relative bg-white rounded-2xl border border-slate-200/60
                w-full min-w-0 h-full flex flex-col p-5 md:p-6
                transition-all duration-500 ease-out
                hover:shadow-[0_12px_45px_-10px_rgba(0,0,0,0.08)] hover:border-blue-100/50
                cursor-pointer snap-start overflow-hidden shadow-sm
            "
        >
            {/* Header: Title & Time & Avatar */}
            <div className="flex justify-between items-start mb-1">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-[16px] text-elite-black tracking-tight leading-7 truncate">
                        {mentor.name}
                    </h3>
                    <span className="text-[12px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> 12h ago
                    </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={toggleSave}
                        className={`p-2 rounded-lg transition-all ${isSaved ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                        {isSaved ? <Check size={18} strokeWidth={3} /> : <Bookmark size={18} />}
                    </button>
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm p-0.5 bg-white mt-1">
                        <img
                            src={mentor.avatar}
                            className="w-full h-full object-cover rounded-[6px]"
                            onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
                        />
                    </div>
                </div>
            </div>

            {/* Sub-headline: Role & Company - wrap so no truncation like "Promo Cor" */}
            <div className="mb-3 min-h-[40px] flex items-start">
                <p className="text-[14px] font-normal text-text-secondary tracking-tight line-clamp-2 break-words min-w-0">
                    {mentor.role}{mentor.company ? ` at ${mentor.company}` : ""}
                </p>
            </div>

            {/* Badges: Rating & Category & Sessions */}
            <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-[10px] font-black text-slate-700">{mentor.rating.toFixed(1)}+</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500">
                    {mentor.category || "Corporate"}
                </div>
                {mentor.totalSessions > 0 && (
                    <div className="px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100 text-[10px] font-black text-blue-600">
                        {mentor.totalSessions}+ Sessions
                    </div>
                )}
            </div>

            {/* Icon-based Meta Row - full text visible (wrap, no truncation) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-b border-slate-100 mb-4 min-h-[44px]">
                <div className="flex items-center gap-2 text-slate-400 min-w-0">
                    <Briefcase size={14} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 break-words">{mentor.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 min-w-0">
                    <MapPin size={14} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 break-words">{mentor.location || "Global"}</span>
                </div>
            </div>

            {/* Availability Detail - allow wrap so "AVAILABLE TODAY" isn't cut off */}
            <div className="flex items-center gap-2 mb-4 min-h-[30px]">
                <div className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight break-words">
                        {mentor.activeTime || "Next slot tomorrow"}
                    </span>
                </div>
            </div>

            {/* Skills Section - Standardized height for alignment */}
            <div className="mb-5 min-h-[50px] flex items-start">
                {mentor.skills && mentor.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {mentor.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-md border border-slate-100 group-hover:border-blue-100/50 transition-colors">
                                {skill}
                            </span>
                        ))}
                        {mentor.skills.length > 4 && (
                            <span className="text-[9px] font-bold text-slate-300 ml-1">+{mentor.skills.length - 4} more</span>
                        )}
                    </div>
                ) : (
                    <div className="h-[20px]"></div>
                )}
            </div>

            {/* Footer Section: Price & Action */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Session Fee</p>
                    <div className="flex items-center gap-1">
                        <span className="text-[18px] font-black text-elite-black tracking-tight">{mentor.price || "₹499"}</span>
                    </div>
                </div>
                <button
                    onClick={handleBookNow}
                    className="px-6 py-2.5 bg-blue-50 text-elite-blue hover:bg-elite-blue hover:text-white rounded-full text-[11px] font-black tracking-tight transition-all active:scale-95 flex items-center gap-2"
                >
                    Book Now <ChevronRight size={12} strokeWidth={4} />
                </button>
            </div>
        </div>
    );
};
