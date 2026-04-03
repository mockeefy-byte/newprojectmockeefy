import React, { useRef, useState, useEffect } from 'react';
import { Clock, Bookmark, Star, Briefcase, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";

export interface Expert {
  id: string;
  name: string;
  timeAgo: string;
  role: string;
  rating: string;
  category: string;
  experience: string;
  location: string;
  availableToday: boolean;
  skills: string[];
  moreSkillsCount?: number;
  fee: number;
  avatarUrl?: string;
  avatarColor?: string;
  initial?: string;
  badge?: string;
  reviewsCount?: number;
}

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <div className="w-[320px] relative bg-gradient-to-br from-white via-white to-slate-50/30 border border-slate-200/60 rounded-[20px] p-6 flex flex-col shrink-0 snap-center hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-blue-400 hover:ring-1 hover:ring-blue-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden">
      
      {/* Subtle animated gradient overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Floating Badge */}
      {expert.badge && (
        <div className="absolute -top-3 -left-3 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black tracking-widest uppercase rounded-lg shadow-lg shadow-orange-500/30 z-20 transform -rotate-2 border border-white/20 ring-1 ring-white/40">
          {expert.badge}
        </div>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="pr-24">
          <h3 className="text-[17px] font-bold text-slate-900 mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">{expert.name}</h3>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-[14px] h-[14px]" />
            <span className="text-[13px] font-medium">{expert.timeAgo}</span>
          </div>
        </div>
        
        {/* Right Actions / Avatar */}
        <div className="flex items-center gap-2 absolute right-0 top-0">
          <button className="w-10 h-10 rounded-[12px] border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all bg-white shadow-sm hover:shadow-md hover:scale-110">
            <Bookmark className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          {expert.avatarUrl ? (
            <img src={expert.avatarUrl} alt={expert.name} className="w-10 h-10 rounded-[12px] object-cover border border-slate-200/60 shadow-sm ring-2 ring-white" />
          ) : (
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold text-[16px] shadow-md ring-2 ring-white" style={{ background: expert.avatarColor || '#8b5cf6' }}>
              {expert.initial || expert.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Role */}
      <div className="mb-4 mt-2 relative z-10">
        <p className="text-[14px] text-slate-600 font-medium leading-relaxed min-h-[40px] pr-2 line-clamp-2">
          {expert.role}
        </p>
      </div>

      {/* Rating & Category */}
      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg border border-amber-200/60 shadow-sm ring-1 ring-amber-100/50">
          <Star className="w-[14px] h-[14px] fill-amber-400 text-amber-500 drop-shadow-sm" />
          <span className="text-[13px] font-bold text-amber-900">{expert.rating !== "New" ? expert.rating : "New"}</span>
          {expert.reviewsCount !== undefined && expert.reviewsCount > 0 && (
             <span className="text-[11px] font-semibold text-slate-500 ml-0.5 whitespace-nowrap">({expert.reviewsCount} Reviews)</span>
          )}
        </div>
        <div className="px-3 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/60 shadow-sm ring-1 ring-slate-100">
          <span className="text-[13px] font-bold text-slate-700">{expert.category}</span>
        </div>
      </div>

      {/* Experience & Location */}
      <div className="flex items-center gap-5 mb-5 relative z-10">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Briefcase className="w-[15px] h-[15px]" />
          <span className="text-[13px] font-semibold text-slate-600">{expert.experience}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="w-[15px] h-[15px]" />
          <span className="text-[13px] font-semibold text-slate-600">{expert.location}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4 relative z-10"></div>

      {/* Availability */}
      {expert.availableToday && (
        <div className="mb-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-lg border border-emerald-200/60 shadow-sm ring-1 ring-emerald-100/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Available Today</span>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[56px] content-start relative z-10">
        {expert.skills.map(s => (
          <span key={s} className="px-3 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-700 text-[12px] font-semibold rounded-lg border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            {s}
          </span>
        ))}
        {expert.moreSkillsCount && (
          <span className="px-2.5 py-1.5 text-slate-500 text-[12px] font-semibold flex items-center">
            +{expert.moreSkillsCount} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Session Fee</p>
          <div className="text-[22px] font-black text-slate-900 tracking-tight leading-none bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text">₹{expert.fee}</div>
        </div>
        <button className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-[13px] rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 ring-1 ring-blue-600/50">
          Book Now <ChevronRight className="w-[14px] h-[14px]" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function ExpertCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const res = await axios.get('/api/expert/verified');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          // Map backend response to frontend Expert interface
          const mapped: Expert[] = res.data.data.map((expert: any) => {
            const cat = expert.personalInformation?.category || "IT";
            
            // Experience formatting
            let exp = "Fresher";
            if (expert.professionalDetails?.totalExperience) {
              exp = expert.professionalDetails.totalExperience === 1 
                ? "1 year" 
                : `${expert.professionalDetails.totalExperience} years`;
            } else if (expert.professionalDetails?.level) {
               exp = expert.professionalDetails.level;
            }

            // Role formatting
            const title = expert.professionalDetails?.title || "Professional";
            const company = expert.professionalDetails?.公司 || expert.professionalDetails?.company;
            const roleStr = company ? `${title} at ${company}` : title;

            // Skills formatting
            let allSkills: string[] = [];
            if (expert.skillsAndExpertise?.tools && expert.skillsAndExpertise.tools.length > 0) {
              allSkills = expert.skillsAndExpertise.tools;
            } else if (expert.expertSkills?.length > 0) {
              allSkills = expert.expertSkills.map((s: any) => s.skillId?.name).filter(Boolean);
            }

            // Badge & Rating Logic
            const avgRating = expert.metrics?.avgRating || 0;
            const expYears = expert.professionalDetails?.totalExperience || 0;
            let badge = "PRO";
            if (avgRating >= 4.8) badge = "TOP RATED";
            else if (expYears > 5) badge = "ELITE";
            
            const ratingStr = avgRating > 0 ? avgRating.toFixed(1) : "New";

            return {
              id: expert._id || expert.userId,
              name: expert.personalInformation?.userName || "Expert",
              timeAgo: "Recently active", // Mocked for display
              role: roleStr,
              rating: ratingStr,
              reviewsCount: expert.metrics?.totalReviews || 0,
              category: cat,
              experience: exp,
              location: expert.personalInformation?.city || "Remote",
              availableToday: true, 
              skills: allSkills.slice(0, 3), // Show max 3 tags
              moreSkillsCount: allSkills.length > 3 ? allSkills.length - 3 : undefined,
              fee: expert.price || expert.fee || 350,
              avatarUrl: getProfileImageUrl(expert.profileImage) || undefined,
              avatarColor: "#8b5cf6",
              initial: (expert.personalInformation?.userName?.charAt(0) || "M").toUpperCase(),
              badge: badge
            };
          });

          // Show highest rated or just latest 8 for carousel
          setExperts(mapped.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to load experts for carousel", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const currentCategory = experts.length > 0 ? experts[0].category : "IT";

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-sm relative overflow-hidden mt-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-3">
          <div className="mt-2.5 w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-sm shadow-blue-500/40"></div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">Featured {currentCategory} Experts</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium">Browse verified experts • {loading ? 'Loading...' : `${experts.length} available`}</p>
          </div>
        </div>
        <button className="hidden sm:flex items-center gap-1.5 px-5 py-2 border border-slate-200 rounded-full text-[14px] font-bold text-blue-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
           <div className="flex flex-col items-center gap-4 text-blue-600">
             <Loader2 className="w-8 h-8 animate-spin" />
             <p className="text-sm font-semibold">Loading Experts...</p>
           </div>
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">No experts found in this category.</div>
      ) : (
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-6 px-1 custom-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
             {experts.map((expert, idx) => (
               <ExpertCard key={expert.id || idx} expert={expert} />
             ))}
          </div>
          
          {/* Right Fade & Arrow Button */}
          <div className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-1 sm:pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button 
               onClick={scrollRight}
               className="w-12 h-12 bg-white border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 pointer-events-auto transition-all"
             >
               <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
