import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
    onClose: () => void;
}

interface Message {
    id: string;
    sender: string;
    text: string;
    time: string;
    isLocal: boolean;
}

export const ChatPanel = ({ onClose }: ChatPanelProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock initial message
    useEffect(() => {
        setMessages([
            { id: '1', sender: 'System', text: 'Welcome to the chat!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isLocal: false }
        ]);
    }, []);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'You',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLocal: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white text-gray-800 shadow-xl border-l border-gray-200">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 text-gray-700">
                    <MessageSquare size={20} />
                    <h3 className="font-semibold text-lg">In-call messages</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                            <span className="text-xs font-bold text-gray-600">{msg.sender}</span>
                            <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.isLocal
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Send a message..."
                        className="w-full pl-5 pr-12 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md"
                    >
                        <Send size={16} className="ml-0.5" />
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    Messages are only visible to people in the call.
                </p>
            </form>
        </div>
    );
};
