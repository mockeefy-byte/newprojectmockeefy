import { Paperplane, Briefcase, MapPin } from "lucide-react"; // Using similar icons

// SVG Icon for the paper airplane logo (custom to match screenshot closely if needed)
const PaperPlaneIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#FFF5F5" />
        <path d="M31.5 16.5L13.5 24L21 27L31.5 16.5ZM21 27V33L25.5 28.5L31.5 31.5L34.5 15L21 27Z" fill="#FF5630" />
    </svg>
);

export const EarlyAccessAd = () => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <PaperPlaneIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            75 Early access roles from top companies
                            <span className="text-gray-400">ⓘ</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                            See what recruiters are searching for, even before they post a job
                        </p>
                    </div>
                </div>
                <a href="#" className="text-blue-600 font-bold text-sm hover:underline">View all</a>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* Job Card 1 */}
                <div className="min-w-[300px] border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-gray-900">Sr. Recruiter</h4>
                            <p className="text-xs text-gray-500">Foreign MNC in Analytics</p>
                        </div>
                        <span className="text-[10px] text-gray-400">16h ago</span>
                    </div>

                    <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded flex items-center gap-1">
                            ★ 3.5+
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                            Foreign MNC
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                            Service
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> 3-7 Yrs</span>
                        <span className="flex items-center gap-1">₹ 3-6 Lacs P.A.</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Hyderabad/Se...</span>
                    </div>

                    <div className="mt-auto">
                        <p className="text-[10px] text-gray-400 mb-2">Hiring for one of these companies</p>
                        <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">Cr</div>
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">W</div>
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">C</div>
                            </div>
                            <button className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                Share interest
                            </button>
                        </div>
                    </div>
                </div>

                {/* Job Card 2 */}
                <div className="min-w-[300px] border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-gray-900">Sr. IT Recruiter</h4>
                            <p className="text-xs text-gray-500">Foreign IT Consulting M...</p>
                        </div>
                        <span className="text-[10px] text-gray-400">10h ago</span>
                    </div>

                    <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded flex items-center gap-1">
                            ★ 3.0+
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                            Foreign MNC
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> 3-6 Yrs</span>
                        <span className="flex items-center gap-1">₹ 2-7 Lacs P.A.</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Bengaluru</span>
                    </div>

                    <div className="mt-auto">
                        <p className="text-[10px] text-gray-400 mb-2">Hiring for one of these companies</p>
                        <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">L</div>
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">A</div>
                                <div className="w-6 h-6 rounded bg-gray-100 border border-white flex items-center justify-center text-[8px font-bold text-gray-500">M</div>
                            </div>
                            <button className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                Share interest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
