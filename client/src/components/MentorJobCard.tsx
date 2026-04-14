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
                group relative bg-gradient-to-br from-white via-white to-blue-50/30 
                rounded-[24px] border border-slate-200/60
                w-full min-w-0 h-full flex flex-col p-6
                transition-all duration-300 ease-out hover:-translate-y-2
                hover:shadow-[0_20px_50px_rgba(0,79,203,0.1)] hover:border-blue-400/30
                cursor-pointer snap-start overflow-hidden
            "
        >
            {/* Animated Glow Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Header: Title & Time & Avatar */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-black text-[19px] text-slate-900 tracking-tight leading-tight truncate group-hover:text-blue-700 transition-colors">
                        {mentor.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">{mentor.activeTime?.replace(' ago', '') || "Active"}</span>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-3">
                    <button
                        onClick={toggleSave}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${isSaved ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-300 border-slate-200 hover:border-blue-200 hover:text-blue-600'}`}
                    >
                        <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
                    </button>
                    
                        <div className="relative">
                            {(mentor.avatar && !mentor.avatar.includes("default-avatar.png")) ? (
                                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white ring-1 ring-slate-100 shrink-0">
                                    <img
                                        src={mentor.avatar}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-700 font-black text-lg border-2 border-white ring-1 ring-slate-100 shrink-0 uppercase">
                                    {mentor.name.substring(0, 2)}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-1 ring-emerald-100"></div>
                        </div>
                </div>
            </div>

            {/* Info Row: Role & Company */}
            <div className="mb-5 relative z-10">
                <p className="text-[14px] font-bold text-slate-700 tracking-tight leading-snug line-clamp-2">
                    {mentor.role}{mentor.company ? <span className="text-slate-400 font-medium"> at </span> : ""}{mentor.company}
                </p>
            </div>

            {/* Badges: Rating & Category */}
            <div className="flex items-center gap-2 mb-6 mt-1 relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/50">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-[12px] font-black text-amber-900">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
                    {mentor.reviews > 0 && (
                        <span className="text-[10px] font-bold text-amber-600/60 ml-0.5">({mentor.reviews})</span>
                    )}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/50 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    {mentor.category || "IT"}
                </div>
            </div>

            {/* Meta Stats: Experience & Sessions */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <Briefcase size={14} className="text-slate-400" />
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Exp.</p>
                        <p className="text-[12px] font-bold text-slate-700 truncate leading-none">{mentor.experience}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <MapPin size={14} className="text-slate-400" />
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Loc.</p>
                        <p className="text-[12px] font-bold text-slate-700 truncate leading-none">{mentor.location || "Global"}</p>
                    </div>
                </div>
            </div>

            {/* Availability Strip */}
            <div className="mb-6 relative z-10">
                <div className="px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                        Ready to Join • {mentor.activeTime?.toUpperCase().replace(' AGO', '') || "NOW"}
                    </span>
                </div>
            </div>

            {/* Price & Action Section */}
            <div className="mt-auto pt-5 border-t border-slate-100/50 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Starting From</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[24px] font-black text-slate-900 leading-none tracking-tight">
                                {mentor.price || "₹99"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ session</span>
                        </div>
                    </div>
                    <button
                        onClick={handleBookNow}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[14px] font-bold tracking-tight shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        Book <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
