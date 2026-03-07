import { useMemo } from "react";
import { CategorySection } from "./CategorySection";
import { MentorProfile } from "./MentorJobCard";
import { AlertCircle } from "lucide-react";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
import { useQuery } from "@tanstack/react-query";
import { calculateAge, calculateProfessionalExperience, getCurrentCompany, getJobTitle } from "../lib/expertUtils";

export default function CoachSessionCard() {
  const {
    data: expertsData,
    isLoading: isExpertsLoading,
    isError: isExpertsError,
    error: expertsError
  } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const res = await axios.get("/api/expert/verified");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const allProfiles = useMemo<MentorProfile[]>(() => {
    if (isExpertsLoading && !expertsData) return [];
    let rawExperts: any[] = [];
    if (expertsData?.success && Array.isArray(expertsData?.data)) {
      rawExperts = expertsData.data;
    } else if (Array.isArray(expertsData)) {
      rawExperts = expertsData;
    }

    return rawExperts.map((expert: any) => {
      const cat = expert.personalInformation?.category || "IT";
      let exp = "";
      if (expert.professionalDetails?.totalExperience) {
        exp = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
      } else {
        exp = calculateProfessionalExperience(expert.professionalDetails) || (calculateAge(expert.personalInformation?.dob) - 22 > 0 ? `${calculateAge(expert.personalInformation?.dob) - 22}+ years` : "Fresher");
      }

      const skills = (() => {
        if (expert.expertSkills && expert.expertSkills.length > 0) {
          return expert.expertSkills
            .filter((s: any) => s.isEnabled && s.skillName)
            .map((s: any) => s.skillName);
        }
        return [...(expert.skillsAndExpertise?.domains || []), ...(expert.skillsAndExpertise?.tools || [])];
      })();

      return {
        id: expert._id || expert.userId,
        expertID: expert._id || expert.userId,
        name: expert.personalInformation?.userName || "Expert",
        role: getJobTitle(expert.professionalDetails, cat),
        company: getCurrentCompany(expert.professionalDetails, cat),
        location: expert.personalInformation?.city || "Online",
        rating: expert.metrics?.avgRating || 0,
        reviews: expert.metrics?.totalReviews || 0,
        avatar: getProfileImageUrl(expert.profileImage),
        isVerified: expert.status === "Active",
        price: expert.price ? `₹${expert.price}` : "₹500",
        skills: skills,
        experience: exp,
        activeTime: expert.availability?.nextAvailable || "Available Today",
        totalSessions: expert.metrics?.totalSessions || 0,
        category: cat,
        allTags: [cat, ...skills, expert.professionalDetails?.industry].filter(Boolean).map(s => s.toString())
      } as MentorProfile & { category: string, allTags: string[] };
    });
  }, [expertsData, isExpertsLoading]);

  const categorizedProfiles = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return [];
    const sections: { title: string, profiles: MentorProfile[] }[] = [];
    const validCategories = categoriesData
      .filter((c: any) => c.status !== 'Inactive')
      .map((c: any) => c.name);

    validCategories.forEach((sectionTitle: string) => {
      const sectionProfiles = allProfiles.filter(p => {
        const lowerTitle = sectionTitle.toLowerCase();
        if (p.category && p.category.toLowerCase().includes(lowerTitle)) return true;
        if (p.allTags && p.allTags.some(t => t.toLowerCase().includes(lowerTitle))) return true;
        return false;
      });
      if (sectionProfiles.length > 0) {
        const sorted = sectionProfiles.sort((a, b) => b.rating - a.rating);
        sections.push({ title: sectionTitle, profiles: sorted });
      }
    });
    return sections;
  }, [allProfiles, categoriesData]);

  if (isExpertsLoading || isCategoriesLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-48 mb-6"></div>
            <div className="flex gap-4 overflow-hidden">
              <div className="w-[300px] h-80 bg-slate-50 rounded-2xl shrink-0"></div>
              <div className="w-[300px] h-80 bg-slate-50 rounded-2xl shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isExpertsError) {
    return (
      <div className="text-center py-20 bg-rose-50/50 rounded-2xl border border-rose-100/50">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
        <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Signal Failure</h3>
        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter mt-1">{expertsError instanceof Error ? expertsError.message : "Handshake Error"}</p>
      </div>
    );
  }

  return (
    <div className="pb-16 space-y-8">
      {/* Single anchor target for any #experts navigation */}
      <div id="experts" className="scroll-mt-6" />

      {/* Same layout on mobile and desktop: category sections with horizontal card scroll */}
      <div className="space-y-8">
        {categorizedProfiles.map(section => (
          <CategorySection
            key={section.title}
            title={section.title}
            profiles={section.profiles}
            onSeeAll={() => console.log(`Dir: ${section.title}`)}
          />
        ))}
      </div>
    </div>
  );
}
