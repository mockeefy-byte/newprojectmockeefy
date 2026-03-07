import { Zap } from "lucide-react";

export const ProFeatureBanner = () => {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">

            {/* Minimalist Content */}
            <div className="text-center sm:text-left z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">
                    Upgrade to
                    <span className="ml-2 inline-block -rotate-1 transform bg-emerald-600 px-3 py-1 text-white shadow-sm rounded-sm origin-bottom-left">
                        Pro
                    </span>
                </h3>
                <p className="text-sm text-gray-500 mt-2 font-medium max-w-md">
                    Unlock unlimited mock interviews & get hired faster.
                </p>
            </div>

            {/* Compact Action */}
            <div className="flex items-center gap-3 z-10">
                <button className="whitespace-nowrap bg-gray-900 text-white hover:bg-black px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    Get Started
                </button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>
    );
};
