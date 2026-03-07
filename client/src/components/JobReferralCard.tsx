import { Card } from "../components/ui/card";

export const JobReferralCard = () => (
    <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 relative overflow-hidden group border-none shadow-lg">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-2.5 1.25L12 17.5l7.5-5.25-2.5-1.25-5 2.5z" /></svg>
        </div>

        <div className="relative z-10">
            <span className="inline-block px-2.5 py-0.5 bg-blue-500/20 text-blue-100 text-[10px] font-bold rounded-full mb-3 border border-blue-400/30 uppercase tracking-wider">
                Featured
            </span>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">Unlock Direct Job Referrals</h3>
            <p className="text-blue-100/80 text-xs mb-4 leading-relaxed">
                Complete 3 mock interviews to earn your certificate and get referred to top tech companies.
            </p>
            <a href="/dashboard" className="w-full inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20">
                Start Your Journey
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
        </div>
    </Card>
);
