import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
    Brain,
    MessageSquare,
    Briefcase,
    Code2,
    Cpu,
    Zap,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    User,
    StopCircle,
    RotateCcw,
    Layers,
    Volume2,
    VolumeX,
    Mic,
    MicOff
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type MockType = 'hr' | 'technical' | 'system-design' | 'behavioral';
type ExperienceLevel = '0-1' | '1-3' | '3-5' | '5+';
type Difficulty = 'easy' | 'medium' | 'hard';
type Tone = 'friendly' | 'strict' | 'professional';
type SessionState = 'config' | 'live' | 'completed';
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface EvaluationReport {
    role: string;
    overallScore: number;
    technicalKnowledge: number;
    communicationClarity: number;
    confidence: number;
    problemSolving: number;
    strengths: string[];
    weaknesses: string[];
    improvementSuggestions: string[];
    recommendedTopicsToStudy: string[];
}

interface SessionConfig {
    goal: MockType | null;
    role: string;
    experience: ExperienceLevel;
    skills: string[];
    difficulty: Difficulty;
    tone: Tone;
    depth: 'concept' | 'scenario' | 'code';
}

const AiInterview = () => {
    const { user, isLoading } = useAuth();

    // State
    const [sessionState, setSessionState] = useState<SessionState>('config');
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<SessionConfig>({
        goal: null,
        role: "Frontend Developer", // Default for easier testing
        experience: "1-3",
        skills: [],
        difficulty: "medium",
        tone: "professional",
        depth: "scenario"
    });
    const [skillInput, setSkillInput] = useState("");
    const [previewText, setPreviewText] = useState("");

    // Live Session State
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
    const [simulatedTime, setSimulatedTime] = useState(0);
    const [waitingForNext, setWaitingForNext] = useState(false);
    const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);
    const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
    const { speak, cancel } = useSpeechSynthesis(aiVoiceEnabled);
    const { startListening, stopListening, isListening, interimTranscript, error: speechError, isSupported: speechSupported } = useSpeechRecognition();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // --- CONFIG EFFECTS ---
    useEffect(() => {
        let targetText = "Hello! I'm your AI interviewer. Configure your session on the left, and I'll adapt my questions here.";

        if (config.role) {
            if (config.goal === 'hr') {
                targetText = `Hello! I'm ready to conduct an HR round for the ${config.role} position. I'll focus on your background and cultural fit.`;
            } else if (config.goal === 'technical') {
                targetText = `Ready for a technical deep-dive into ${config.role}? I'll probe your knowledge of ${config.skills.join(', ') || 'core concepts'} at a ${config.difficulty} level.`;
            } else if (config.goal === 'system-design') {
                targetText = `Let's design some scalable systems. As a ${config.role}, how would you approach high-availability architecture?`;
            }
        }

        let i = 0;
        setPreviewText("");
        const interval = setInterval(() => {
            setPreviewText(targetText.slice(0, i));
            i++;
            if (i > targetText.length) clearInterval(interval);
        }, 20);

        return () => clearInterval(interval);
    }, [config.goal, config.role, config.difficulty, config.skills]);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const INTERVIEW_DURATION_SEC = 600; // 10 minutes

    // --- LIVE: 10 min timer ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (sessionState === 'live') {
            timer = setInterval(() => {
                setSimulatedTime(prev => {
                    if (prev >= INTERVIEW_DURATION_SEC) {
                        clearInterval(timer);
                        endSession();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [sessionState]);

    // --- LIVE: Greeting + first question from knowledge base; AI speaks it ---
    useEffect(() => {
        if (sessionState !== 'live' || !sessionId || transcript.length > 0) return;
        setVoiceState('processing');
        (async () => {
            try {
                const res = await axios.get(`/api/ai-interview/${sessionId}/next-question`);
                const data = res.data?.data;
                const firstQuestion = data?.question || "Tell me about yourself and your experience in this field.";
                const greeting = `Hello, I'm your interviewer for the ${config.role} role. This session will be about 10 minutes with 6 to 8 questions. Let's begin.\n\n${firstQuestion}`;
                const initial = [{ sender: 'ai' as const, text: greeting }];
                setTranscript(initial);
                await axios.put(`/api/ai-interview/${sessionId}/update`, { transcript: initial });
                setVoiceState('speaking');
                const toSpeak = greeting.replace(/\n\n/g, '. ').trim();
                await speak(toSpeak);
                setVoiceState('idle');
            } catch (e) {
                console.error(e);
                const fallback = `Welcome to your ${config.role} interview. Let's start.\n\nTell me about yourself and your relevant experience.`;
                setTranscript([{ sender: 'ai', text: fallback }]);
                setVoiceState('idle');
            }
        })();
    }, [sessionState, sessionId, config.role]);

    const canSpeak = transcript.length > 0 && !waitingForNext && voiceState !== 'processing' && voiceState !== 'speaking';

    const submitSpokenAnswer = async (answer: string) => {
        const text = answer.trim();
        if (!text || !sessionId || waitingForNext) return;
        setWaitingForNext(true);
        cancel();
        const userMsg = { sender: 'user' as const, text };
        setTranscript(prev => [...prev, userMsg]);
        setVoiceState('processing');
        try {
            await axios.put(`/api/ai-interview/${sessionId}/update`, { transcript: [userMsg] });
            const res = await axios.get(`/api/ai-interview/${sessionId}/next-question`);
            const data = res.data?.data;
            if (data?.done || !data?.question) {
                await endSession();
                setWaitingForNext(false);
                return;
            }
            const replyText = data.reply || data.question;
            const aiMsg = { sender: 'ai' as const, text: replyText };
            setTranscript(prev => [...prev, aiMsg]);
            await axios.put(`/api/ai-interview/${sessionId}/update`, { transcript: [aiMsg] });
            setVoiceState('speaking');
            await speak(replyText);
            setVoiceState('idle');
        } catch (e) {
            console.error(e);
            toast.error("Could not load next question.");
            setVoiceState('idle');
        }
        setWaitingForNext(false);
    };

    const handleMicClick = async () => {
        if (!canSpeak && !isListening) return;
        if (isListening) {
            stopListening();
            return;
        }
        setVoiceState('listening');
        const text = await startListening();
        setVoiceState('idle');
        if (text) await submitSpokenAnswer(text);
    };

    useEffect(() => {
        if (speechError) toast.error(speechError);
    }, [speechError]);

    const endSession = async () => {
        cancel();
        if (sessionId) {
            setIsSaving(true);
            try {
                const reportRes = await axios.post(`/api/ai-interview/${sessionId}/generate-report`);
                const report = reportRes.data?.data;
                if (report) setEvaluationReport(report);
                await axios.post(`/api/ai-interview/${sessionId}/end`, {
                    duration: simulatedTime,
                    feedback: report ? 'Evaluation completed.' : '',
                    evaluationReport: report,
                });
                toast.success("Session saved. Here's your evaluation.");
            } catch (error) {
                console.error("Failed to save session", error);
                toast.error("Failed to save session.");
            } finally {
                setIsSaving(false);
            }
        }
        setSessionState('completed');
    };

    // --- HANDLERS ---
    const handleSkillAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            if (!config.skills.includes(skillInput.trim())) {
                setConfig({ ...config, skills: [...config.skills, skillInput.trim()] });
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setConfig({ ...config, skills: config.skills.filter(s => s !== skill) });
    };

    const nextStep = () => {
        if (step === 1 && !config.goal) {
            toast.error("Please select an interview goal");
            return;
        }
        if (step === 2 && !config.role) {
            toast.error("Please enter a target role");
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const startInterview = async () => {
        try {
            const res = await axios.post('/api/ai-interview/start', { config });
            if (res.data.success) {
                setSessionId(res.data.data._id);
                setSessionState('live');
                setSimulatedTime(0);
                setTranscript([]);
                setWaitingForNext(false);
                setEvaluationReport(null);
                toast.success("Starting AI Session...");
            }
        } catch (error) {
            console.error("Failed to start session", error);
            toast.error("Failed to start session. Please try again.");
        }
    };

    // --- RENDER HELPERS ---
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    // --- VIEWS ---

    if (sessionState === 'live') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans transition-all duration-500">
                <Navigation />
                <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col items-center justify-center relative">

                    {/* Header Info */}
                    <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                                <img src="/mockeefy.png" alt="AI Bot" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 leading-none">{config.role} Interview</h2>
                                <p className="text-xs text-gray-500 mt-1">{config.goal?.toUpperCase()} • {config.difficulty.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-mono font-medium text-gray-600 shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                {formatTime(simulatedTime)}
                            </div>
                            <button
                                onClick={endSession}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <StopCircle size={16} /> {isSaving ? "Saving..." : "End Session"}
                            </button>
                        </div>
                    </div>

                    {/* CENTRAL AI AVATAR */}
                    <div className="relative flex flex-col items-center justify-center my-12">
                        {/* Pulse Rings */}
                        {(voiceState === 'listening' || voiceState === 'speaking') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 bg-blue-500/5 rounded-full animate-ping opacity-75"></div>
                                <div className="w-48 h-48 bg-blue-500/10 rounded-full animate-ping opacity-50 delay-150"></div>
                            </div>
                        )}

                        {/* Avatar Circle */}
                        <div className={`relative w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-10 overflow-hidden ${voiceState === 'speaking' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110' :
                            voiceState === 'listening' ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-105' :
                                voiceState === 'processing' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                    'bg-white border-4 border-gray-100'
                            }`}>
                            <img src="/mockeefy.png" alt="AI Bot" className="w-full h-full object-cover" />
                        </div>

                        {/* Status Badge + Voice controls */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 relative z-10">
                            <div className="px-6 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-bold uppercase tracking-widest text-[#004fcb]">
                                {voiceState === 'idle' && "Tap the mic to speak your answer"}
                                {voiceState === 'listening' && "Listening… tap again when done"}
                                {voiceState === 'processing' && "Thinking..."}
                                {voiceState === 'speaking' && "AI Speaking..."}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAiVoiceEnabled((v) => !v)}
                                    className={`p-2.5 rounded-xl border transition-all ${aiVoiceEnabled ? 'bg-blue-50 border-blue-200 text-[#004fcb]' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                                    title={aiVoiceEnabled ? 'Turn off AI voice' : 'Turn on AI voice'}
                                >
                                    {aiVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                {transcript.length > 0 && (() => {
                                    const lastAi = [...transcript].reverse().find((m) => m.sender === 'ai');
                                    return lastAi ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setVoiceState('speaking');
                                                speak(lastAi.text).then(() => setVoiceState('idle'));
                                            }}
                                            disabled={voiceState === 'speaking'}
                                            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                                            title="Replay last AI message"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Conversation (read-only, like ChatGPT) */}
                    <div className="w-full max-w-2xl bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-5 min-h-[180px] max-h-[280px] overflow-y-auto">
                        <div className="flex flex-col gap-4">
                            {transcript.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-6">Loading first question...</p>
                            ) : (
                                transcript.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.sender === 'ai' ? 'bg-[#004fcb] text-white' : 'bg-gray-600 text-white'}`}>
                                            {msg.sender === 'ai' ? 'AI' : 'You'}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-900 rounded-tl-none' : 'bg-[#004fcb] text-white rounded-tr-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Voice-only: one big mic (like ChatGPT / Grok voice) */}
                    <div className="w-full max-w-2xl mt-8 flex flex-col items-center gap-4">
                        {isListening && interimTranscript && (
                            <p className="text-sm text-gray-600 max-w-md text-center italic">“{interimTranscript}”</p>
                        )}
                        {speechSupported ? (
                            <button
                                type="button"
                                onClick={handleMicClick}
                                disabled={!canSpeak && !isListening}
                                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening
                                    ? 'bg-red-500 text-white scale-110 animate-pulse'
                                    : canSpeak
                                        ? 'bg-[#004fcb] text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                title={isListening ? 'Tap to stop and send' : 'Tap to speak your answer'}
                            >
                                {isListening ? <MicOff size={36} className="sm:w-10 sm:h-10" /> : <Mic size={36} className="sm:w-10 sm:h-10" />}
                            </button>
                        ) : (
                            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">Voice not supported in this browser. Use Chrome for full experience.</p>
                        )}
                        <p className="text-xs text-gray-500 text-center max-w-sm">
                            {speechSupported ? "Tap once to start speaking, tap again when you're done. No typing — just talk." : ""}
                        </p>
                    </div>

                </main>
            </div>
        );
    }

    if (sessionState === 'completed') {
        const r = evaluationReport;
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <Navigation />
                <main className="flex-1 max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Interview Summary</h1>
                            <p className="text-gray-500 text-sm">Role: {r?.role ?? config.role}</p>
                        </div>
                    </div>

                    {r ? (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Overall Score: {r.overallScore}/10</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Technical</p>
                                        <p className="text-xl font-black text-gray-900">{r.technicalKnowledge}/10</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Communication</p>
                                        <p className="text-xl font-black text-gray-900">{r.communicationClarity}/10</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confidence</p>
                                        <p className="text-xl font-black text-gray-900">{r.confidence}/10</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Problem Solving</p>
                                        <p className="text-xl font-black text-gray-900">{r.problemSolving}/10</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Strengths</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                                        {r.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Weaknesses</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                                        {r.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Improvement Suggestions</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                                        {r.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Recommended Topics to Study</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                                        {r.recommendedTopicsToStudy.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 mb-6">Your session has been saved. Evaluation report could not be generated.</p>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => { setSessionState('config'); setEvaluationReport(null); }}
                            className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <RotateCcw size={18} /> Start New Interview
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-100">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1 w-full">

                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#004fcb]"></span>
                        </span>
                        <span className="text-[#004fcb] font-bold text-xs tracking-widest uppercase">AI Session Builder</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
                        Design Your <span className="text-[#004fcb]">Perfect Interview</span>
                    </h1>
                    <p className="text-gray-500 text-base font-medium">Configure the AI to match your exact career goals.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                    {/* LEFT PANEL: Builder */}
                    <div className="lg:col-span-7">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[450px]">

                            {/* Progress Steps */}
                            <div className="flex items-center gap-3 mb-6">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${step >= s ? "bg-[#004fcb] text-white border-[#004fcb]" : "bg-white text-gray-400 border-gray-200"
                                            }`}>
                                            {s}
                                        </div>
                                        {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? "bg-[#004fcb]" : "bg-gray-200"}`}></div>}
                                    </div>
                                ))}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1">
                                {step === 1 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-gray-900">Choose your objective</h2>
                                            <p className="text-gray-500">What kind of interview are you preparing for today?</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { id: 'hr', icon: <User />, label: "Crack HR Round", desc: "Behavioral & culture fit questions" },
                                                { id: 'technical', icon: <Code2 />, label: "Technical Deep Dive", desc: "Language-specific coding challenges" },
                                                { id: 'system-design', icon: <Layers />, label: "System Design", desc: "Architecture & scalability" },
                                                { id: 'behavioral', icon: <MessageSquare />, label: "Behavioral", desc: "Situation-based responses" },
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setConfig({ ...config, goal: item.id as MockType })}
                                                    className={`p-4 rounded-xl border text-left transition-all duration-300 group relative overflow-hidden ${config.goal === item.id
                                                        ? "bg-blue-50 border-[#004fcb] ring-1 ring-blue-200"
                                                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${config.goal === item.id ? "bg-[#004fcb] text-white" : "bg-blue-50 text-[#004fcb] group-hover:bg-[#004fcb] group-hover:text-white"
                                                        }`}>
                                                        {item.icon}
                                                    </div>
                                                    <h3 className={`text-base font-bold mb-0.5 ${config.goal === item.id ? "text-[#004fcb]" : "text-gray-900"}`}>{item.label}</h3>
                                                    <p className="text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors">{item.desc}</p>

                                                    {config.goal === item.id && (
                                                        <div className="absolute top-4 right-4">
                                                            <CheckCircle2 className="text-[#004fcb] w-5 h-5" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                                        <div className="space-y-1.5">
                                            <h2 className="text-xl font-bold text-gray-900">Role & Experience</h2>
                                            <p className="text-gray-500 text-sm">Help the AI tailor the questions to your level.</p>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Role Input */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Target Role</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        value={config.role}
                                                        onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                                        placeholder="e.g. Senior Frontend Developer"
                                                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#004fcb] transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            {/* Experience Selector */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Years of Experience</label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {['0-1', '1-3', '3-5', '5+'].map((exp) => (
                                                        <button
                                                            key={exp}
                                                            onClick={() => setConfig({ ...config, experience: exp as ExperienceLevel })}
                                                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${config.experience === exp
                                                                ? "bg-[#004fcb] text-white border-[#004fcb] shadow-lg shadow-blue-200"
                                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {exp} Years
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Skills Input */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Key Skills (Press Enter)</label>
                                                <div className="bg-white border border-gray-200 rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#004fcb] transition-all">
                                                    {config.skills.map((skill) => (
                                                        <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-in zoom-in-50 duration-200 border border-blue-100">
                                                            {skill}
                                                            <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><span className="sr-only">Remove</span>&times;</button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        value={skillInput}
                                                        onChange={(e) => setSkillInput(e.target.value)}
                                                        onKeyDown={handleSkillAdd}
                                                        placeholder={config.skills.length === 0 ? "Add skills like React, Node.js..." : ""}
                                                        className="bg-transparent border-none focus:outline-none text-gray-900 py-1.5 px-2 flex-1 min-w-[120px] placeholder:text-gray-400 font-medium"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-[#004fcb]" />
                                                    AI will adapt questions based on these skills
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-gray-900">AI Persona</h2>
                                            <p className="text-gray-500">Configure how the AI should behave during the interview.</p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Difficulty */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                                                    Difficulty Level
                                                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${config.difficulty === 'easy' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                        config.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-red-50 text-red-600 border border-red-100'
                                                        }`}>{config.difficulty}</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0" max="2"
                                                    step="1"
                                                    value={config.difficulty === 'easy' ? 0 : config.difficulty === 'medium' ? 1 : 2}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setConfig({ ...config, difficulty: val === 0 ? 'easy' : val === 1 ? 'medium' : 'hard' });
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#004fcb]"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                                                    <span>Easy</span>
                                                    <span>Medium</span>
                                                    <span>Hard</span>
                                                </div>
                                            </div>

                                            {/* Tone Selection */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Interviewer Tone</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'friendly', label: 'Friendly Mentor', icon: <Brain className="w-4 h-4" /> },
                                                        { id: 'professional', label: 'Real HR', icon: <User className="w-4 h-4" /> },
                                                        { id: 'strict', label: 'Strict Lead', icon: <Zap className="w-4 h-4" /> },
                                                    ].map((tone) => (
                                                        <button
                                                            key={tone.id}
                                                            onClick={() => setConfig({ ...config, tone: tone.id as Tone })}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${config.tone === tone.id
                                                                ? "bg-blue-50 border-[#004fcb] text-[#004fcb]"
                                                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {tone.icon}
                                                            {tone.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Question Depth */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Question Style</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { id: 'concept', label: 'Conceptual' },
                                                        { id: 'scenario', label: 'Scenario Based' },
                                                        { id: 'code', label: 'Hands-on Coding' },
                                                    ].map((d) => (
                                                        <button
                                                            key={d.id}
                                                            onClick={() => setConfig({ ...config, depth: d.id as any })}
                                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${config.depth === d.id
                                                                ? "bg-gray-900 text-white border-gray-900"
                                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            {d.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Actions */}
                            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                                {step > 1 && (
                                    <button
                                        onClick={prevStep}
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                    >
                                        Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button
                                        onClick={nextStep}
                                        className="ml-auto px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={startInterview}
                                        className="ml-auto px-8 py-3 bg-[#004fcb] text-white font-bold text-sm rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 transform hover:scale-105"
                                    >
                                        Start AI Interview <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Preview (5 Cols) */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-200 rounded-3xl p-1 overflow-hidden shadow-xl shadow-blue-50/50">
                                {/* Fake Window Header */}
                                <div className="bg-gray-50 px-5 py-2.5 flex items-center gap-2 border-b border-gray-200">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        AI Active
                                    </div>
                                </div>

                                <div className="p-5 md:p-6 min-h-[350px] flex flex-col relative bg-white">

                                    {/* Background decoration */}
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

                                    {/* AI Avatar */}
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center mb-6 mx-auto relative z-10 overflow-hidden">
                                        <img src="/mockeefy.png" alt="AI Bot" className="w-full h-full object-cover" />
                                    </div>

                                    {/* Chat Bubble */}
                                    <div className="relative z-10 bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-4 shadow-sm">
                                        <p className="text-gray-800 text-lg leading-relaxed font-medium">
                                            "{previewText}<span className="inline-block w-2 h-5 bg-[#004fcb] ml-1 animate-pulse"></span>"
                                        </p>
                                    </div>

                                    {/* Dynamic Tags Preview */}
                                    <div className="mt-auto flex flex-wrap gap-2 justify-center opacity-70">
                                        {config.goal && (
                                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 caption-bottom">
                                                {config.goal.replace('-', ' ').toUpperCase()}
                                            </span>
                                        )}
                                        {config.role && (
                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                                {config.role}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                            {config.difficulty.toUpperCase()}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Tips Card */}
                            <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-[#004fcb]">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 font-bold text-sm">Pro Tip</h4>
                                    <p className="text-gray-500 text-xs mt-1">Add highly specific skills (e.g., "Redux Toolkit" instead of just "Redux") for more targeted questions.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AiInterview;
