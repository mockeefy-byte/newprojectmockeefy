import { useState } from 'react';
import { Briefcase, MapPin, Clock, Users, Star, BookOpen, ChevronRight, Eye, Bookmark, Share2, Filter, Search, Zap, Award, TrendingUp } from 'lucide-react';

const CoachSessionCard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const profiles = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior HR Manager",
      experience: "8+ years",
      skills: ["Technical Hiring", "Behavioral Analysis", "Leadership"],
      rating: 4.8,
      price: "₹299/session",
      type: "hr",
      company: "Cognizant",
      companyLogo: "/cognizant-logo.png",
      reviews: 42,
      postedAgo: "3 days ago",
      salary: "Not Disclosed",
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
      price: "₹399/session",
      type: "mentor",
      company: "Microsoft",
      companyLogo: "/microsoft-logo.png",
      reviews: 87,
      postedAgo: "1 day ago",
      salary: "Competitive",
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
      price: "₹249/session",
      type: "hr",
      company: "Google",
      companyLogo: "/google-logo.png",
      reviews: 56,
      postedAgo: "5 days ago",
      salary: "Industry Standard",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Coach</h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Connect with industry experts for personalized mock interviews and career guidance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search coaches..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-white transition-colors">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Coaches</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">150+</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">95%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">4.8/5</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">2h</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Centered */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeFilter === filter.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {filter.label}
                    <span className="ml-2 text-xs opacity-80">({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-300" fill="currentColor" />
                    <span className="font-semibold">FEATURED</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Premium Coaching Sessions</h3>
                  <p className="text-blue-100">Get 20% off your first session with verified experts</p>
                </div>
                <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                  Claim Offer
                </button>
              </div>
            </div>

            {/* Profile Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Section - Profile Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {profile.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 truncate">{profile.name}</h3>
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                <span className="text-sm font-semibold text-gray-900">{profile.rating}</span>
                                <span className="text-sm text-gray-600">({profile.reviews})</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="font-medium text-gray-900">{profile.role}</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {profile.experience}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {profile.location}
                              </span>
                            </div>

                            {/* Company Badge */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {profile.company}
                              </div>
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                {profile.successRate} Success Rate
                              </div>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions & Stats */}
                      <div className="lg:w-64 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{profile.price}</div>
                            <div className="text-sm text-gray-500">per session</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <Clock className="w-3 h-3 mx-auto mb-1" />
                              <div>{profile.responseTime}</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <Users className="w-3 h-3 mx-auto mb-1" />
                              <div>{profile.sessionsCompleted}+</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            <Bookmark className="w-4 h-4" />
                            Save
                          </button>
                          <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                            Book Session
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Posted {profile.postedAgo}</span>
                        <span>•</span>
                        <span>Office: {profile.officeLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>150+ views today</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-white transition-colors font-medium text-gray-700">
                Load More Coaches
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: BookOpen, label: 'Schedule Session', color: 'blue' },
                  { icon: Users, label: 'Find HR Experts', color: 'green' },
                  { icon: Award, label: 'View Top Rated', color: 'purple' },
                  { icon: TrendingUp, label: 'Career Guidance', color: 'orange' }
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-700">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Success Stories</h3>
              <div className="space-y-4">
                {[
                  { name: 'Alex Chen', role: 'Placed at Google', story: 'Got 3 offers after mock sessions' },
                  { name: 'Priya Nair', role: 'Amazon Hire', story: 'Improved interview skills by 80%' },
                  { name: 'Rohit Kumar', role: 'Microsoft', story: 'Cracked system design rounds' }
                ].map((story, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{story.name}</div>
                        <div className="text-sm text-blue-600 font-medium">{story.role}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{story.story}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Offer */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
              <Award className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Go Premium</h3>
              <p className="text-purple-100 text-sm mb-4">
                Unlimited sessions, priority booking, and exclusive resources
              </p>
              <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachSessionCard;