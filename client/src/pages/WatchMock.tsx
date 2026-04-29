import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
    Play,
    Pause,
    Maximize,
    Volume2,
    Settings,
    Bookmark,
    CheckCircle,
    Clock,
    MoreVertical,
    ThumbsUp,
    Share2,
    PlayCircle,
    Lock
} from "lucide-react";
import { toast } from "sonner";

// Mock Data for Playlist
const PRECOMPILED_PLAYLIST = [
    {
        id: 1,
        title: "System Design: WhatsApp Architecture",
        duration: "45:20",
        instructor: "Sarah Chen",
        role: "Ex-Google Tech Lead",
        thumbnail: "from-blue-600 to-indigo-900", // Gradient placeholder
        type: "System Design",
        uploaded: "2 days ago",
        views: "12k",
        description: "Deep dive into messaging queues, database sharding, and real-time considerations for scaling a chat application to billions of users.",
        tags: ["System Design", "Scalability", "Databases"],
        questions: [
            { time: "05:30", text: "How to handle real-time message delivery?" },
            { time: "12:45", text: "Explain database sharding strategies." },
            { time: "25:10", text: "Handling offline message sync." }
        ]
    },
    {
        id: 2,
        title: "React Performance Optimization",
        duration: "32:15",
        instructor: "Mike Ross",
        role: "Senior Frontend Eng",
        thumbnail: "from-purple-600 to-pink-900",
        type: "Frontend",
        uploaded: "1 week ago",
        views: "8.5k",
        description: "Learn advanced techniques like useMemo, useCallback, virtualization, and code splitting to make your React apps fly.",
        tags: ["React", "Performance", "Frontend"],
        questions: [
            { time: "03:10", text: "When to use useMemo?" },
            { time: "15:20", text: "Virtualizing long lists." }
        ]
    },
    {
        id: 3,
        title: "Node.js Microservices Patterns",
        duration: "55:00",
        instructor: "Alex Do",
        role: "Backend Architect",
        thumbnail: "from-green-600 to-emerald-900",
        type: "Backend",
        uploaded: "3 weeks ago",
        views: "15k",
        description: "Explore common microservices patterns, inter-service communication, and error handling in a distributed Node.js environment.",
        tags: ["Node.js", "Microservices", "Backend"],
        questions: []
    },
    {
        id: 4,
        title: "Graph Algorithms for Interviews",
        duration: "1:10:00",
        instructor: "Priya Pat",
        role: "SDE II @ Amazon",
        thumbnail: "from-amber-600 to-orange-900",
        type: "DSA",
        uploaded: "1 month ago",
        views: "22k",
        description: "Master BFS, DFS, and Dijkstra's algorithm with real-world interview problem examples.",
        tags: ["DSA", "Graphs", "Algorithms"],
        questions: []
    },
    {
        id: 5,
        title: "Behavioral Interview Mastery",
        duration: "28:45",
        instructor: "HR Team",
        role: "Tech Recruiters",
        thumbnail: "from-slate-600 to-slate-900",
        type: "Soft Skills",
        uploaded: "2 months ago",
        views: "5k",
        description: "How to answer 'Tell me about a time you failed' using the STAR method effectively.",
        tags: ["Behavioral", "Soft Skills", "HR"],
        questions: []
    }
];

const WatchMock = () => {
    const [currentVideo, setCurrentVideo] = useState(PRECOMPILED_PLAYLIST[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isWatched, setIsWatched] = useState(false);

    const handleVideoSelect = (video: typeof PRECOMPILED_PLAYLIST[0]) => {
        setCurrentVideo(video);
        setIsPlaying(false);
        setIsWatched(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <Navigation />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT CONTENT: Player & Details (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Video Player Section */}
                        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group">
                            {/* Placeholder Content / Poster */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentVideo.thumbnail} opacity-80`}></div>

                            {/* Play Overlay */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer" onClick={togglePlay}>
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            )}

                            {/* Fake Controls Bar (Simulated) */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {/* Progress Line */}
                                <div className="h-1 bg-white/30 rounded-full mb-4 cursor-pointer overflow-hidden">
                                    <div className="h-full w-1/3 bg-[#004fcb] relative"></div>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                        </button>
                                        <button className="hover:text-blue-400">
                                            <Volume2 size={20} />
                                        </button>
                                        <span className="text-xs font-medium">12:30 / {currentVideo.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="hover:text-blue-400 text-xs font-bold border border-white/30 px-1.5 py-0.5 rounded">1x</button>
                                        <button className="hover:text-blue-400"><Settings size={20} /></button>
                                        <button className="hover:text-blue-400"><Maximize size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Video Details & Actions */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                        {currentVideo.title}
                                    </h1>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setIsBookmarked(!isBookmarked)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isBookmarked ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <Bookmark size={18} className={isBookmarked ? "fill-blue-700" : ""} />
                                            {isBookmarked ? 'Saved' : 'Save'}
                                        </button>
                                        <button className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                            <Share2 size={18} />
                                        </button>
                                        <button className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-900">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004fcb] to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                                            {currentVideo.instructor.charAt(0)}
                                        </div>
                                        {currentVideo.instructor}
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold rounded-full">{currentVideo.role}</span>
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{currentVideo.uploaded}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{currentVideo.views} views</span>
                                </div>

                                {/* Description Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {currentVideo.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {currentVideo.description}
                                    </p>
                                </div>
                            </div>

                            {/* 3. Learning Extras (Questions) */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Key Topics Covered
                                    </h3>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chapter List</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {currentVideo.questions.length > 0 ? (
                                        currentVideo.questions.map((q, i) => (
                                            <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                                <span className="px-2 py-1 bg-gray-100 text-blue-600 text-xs font-bold rounded group-hover:bg-blue-100 transition-colors font-mono">
                                                    {q.time}
                                                </span>
                                                <p className="text-sm text-gray-700 font-medium group-hover:text-blue-700 transition-colors">{q.text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            No timestamps available for this video.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDEBAR: Playlist (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Playlist Container */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-120px)] sticky top-24">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">Up Next</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">Auto-playing next video</p>
                                </div>
                                <div className="flex gap-2">
                                    {/* Simple toggle UI */}
                                    <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                                {PRECOMPILED_PLAYLIST.map((video) => {
                                    const isActive = currentVideo.id === video.id;
                                    return (
                                        <div
                                            key={video.id}
                                            onClick={() => handleVideoSelect(video)}
                                            className={`group flex gap-3 p-3 rounded-xl transition-all cursor-pointer border ${isActive ? 'bg-blue-50 border-blue-100 ring-1 ring-blue-200' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                                        >
                                            {/* Thumbnail */}
                                            <div className={`w-32 h-20 rounded-lg bg-gradient-to-br ${video.thumbnail} shrink-0 relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                                                    {video.duration}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className={`text-sm font-bold leading-snug mb-1 line-clamp-2 ${isActive ? 'text-[#004fcb]' : 'text-gray-900 group-hover:text-[#004fcb] transition-colors'}`}>
                                                    {video.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate mb-1">{video.instructor}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${video.type === 'System Design' ? 'bg-purple-100 text-purple-700' :
                                                            video.type === 'Frontend' ? 'bg-pink-100 text-pink-700' :
                                                                video.type === 'Backend' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {video.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Playlist Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                                <button className="text-xs font-bold text-[#004fcb] hover:underline uppercase tracking-widest">
                                    View Full Playlist
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default WatchMock;
