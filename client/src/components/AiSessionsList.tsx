import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Clock, Calendar, ChevronRight, Award } from "lucide-react";

interface AiSession {
    _id: string;
    config: {
        role: string;
        goal: string;
        difficulty: string;
    };
    duration: number;
    createdAt: string;
    status: string;
}

const AiSessionsList = () => {
    const { data: sessions, isLoading } = useQuery({
        queryKey: ["ai-sessions"],
        queryFn: async () => {
            const res = await axios.get("/api/ai-interview/my-sessions");
            return res.data.data as AiSession[];
        },
    });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading sessions...</div>;
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Award className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No AI Interviews yet</h3>
                <p className="text-gray-500 text-sm mt-1">Start a mock interview to see your history here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => (
                <div
                    key={session._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                                {session.config.role.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {session.config.role}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                        <Award className="w-3 h-3" />
                                        {session.config.goal.toUpperCase()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(session.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(session.duration)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {session.status}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AiSessionsList;
