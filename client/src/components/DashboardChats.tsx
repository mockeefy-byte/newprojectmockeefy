
import { useState } from "react";
import { MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { getProfileImageUrl } from "../lib/imageUtils";

// Mock data since we don't have a real chat backend fully integrated yet
const MOCK_CHATS = [
    {
        id: 1,
        name: "Sarah Johnson",
        lastMessage: "Thanks for the session! It was really helpful.",
        time: "10:30 AM",
        unread: 2,
        online: true,
        avatar: null
    },
    {
        id: 2,
        name: "Michael Chen",
        lastMessage: "Can we reschedule our mock interview?",
        time: "Yesterday",
        unread: 0,
        online: false,
        avatar: null
    },
    {
        id: 3,
        name: "David Smith",
        lastMessage: "I've uploaded my resume for review.",
        time: "Yesterday",
        unread: 0,
        online: true,
        avatar: null
    }
];

const DashboardChats = () => {
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [messageInput, setMessageInput] = useState("");

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                        <p className="text-xs text-gray-500 font-medium">Recent conversations</p>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {MOCK_CHATS.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => setActiveChat(chat.id)}
                        className={`p-4 border-b border-gray-50 cursor-pointer ${activeChat === chat.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                    {chat.avatar ? (
                                        <img src={getProfileImageUrl(chat.avatar)} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500">{chat.name.charAt(0)}</span>
                                    )}
                                </div>
                                {chat.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h3>
                                    <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate leading-relaxed">
                                    {chat.lastMessage}
                                </p>
                            </div>

                            {chat.unread > 0 && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {chat.unread}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Empty state filler */}
                {MOCK_CHATS.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs font-medium">No recent messages</p>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    />
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={!messageInput.trim()}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardChats;
