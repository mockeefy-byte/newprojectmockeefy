
// Helper types and functions (copied from CoachSessionCard to avoid circular deps or complex refactoring for now)
import {
    Code, Users, Briefcase, PenTool, BarChart3, DollarSign, Brain
} from "lucide-react";
import { getProfileImageUrl } from "./imageUtils";

type Category = "IT" | "HR" | "Business" | "Design" | "Marketing" | "Finance" | "AI";

export interface Profile {
    id: string;
    name: string;
    role: string;
    industry: string;
    category: Category;
    avatar: string;
    location: string;
    experience: string;
    skills: string[];
    languages: string[];
    mode: string;
    rating: number;
    reviews: number;
    price: string;
    responseTime: string;
    successRate: number;
    isVerified: boolean;
    isFeatured?: boolean;
    availableTime?: string;
    company?: string;
    level?: string; // Added level for dynamic pricing
    logo?: string; // BookSessionPage uses logo instead of avatar sometimes? Standardizing on avatar if possible but mapping for safety
    openings?: number;
    availability?: {
        sessionDuration: number;
        maxPerDay: number;
        weekly: Record<string, { from: string; to: string }[]>;
        breakDates: any[];
    };
}

const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const calculateProfessionalExperience = (professionalDetails: any) => {
    if (!professionalDetails?.previous || professionalDetails.previous.length === 0) return null;
    let totalMonths = 0;
    const today = new Date();
    professionalDetails.previous.forEach((job: any) => {
        if (job.start) {
            const startDate = new Date(job.start);
            const endDate = job.end ? new Date(job.end) : today;
            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth());
            totalMonths += months;
        }
    });
    const years = Math.floor(totalMonths / 12);
    if (years <= 0) return "Less than 1 year";
    if (years === 1) return "1 year";
    return `${years}+ years`;
};

const getCurrentCompany = (professionalDetails: any, category: string) => {
    if (!professionalDetails?.previous || professionalDetails.previous.length === 0) {
        if (professionalDetails?.company) return professionalDetails.company;
        return `${category} Consultant`;
    }
    const currentJob = professionalDetails.previous.find((job: any) => !job.endDate);
    if (currentJob?.company) return currentJob.company;
    const sortedJobs = [...professionalDetails.previous].sort((a: any, b: any) => {
        const dateA = a.end ? new Date(a.end) : new Date();
        const dateB = b.end ? new Date(b.end) : new Date();
        return dateB.getTime() - dateA.getTime();
    });
    return sortedJobs[0]?.company || professionalDetails?.company || `${category} Consultant`;
};

const getJobTitle = (professionalDetails: any, category: string) => {
    if (professionalDetails?.title) return professionalDetails.title;
    if (!professionalDetails?.previous || professionalDetails.previous.length === 0) return `${category} Expert`;
    const currentJob = professionalDetails.previous.find((job: any) => !job.end);
    if (currentJob?.title) return currentJob.title;
    const sortedJobs = [...professionalDetails.previous].sort((a: any, b: any) => {
        const dateA = a.end ? new Date(a.end) : new Date();
        const dateB = b.end ? new Date(b.end) : new Date();
        return dateB.getTime() - dateA.getTime();
    });
    return sortedJobs[0]?.title || `${category} Expert`;
};

const formatAvailability = (availability: any) => {
    if (!availability) return "Flexible Hours";
    const duration = availability.sessionDuration || 60;
    const maxPerDay = availability.maxPerDay || 1;
    return `${duration} min sessions, up to ${maxPerDay}/day`;
};

const calculatePrice = (experience: string, category: string) => {
    const basePrices: { [key: string]: number } = {
        IT: 500, HR: 400, Business: 600, Design: 450, Marketing: 400, Finance: 550, AI: 700
    };
    const basePrice = basePrices[category] || 500;
    if (experience.includes("Fresher") || experience.includes("Less than")) return `₹${basePrice - 100}/hr`;
    else if (experience.includes("1 year") || experience.includes("2 year")) return `₹${basePrice}/hr`;
    else {
        const yearsMatch = experience.match(/(\d+)\+/);
        if (yearsMatch) {
            const years = parseInt(yearsMatch[1]);
            if (years >= 10) return `₹${basePrice + 300}/hr`;
            else if (years >= 5) return `₹${basePrice + 200}/hr`;
            else return `₹${basePrice + 100}/hr`;
        }
    }
    return `₹${basePrice}/hr`;
};

export const mapExpertToProfile = (expert: any): Profile => {
    const category = expert.personalInformation?.category || "IT";
    let experience = "";
    if (expert.professionalDetails?.totalExperience > 0) {
        experience = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
    } else {
        const workExperience = calculateProfessionalExperience(expert.professionalDetails);
        if (workExperience) experience = workExperience;
        else if (expert.personalInformation?.dob) {
            const age = calculateAge(expert.personalInformation.dob);
            const yearsExp = Math.max(0, age - 22);
            experience = yearsExp === 0 ? "Fresher" : yearsExp === 1 ? "1 year" : `${yearsExp}+ years`;
        } else experience = "Experienced Professional";
    }

    const company = getCurrentCompany(expert.professionalDetails, category);
    const role = getJobTitle(expert.professionalDetails, category);
    const skills = [
        ...(expert.skillsAndExpertise?.domains || []),
        ...(expert.skillsAndExpertise?.tools || [])
    ].map((skill: string) => skill.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

    const languages = (expert.skillsAndExpertise?.languages || []).map((lang: string) => lang.charAt(0).toUpperCase() + lang.slice(1));
    const availableTime = formatAvailability(expert.availability);
    const mode = expert.skillsAndExpertise?.mode || "Online";

    const city = expert.personalInformation?.city || "";
    const state = expert.personalInformation?.state || "";
    const country = expert.personalInformation?.country || "";
    let location = mode;
    if (city && state) location = `${city}, ${state}`;
    else if (state) location = state;
    else if (country) location = country;

    const price = expert.pricing?.hourlyRate ? `₹${expert.pricing.hourlyRate}/hr` : calculatePrice(experience, category);
    const rating = expert.metrics?.avgRating || 0;
    const reviews = expert.metrics?.totalReviews || 0;
    const successRate = expert.metrics?.totalSessions > 0 ? Math.round((expert.metrics.completedSessions / expert.metrics.totalSessions) * 100) : 0;
    const responseTime = expert.metrics?.avgResponseTime > 0 ? `${Math.round(expert.metrics.avgResponseTime)} hours` : 'New expert';
    const industry = expert.professionalDetails?.industry || category;
    const avatar = getProfileImageUrl(expert.profileImage);

    return {
        id: expert._id || expert.userId,
        name: expert.personalInformation?.userName || "Expert",
        role, industry, experience, skills: skills.length > 0 ? skills : ["Interview Coaching"],
        rating, price, category: category as Category, company,
        avatar, location, mode, reviews, responseTime, successRate,
        isVerified: expert.status === "Active",
        availableTime, languages,
        level: expert.professionalDetails?.level || "Intermediate", // Mapped level
        logo: avatar, // Mapping avatar to logo for compatibility
        openings: 5, // Default openings
        availability: expert.availability // Passing raw availability
    };
};
