import { useState } from 'react';
import { 
  Briefcase, MapPin, Clock, Users, Star, BookOpen, 
  ChevronRight, Eye, Bookmark, Filter, Search, Zap, 
  Award, TrendingUp, ShieldCheck, Heart 
} from 'lucide-react';

const ProfileCard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const profiles = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior HR Manager",
      experience: "8+ years",
      skills: ["Technical Hiring", "Behavioral Analysis", "Leadership"],
      rating: 4.8,
      price: "₹99/session",
      type: "hr",
      company: "Cognizant",
      reviews: 42,
      postedAgo: "3 days ago",
      location: "Remote",
      officeLocation: "Hyderabad",
      responseTime: "2 hours",
      successRate: "95%",
      sessionsCompleted: 150
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Full Stack Developer",
      experience: "6+ years",
      skills: ["React", "Node.js", "System Design", "AWS"],
      rating: 4.9,
      price: "₹99/session",
      type: "mentor",
      company: "Microsoft",
      reviews: 87,
      postedAgo: "1 day ago",
      location: "Hybrid",
      officeLocation: "Bangalore",
      responseTime: "1 hour",
      successRate: "98%",
      sessionsCompleted: 230
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Tech Recruiter",
      experience: "5+ years",
      skills: ["Frontend", "Backend", "DevOps", "Interview Prep"],
      rating: 4.7,
      price: "₹99/session",
      type: "hr",
      company: "Google",
      reviews: 56,
      postedAgo: "5 days ago",
      location: "Remote",
      officeLocation: "Chennai",
      responseTime: "4 hours",
      successRate: "92%",
      sessionsCompleted: 180
    }
  ];

  const filters = [
    { id: 'all', label: 'All Coaches', count: 12 },
    { id: 'hr', label: 'HR Experts', count: 5 },
    { id: 'mentor', label: 'Tech Mentors', count: 7 },
    { id: 'available', label: 'Available Now', count: 8 }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section with Glass Gradient */}
        <div className="relative mb-12 p-8 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Mentors
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                Accelerate Your Career with <span className="text-blue-200">Expert Coaching</span>
              </h1>
              <p className="text-lg text-blue-100 font-medium opacity-90">
                Connect with 150+ industry leaders from top tech giants. Personalized guidance, real mock interviews, and actionable feedback.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search by role or company..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                />
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white text-blue-700 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 border-2 ${
                activeFilter === filter.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-1'
                  : 'bg-white border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
              }`}
            >
              {filter.label}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md ${activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Promo Card */}
            <div className="relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-24 h-24 fill-white" />
              </div>
              <div className="relative z-10 max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-black rounded uppercase tracking-tighter">Limited Offer</span>
                </div>
                <h3 className="text-2xl font-black mb-2">Kickstart Your Prep at <span className="text-yellow-300">₹99</span></h3>
                <p className="text-blue-100 font-medium mb-6 opacity-90 leading-relaxed">
                  Join exclusive mentorship sessions with experts from Microsoft, Amazon, and Google. Limited slots available this week!
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-8 py-3 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10 active:scale-95">
                    Explore Slots
                  </button>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700">
                        {i === 1 ? 'SJ' : i === 2 ? 'RK' : 'PS'}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">
                      +12
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Cards */}
            <div className="grid grid-cols-1 gap-6">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="group relative bg-white border border-slate-200/60 rounded-[32px] overflow-hidden hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Avatar & Identitiy */}
                      <div className="flex-1">
                        <div className="flex items-start gap-6">
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white rounded-[24px] flex items-center justify-center text-blue-700 font-black text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500 uppercase">
                              {profile.name.trim().substring(0, 2)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-lg border-2 border-white shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                                {profile.name}
                              </h3>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200/50">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-[14px] font-black text-slate-900">{profile.rating}</span>
                                <span className="text-[11px] font-bold text-slate-400">({profile.reviews})</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-bold mb-4">
                              <span className="text-blue-600 flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" />
                                {profile.role}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                {profile.experience}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {profile.location}
                              </span>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600 uppercase tracking-wider">
                                {profile.company}
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-black text-emerald-700 uppercase tracking-wider">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {profile.successRate} success
                              </div>
                            </div>

                            {/* Skill Tags */}
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-1.5 bg-blue-50/50 text-blue-700 border border-blue-100/50 rounded-xl text-xs font-black tracking-wide"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="lg:w-72 flex flex-col justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors duration-500">
                        <div className="space-y-4 mb-6">
                          <div className="text-center lg:text-right">
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">
                              {profile.price}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">per session</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1.5" />
                              <div className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Response</div>
                              <div className="text-[12px] font-black text-slate-900">{profile.responseTime}</div>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1.5" />
                              <div className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Sessions</div>
                              <div className="text-[12px] font-black text-slate-900">{profile.sessionsCompleted}+</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button className="flex items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black group/save">
                            <Bookmark className="w-5 h-5 group-hover/save:fill-blue-500 group-hover/save:text-blue-500" />
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 px-4">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Available: {profile.officeLocation}</span>
                      <span>•</span>
                      <span>{profile.postedAgo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-extrabold text-blue-600">
                      <Eye className="w-4 h-4" />
                      100+ REQUESTS THIS WEEK
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination/Load More */}
            <div className="pt-8 flex justify-center">
              <button className="px-10 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-black hover:border-blue-400 hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50 active:scale-95">
                Discover More Mentors
              </button>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Quick Actions</h3>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, label: 'Schedule Session', color: 'bg-blue-600' },
                  { icon: Users, label: 'Find HR Experts', color: 'bg-indigo-600' },
                  { icon: Award, label: 'View Top Rated', color: 'bg-amber-500' },
                  { icon: Zap, label: 'Instant Guidance', color: 'bg-rose-500' }
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="font-black text-slate-700 tracking-tight">{action.label}</span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter/Alerts */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Heart className="w-20 h-24 fill-white" />
               </div>
               <h3 className="text-xl font-black mb-2">Get Job Alerts</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">Join 10k+ candidates receiving weekly career tips and hot job openings.</p>
               <input 
                 type="email" 
                 placeholder="your@email.com" 
                 className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40">
                 Join Newsletter
               </button>
            </div>

             {/* Help Card */}
             <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-8">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                 <MessageSquare className="w-6 h-6 text-blue-600" />
               </div>
               <h3 className="text-lg font-black text-blue-900 mb-2">Need Help?</h3>
               <p className="text-blue-600/70 text-sm font-bold mb-6">Our career experts are here to help you find the right coach for your goals.</p>
               <button className="font-black text-blue-700 border-b-2 border-blue-300 hover:border-blue-600 transition-all">
                 Chat with Support
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock missing icon
const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export default ProfileCard;