import { Crown, Check, ArrowRight, Zap, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export const ProUpgradeCard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    if (user?.isPremium) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 p-5 shadow-sm group">
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles className="w-12 h-12 text-[#004fcb]" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-[#004fcb] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Premium</div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 mt-2">Free Sessions Left</h4>
                    <div className="flex items-end gap-1.5 mb-2">
                        <span className="text-2xl font-black text-[#004fcb]">{user?.freeInterviewsCount || 0}</span>
                        <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase">/ 3 Remaining</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mb-0">Use these credits to book any expert for free.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-blue-50 border border-blue-100 p-5 shadow-sm group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-20 h-20 bg-indigo-100 rounded-full blur-xl opacity-60"></div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-[#004fcb] fill-current" />
                        </div>
                        <span className="font-bold text-sm tracking-wide uppercase text-blue-600">Premium Plan</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight text-gray-900">Life-time Access</h3>
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-bold text-[#004fcb]">₹499</span>
                    <span className="text-[10px] text-gray-500 uppercase font-medium">One-time</span>
                </div>
            </div>

            <p className="relative z-10 text-xs text-gray-600 mb-4 font-medium leading-relaxed">
                Unlock exclusive interviews, expert feedback, and verified certification badges.
            </p>

            {/* Features List */}
            <ul className="relative z-10 space-y-2.5 mb-5">
                {[
                    "3 Free Mock Interviews",
                    "Verified Certifications",
                    "Priority Matching",
                    "Expert Resume Edits"
                ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-[#004fcb]" strokeWidth={3} />
                        </div>
                        {feature}
                    </li>
                ))}
            </ul>

            {/* Action */}
            <Button
                onClick={() => navigate('/payment', { state: { upgradeType: 'premium' } })}
                className="relative z-10 w-full bg-[#004fcb] text-white hover:bg-[#003bb5] border-0 font-bold text-xs h-9 shadow-md shadow-blue-200 transition-all"
            >
                Upgrade to Premium
            </Button>

            {/* Floating generic ad element for visual interest */}
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
                <Star className="w-24 h-24 text-blue-900 fill-blue-900" />
            </div>
        </div>
    );
};
