import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { getProfileImageUrl } from "../lib/imageUtils";
import { Search, MapPin, Briefcase, Award, ExternalLink, DollarSign, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Expert {
    _id: string;
    personalInformation: {
        userName: string;
        city?: string;
        country?: string;
    };
    professionalDetails: {
        title: string;
        company: string;
    };
    profileImage: string;
    skillsAndExpertise?: {
        tools?: string[];
        languages?: string[];
    };
    expertSkills?: {
        skillName: string;
    }[];
}

interface Job {
    _id: string;
    company: string;
    position: string;
    location: string;
    salary: string;
    type: string;
    applyLink: string;
    tags: string[];
    postedAt: string;
}

const JobReferral = () => {
    const navigate = useNavigate();
    const [experts, setExperts] = useState<Expert[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expertsRes, jobsRes] = await Promise.all([
                    axios.get("/api/expert/verified"),
                    axios.get("/api/jobs")
                ]);
                setExperts(expertsRes.data.data || []);
                setJobs(jobsRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredExperts = experts.filter((exp) => {
        const name = exp.personalInformation?.userName || "Expert";
        const company = exp.professionalDetails?.company || "";
        const title = exp.professionalDetails?.title || "";

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">

            {/* Hero Section */}
            <div className="w-full max-w-7xl animate-fadeIn space-y-8 mb-12">

                {/* Main Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl text-white">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="relative px-8 py-12 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-6 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-blue-100 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                <Award className="w-4 h-4" />
                                Exclusive for Certified Candidates
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Dream Job</span> with Direct Referrals
                            </h1>
                            <p className="text-lg text-blue-100/80 leading-relaxed">
                                Connect with industry experts who can vouch for your skills. Get referred to top companies and fast-track your application process.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <button className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                                    Browse Experts <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* 100% Job Assured Badge */}
                        <div className="relative shrink-0 animate-float">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-[0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-500 cursor-pointer group">
                                <div className="w-full h-full rounded-full border-4 border-white/30 border-dashed animate-spin-slow"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white text-shadow-sm">
                                    <ShieldCheck className="w-12 h-12 mb-2 drop-shadow-md" />
                                    <span className="text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">100%</span>
                                    <span className="text-lg font-bold uppercase tracking-widest drop-shadow-md">Job Assured</span>
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded mt-2 font-medium">Placement Program</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ads Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
                                        PREMIUM
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Exclusive Job Listings</h3>
                                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Access hidden job openings not available on public job boards.</p>
                                </div>
                                <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-gray-50 hover:bg-purple-600 text-gray-700 hover:text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                                Browse Openings
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
                                        FEATURED
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">Resume Review</h3>
                                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Get your resume reviewed by FAANG experts before applying.</p>
                                </div>
                                <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                    <ExternalLink className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-gray-50 hover:bg-amber-600 text-gray-700 hover:text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                                Get Reviewed
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- JOB BOARD SECTION --- */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-[#004fcb]" />
                                Latest Job Openings
                            </h2>
                            <p className="text-gray-500 mt-1">Curated opportunities from top companies</p>
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No jobs posted yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Check back later for new opportunities from our partner companies.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-200 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#004fcb] transition-colors">{job.position}</h3>
                                            <p className="text-gray-500 font-medium text-sm mt-1">{job.company}</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-semibold uppercase tracking-wide">
                                            {job.type}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            {job.salary}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-400">Posted {new Date(job.postedAt).toLocaleDateString()}</p>
                                        <a
                                            href={job.applyLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-gray-50 text-gray-900 hover:bg-[#004fcb] hover:text-white rounded-lg font-bold text-sm transition-all"
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expert Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Expert Panel</h2>
                        <p className="text-gray-500 mt-2">Connect with verified experts for guidance and referrals.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or company..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>



                {/* Expert Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm animate-pulse space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-20 bg-gray-100 rounded-lg"></div>
                                <div className="h-10 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))
                    ) : filteredExperts.length > 0 ? (
                        filteredExperts.map((expert) => (
                            <div key={expert._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden group">
                                <div className="p-5 flex items-start gap-4">
                                    <img
                                        src={getProfileImageUrl(expert.profileImage)}
                                        alt={expert.personalInformation?.userName || "Expert"}
                                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-gray-50 shadow-sm"
                                        onError={(e) => {
                                            e.currentTarget.src = getProfileImageUrl(null);
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{expert.personalInformation?.userName || "Expert"}</h3>
                                        <p className="text-sm text-gray-500 truncate">{expert.professionalDetails?.title || "Professional"}</p>
                                        <p className="text-xs font-semibold text-blue-600 mt-0.5 truncate">{expert.professionalDetails?.company || "Company"}</p>
                                    </div>
                                </div>

                                <div className="px-5 pb-4 flex-1">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(expert.skillsAndExpertise?.tools || []).slice(0, 3).map((skill: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <MapPin className="w-3 h-3" />
                                        {expert.personalInformation?.city || "Remote"}, {expert.personalInformation?.country || "Global"}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                    <button
                                        onClick={() => navigate('/book-session', { state: { expertId: expert._id } })}
                                        className="w-full py-2.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                                    >
                                        Request Referral
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No experts found</h3>
                            <p className="text-gray-500">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default JobReferral;
