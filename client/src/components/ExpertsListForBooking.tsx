import { useMemo, useState } from "react";
import { CategorySection } from "./CategorySection";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";
import { AlertCircle, Search, SlidersHorizontal, X, Briefcase } from "lucide-react";
import axios from "../lib/axios";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useQuery } from "@tanstack/react-query";
import {
  calculateAge,
  calculateProfessionalExperience,
  getCurrentCompany,
  getJobTitle,
} from "../lib/expertUtils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

/**
 * Experts list with search and filters (category, skill, experience, location).
 * Shown on /book-session when no expert is selected. Clicking an expert opens booking for that expert.
 */
export default function ExpertsListForBooking() {
  const {
    data: expertsData,
    isLoading: isExpertsLoading,
    isError: isExpertsError,
    error: expertsError,
  } = useQuery({
    queryKey: ["experts-booking"],
    queryFn: async () => {
      const res = await axios.get("/api/expert/verified");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ["categories-booking"],
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
        exp =
          expert.professionalDetails.totalExperience === 1
            ? "1 year"
            : `${expert.professionalDetails.totalExperience} years`;
      } else {
        exp =
          calculateProfessionalExperience(expert.professionalDetails) ||
          (calculateAge(expert.personalInformation?.dob) - 22 > 0
            ? `${calculateAge(expert.personalInformation?.dob) - 22}+ years`
            : "Fresher");
      }

      const skills = (() => {
        if (expert.expertSkills && expert.expertSkills.length > 0) {
          return expert.expertSkills
            .filter((s: any) => s.isEnabled && s.skillName)
            .map((s: any) => s.skillName);
        }
        return [
          ...(expert.skillsAndExpertise?.domains || []),
          ...(expert.skillsAndExpertise?.tools || []),
        ];
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
        price: typeof expert.price === "number" ? `₹${expert.price}` : "₹—",
        skills: skills,
        experience: exp,
        activeTime: expert.availability?.nextAvailable || "Available Today",
        totalSessions: expert.metrics?.totalSessions || 0,
        category: cat,
        allTags: [cat, ...skills, expert.professionalDetails?.industry]
          .filter(Boolean)
          .map((s) => s.toString()),
      } as MentorProfile & { category: string; allTags: string[] };
    });
  }, [expertsData, isExpertsLoading]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [skillFilter, setSkillFilter] = useState<string>("All");
  const [experienceFilter, setExperienceFilter] = useState<string>("Any");
  const [locationFilter, setLocationFilter] = useState<string>("Any");
  const [showFilters, setShowFilters] = useState(false);

  const uniqueSkills = useMemo(() => {
    const set = new Set<string>();
    allProfiles.forEach((p) => {
      (p.skills || []).forEach((s) => {
        if (s && typeof s === "string" && s.trim()) set.add(s.trim());
      });
      (p.allTags || []).forEach((t) => {
        if (t && typeof t === "string" && t.trim()) set.add(t.trim());
      });
    });
    return Array.from(set).sort().slice(0, 50);
  }, [allProfiles]);

  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    allProfiles.forEach((p) => {
      if (p.location?.trim()) set.add(p.location.trim());
    });
    return Array.from(set).sort().slice(0, 15);
  }, [allProfiles]);

  const filteredProfiles = useMemo(() => {
    let list = [...allProfiles];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const role = (p.role || "").toLowerCase();
        const company = (p.company || "").toLowerCase();
        const location = (p.location || "").toLowerCase();
        const skills = (p.skills || []).join(" ").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const allTags = (p.allTags || []).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          role.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          skills.includes(q) ||
          category.includes(q) ||
          allTags.includes(q)
        );
      });
    }
    if (categoryFilter && categoryFilter !== "All") {
      const lower = categoryFilter.toLowerCase();
      list = list.filter(
        (p) =>
          (p.category && p.category.toLowerCase().includes(lower)) ||
          (p.allTags && p.allTags.some((t: string) => t.toLowerCase().includes(lower)))
      );
    }
    if (skillFilter && skillFilter !== "All") {
      const lower = skillFilter.toLowerCase();
      list = list.filter(
        (p) =>
          (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(lower))) ||
          (p.allTags && p.allTags.some((t: string) => t.toLowerCase().includes(lower)))
      );
    }
    if (experienceFilter && experienceFilter !== "Any") {
      list = list.filter((p) => {
        const exp = (p.experience || "").toLowerCase();
        if (experienceFilter === "Fresh") return exp.includes("fresh") || exp.includes("fresher");
        if (experienceFilter === "0-2")
          return exp.includes("year") && (exp.startsWith("1") || exp.startsWith("2") || exp.startsWith("0"));
        if (experienceFilter === "2-5")
          return (
            exp.includes("year") &&
            (exp.startsWith("2") || exp.startsWith("3") || exp.startsWith("4") || exp.startsWith("5"))
          );
        if (experienceFilter === "5+")
          return (
            exp.includes("year") &&
            !exp.startsWith("1") &&
            !exp.startsWith("2") &&
            !exp.startsWith("3") &&
            !exp.startsWith("4")
          );
        return true;
      });
    }
    if (locationFilter && locationFilter !== "Any") {
      list = list.filter((p) =>
        (p.location || "").toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    return list;
  }, [allProfiles, searchQuery, categoryFilter, skillFilter, experienceFilter, locationFilter]);

  const categorizedProfiles = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return [];
    const sections: { title: string; profiles: MentorProfile[] }[] = [];
    const validCategories = categoriesData
      .filter((c: any) => c.status !== "Inactive")
      .map((c: any) => c.name);

    validCategories.forEach((sectionTitle: string) => {
      const sectionProfiles = filteredProfiles.filter((p) => {
        const lowerTitle = sectionTitle.toLowerCase();
        if (p.category && p.category.toLowerCase().includes(lowerTitle)) return true;
        if (p.allTags && p.allTags.some((t) => t.toLowerCase().includes(lowerTitle))) return true;
        return false;
      });
      if (sectionProfiles.length > 0) {
        const sorted = sectionProfiles.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        sections.push({ title: sectionTitle, profiles: sorted });
      }
    });
    return sections;
  }, [filteredProfiles, categoriesData]);

  const hasActiveFilters =
    categoryFilter !== "All" ||
    skillFilter !== "All" ||
    experienceFilter !== "Any" ||
    locationFilter !== "Any";

  const clearFilters = () => {
    setCategoryFilter("All");
    setSkillFilter("All");
    setExperienceFilter("Any");
    setLocationFilter("Any");
    setShowFilters(false);
  };

  if (isExpertsLoading || isCategoriesLoading) {
    return (
      <div className="min-h-[40vh] space-y-6 flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-[#004fcb] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading experts...</p>
      </div>
    );
  }

  if (isExpertsError) {
    return (
      <div className="text-center py-20 bg-rose-50/50 rounded-2xl border border-rose-100/50">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
        <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Could not load experts</h3>
        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter mt-1">
          {expertsError instanceof Error ? expertsError.message : "Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full pb-16 space-y-6 md:space-y-8">
      <div className="flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-[#004fcb]" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Experts List</h1>
      </div>
      <p className="text-sm text-slate-600 -mt-2">
        Choose an expert to book a mock interview. Use search and filters to find by skills, category, experience, or location.
      </p>

      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by name, skills, role, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-10 rounded-xl border-slate-200 sm:shrink-0 flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-[#004fcb]" />
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="All">All</option>
              {categoriesData &&
                Array.isArray(categoriesData) &&
                categoriesData
                  .filter((c: any) => c.status !== "Inactive")
                  .map((c: any) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
            </select>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-3 mr-1">Skill</span>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white min-w-[120px]"
            >
              <option value="All">All skills</option>
              {uniqueSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-3 mr-1">Experience</span>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="Any">Any</option>
              <option value="Fresh">Fresh</option>
              <option value="0-2">0-2 years</option>
              <option value="2-5">2-5 years</option>
              <option value="5+">5+ years</option>
            </select>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-3 mr-1">Location</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="Any">Any</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-700 ml-2"
              onClick={clearFilters}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear filters
            </Button>
          </div>
        )}
      </div>

      <div className="w-full space-y-8">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-600">No experts match your search or filters.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-xl"
              onClick={() => {
                setSearchQuery("");
                clearFilters();
              }}
            >
              Clear all
            </Button>
          </div>
        ) : categorizedProfiles.length > 0 ? (
          categorizedProfiles.map((section) => (
            <CategorySection
              key={section.title}
              title={section.title}
              profiles={section.profiles}
            />
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="w-full">
                <MentorJobCard mentor={profile} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
