import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { getProfileImageUrl } from "../lib/imageUtils";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";
import { calculateAge, calculateProfessionalExperience, getCurrentCompany, getJobTitle } from "../lib/expertUtils";

const TASKS = ["Profile (75)", "Top Candidate (8)", "You might like (43)", "Preferences (0)"];

// Skeleton
const SkeletonLoader = () => (
    <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[300px] h-[280px] bg-white rounded-xl border border-gray-100 p-5 space-y-4 animate-pulse">
                <div className="flex justify-between">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-3/4 h-4 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-100 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-10 bg-gray-50 rounded mt-auto"></div>
            </div>
        ))}
    </div>
);


const RecommendedMentors = () => {
    const [activeTab, setActiveTab] = useState("Profile (75)");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    // Fetch Data
    const { data: expertsData, isLoading } = useQuery({
        queryKey: ["experts-recommended"],
        queryFn: async () => {
            const res = await axios.get("/api/expert/verified");
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Transform Data
    const mentors: MentorProfile[] = (expertsData?.data || expertsData || []).map((e: any) => {
        const cat = e.personalInformation?.category || "General";
        let exp = "";
        if (e.professionalDetails?.totalExperience) exp = e.professionalDetails.totalExperience === 1 ? "1 year" : `${e.professionalDetails.totalExperience} years`;
        else exp = calculateProfessionalExperience(e.professionalDetails) || (calculateAge(e.personalInformation?.dob) - 22 > 0 ? `${calculateAge(e.personalInformation?.dob) - 22}+ years` : "Fresher");

        return {
            id: e._id || e.userId,
            expertID: e._id || e.userId,
            name: e.personalInformation?.userName || "Expert",
            role: getJobTitle(e.professionalDetails, cat),
            company: getCurrentCompany(e.professionalDetails, cat),
            location: e.personalInformation?.city || "Online",
            rating: e.metrics?.avgRating || 5.0,
            reviews: e.metrics?.totalReviews || 0,
            avatar: getProfileImageUrl(e.profileImage),
            activeTime: `${Math.floor(Math.random() * 5) + 1}d ago`,
            isVerified: e.status === "Active",
            price: e.price ? `₹${e.price}` : "₹500",
            skills: e.skillsAndExpertise?.domains || [],
            experience: exp,
            totalSessions: e.metrics?.totalSessions || 0,
        };
    }).slice(0, 10); // Limit to top 10

    // Scroll Logic
    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            // Tolerance of 5px for float precision
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, [mentors]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const cardWidth = 320; // Approx card width + gap
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(checkScrollButtons, 300); // Wait for scroll animation
    };

    // Drag-to-scroll state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        checkScrollButtons();
    };


    return (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 relative overflow-hidden">
            {/* Decorative Background Fade */}
            <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Recommended mentors for you</h2>
                    <p className="text-sm text-gray-500 mt-1">Based on your potential profile and preferences</p>
                </div>
                <button className="text-[#004fcb] font-bold text-sm hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
                {TASKS.map(tab => {
                    const isActive = tab === activeTab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                pb-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${isActive ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-700"}
                            `}
                        >
                            {tab}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scroll Container */}
            <div className="relative group/scroll">

                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className={`
                        absolute left-0 top-1/2 -translate-y-1/2 z-20 
                        w-10 h-10 bg-white border border-gray-100 shadow-lg rounded-full 
                        flex items-center justify-center text-gray-700 hover:text-[#004fcb] hover:scale-105 transition-all
                        ${!showLeftArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                        -ml-5 hidden md:flex
                    `}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Content Area */}
                <div
                    ref={scrollContainerRef}
                    className={`
                        flex gap-5 overflow-x-auto pb-6 -mb-6 scrollbar-hide snap-x pt-1 px-1
                        ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
                    `}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={checkScrollButtons}
                >
                    {isLoading ? (
                        <SkeletonLoader />
                    ) : mentors.length > 0 ? (
                        mentors.map(mentor => (
                            <MentorJobCard key={mentor.id} mentor={mentor} />
                        ))
                    ) : (
                        <div className="w-full py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No mentors found in this category.
                        </div>
                    )}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className={`
                        absolute right-0 top-1/2 -translate-y-1/2 z-20 
                        w-10 h-10 bg-white border border-gray-100 shadow-lg rounded-full 
                        flex items-center justify-center text-gray-700 hover:text-[#004fcb] hover:scale-105 transition-all
                        ${!showRightArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                        -mr-5 hidden md:flex
                    `}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

            </div>
        </section>
    );
};

export default RecommendedMentors;
