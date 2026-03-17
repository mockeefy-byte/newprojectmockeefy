// --- Google Meet Style Components ---

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, Code as CodeIcon,
  Users, MonitorUp, Info, Clock, Copy, MoreVertical, LogOut
} from 'lucide-react';
import { toast } from "sonner";
import { useWebRTC } from '../meeting/hooks/useWebRTC';
import { useSignaling } from '../meeting/hooks/useSignaling';
import { VideoTile } from './meeting/VideoTile';
import { ChatPanel } from './meeting/ChatPanel';
import { CodeEditorPanel } from './meeting/CodeEditorPanel';
import { MeetingSidebar } from './meeting/MeetingSidebar';
import { PreJoinModal } from './meeting/PreJoinModal';
import type { SidebarTab } from './meeting/MeetingSidebar';
import { useAuth } from '../context/AuthContext';

const ActiveMeeting = ({ meetingId, role, userId, onLeave, sessionData }: any) => {
  const [status, setStatus] = useState("Connecting...");
  const [isBothReady, setIsBothReady] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreJoin, setShowPreJoin] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('people');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [participants, setParticipants] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const hasOfferedRef = useRef(false);
  const sendIceCandidateRef = useRef<((candidate: RTCIceCandidateInit) => void) | null>(null);

  const {
    localStream, remoteStream, isMicOn, isCameraOn, initLocalMedia,
    createOffer, handleReceivedOffer, handleReceivedAnswer, handleReceivedIceCandidate,
    toggleMic, toggleCamera, cleanup, resetPeerConnection, connectionState,
    startScreenShare, stopScreenShare
  } = useWebRTC((candidate) => {
    if (sendIceCandidateRef.current) sendIceCandidateRef.current(candidate);
  });

  // Time updater + meeting elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000 * 60);

    const handleBeforeUnload = () => {
      cleanup();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cleanup]);

  useEffect(() => {
    if (!showPreJoin) {
      const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
  }, [showPreJoin]);

  const { sendOffer, sendAnswer, sendIceCandidate, endCall, socket } = useSignaling({
    meetingId,
    role,
    userId,
    onBothReady: () => {
      setIsBothReady(true);
      hasOfferedRef.current = false;
      console.log("[Signaling] Both users ready, initializing connection sequence...");
      setStatus("Connected (Initializing Media...)");
      // Extract names if available
      const remoteName = role === 'expert'
        ? (sessionData?.session?.candidateId?.name || "Candidate")
        : (sessionData?.session?.expertId?.name || "Expert");
      setParticipants(["You", remoteName]);
    },
    onOffer: async ({ sdp }) => {
      if (role === 'candidate') {
        setStatus("Negotiating...");
        const answer = await handleReceivedOffer(sdp);
        if (answer) sendAnswer(answer);
      }
    },
    onAnswer: async ({ sdp }) => {
      if (role === 'expert') await handleReceivedAnswer(sdp);
    },
    onIceCandidate: ({ candidate }) => handleReceivedIceCandidate(candidate),
    onUserLeft: () => {
      setStatus("Partner left. Waiting...");
      setIsBothReady(false);
      resetPeerConnection();
      setParticipants(["You"]);
    },
    onMeetingEnded: () => {
      toast.info("The meeting has ended. You will be redirected.", { duration: 4000 });
      cleanup();
      setTimeout(() => onLeave(), 800);
    },
    isMediaReady: !!localStream
  });

  useEffect(() => { sendIceCandidateRef.current = sendIceCandidate; }, [sendIceCandidate]);

  useEffect(() => {
    if (socket) {
      socket.on("error", (msg: string) => {
        console.error("Socket Error:", msg);
        toast.error(msg);
        if (msg === "Unauthorized" || msg === "Meeting has ended") {
          cleanup();
          onLeave();
        }
      });
    }
  }, [socket, cleanup, onLeave]);

  useEffect(() => {
    initLocalMedia().catch(err => console.error("Media Error", err));
    return () => {
      // Critical: Stop all tracks immediately on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (connectionState === 'connected' || connectionState === 'completed') {
      setStatus("Live");
    } else if (connectionState === 'failed' || connectionState === 'disconnected') {
      setStatus("Connection Lost");
    } else if (connectionState === 'checking') {
      setStatus("Connecting...");
    }
  }, [connectionState]);

  useEffect(() => {
    if (isBothReady && localStream && role === 'expert' && !hasOfferedRef.current) {
      console.log("[ActiveMeeting] Expert triggering offer creation...");
      hasOfferedRef.current = true;
      setStatus("Initiating Peer Connection...");
      createOffer().then(offer => {
        if (offer) {
          console.log("[ActiveMeeting] Offer created and sent");
          sendOffer(offer);
        } else {
          console.error("[ActiveMeeting] Failed to create offer");
          hasOfferedRef.current = false;
        }
      });
    }
  }, [isBothReady, localStream, role, createOffer, sendOffer]);

  const handleEndMeeting = () => {
    if (confirm("End meeting for everyone?")) {
      endCall();
      toast.info("Meeting ended. Redirecting...", { duration: 3000 });
      cleanup();
      setTimeout(() => onLeave(), 500);
    }
  };

  const handleLeave = () => {
    if (confirm("Leave the meeting?")) {
      cleanup();
      onLeave();
    }
  };

  const handleRetryConnection = () => {
    // Show a short info message instead of an endless loading toast
    toast("Retrying connection...", { duration: 2500 });

    resetPeerConnection();

    // Re-trigger offer creation if expert; candidate just waits
    if (role === 'expert') {
      setTimeout(() => {
        hasOfferedRef.current = false;
        setIsBothReady(true); // Re-trigger effect
      }, 500);
    } else {
      setStatus("Waiting for Host to reconnect...");
    }
  };

  // Recording Logic
  const handleToggleRecord = () => {
    if (isRecording) {
      // Stop Recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      toast.success("Recording stopped. Downloading...");
    } else {
      // Start Recording
      const streamToRecord = remoteStream || localStream; // Prefer remote, fallback to local
      if (!streamToRecord) {
        toast.error("No stream to record.");
        return;
      }

      const options = { mimeType: 'video/webm; codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn("VP9 not supported, falling back to default");
        delete (options as any).mimeType;
      }

      try {
        const mediaRecorder = new MediaRecorder(streamToRecord, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `meeting-recording-${new Date().toISOString()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success("Recording started");
      } catch (err) {
        console.error("Recording error:", err);
        toast.error("Failed to start recording");
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
      setIsScreenSharing(false);
    } else {
      const stream = await startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
        // Listen for browser "Stop Sharing" button
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
          setIsScreenSharing(false);
        };
      }
    }
  };

  // Toggle helpers
  const toggleChat = () => {
    setShowChat(!showChat);
    if (showCodeEditor) setShowCodeEditor(false); // Auto close other panel
  };

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor);
    if (showChat) setShowChat(false); // Auto close other panel
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success("Meeting ID copied to clipboard");
  };

  // --- Pre-join modal (audio & video preference) ---
  if (showPreJoin && localStream) {
    return (
      <>
        <PreJoinModal
          localStream={localStream}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onMicToggle={toggleMic}
          onCameraToggle={toggleCamera}
          onContinue={() => setShowPreJoin(false)}
        />
      </>
    );
  }

  // --- Render ---

  return (
    <div className="flex flex-col h-screen min-h-0 w-full max-w-[100vw] bg-[#202124] text-white overflow-hidden font-sans">

      {/* Top Bar: responsive padding + mobile menu to open sidebar */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 z-10 bg-gradient-to-b from-black/50 to-transparent absolute top-0 w-full pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            aria-label="Open menu"
          >
            <Users size={20} />
          </button>
          {sessionData?.session?.startTime && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#303134] px-2 sm:px-3 py-1.5 rounded-md min-w-0">
              <Clock size={14} className="text-gray-300 shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{currentTime}</span>
              <div className="w-px h-4 bg-gray-500 mx-0.5 sm:mx-1 shrink-0 hidden sm:block" />
              <span className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-wider truncate hidden sm:inline">{meetingId.slice(0, 8)}...</span>
              <button onClick={copyMeetingId} className="hover:text-blue-400 transition-colors p-0.5 shrink-0" aria-label="Copy ID">
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-auto" />
      </div>

      {/* Main Content Area: Sidebar | Video | (Code Editor overlay) | Chat */}
      <div className="flex-1 flex overflow-hidden relative mt-0 min-h-0">

        {/* Left: Meeting Sidebar (drawer on mobile, inline on md+) */}
        <MeetingSidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          onEndCall={role === 'expert' ? handleEndMeeting : handleLeave}
          participants={participants}
          role={role}
          elapsedSeconds={elapsedSeconds}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Optional: Code Editor panel (slides in, full width on small) */}
        <div className={`transition-all duration-300 ease-in-out bg-[#1e1e1e] border-r border-gray-800 z-10 ${showCodeEditor ? 'w-full sm:w-[320px] lg:w-[420px] opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
          <CodeEditorPanel isOpen={showCodeEditor} onClose={() => setShowCodeEditor(false)} />
        </div>

        {/* Center: Video Stage - responsive padding and ring */}
        <div className="flex-1 relative flex items-center justify-center bg-[#202124] p-2 sm:p-4 transition-all duration-300 min-w-0 ring-1 ring-[#f97316]/30 rounded-none sm:rounded-lg m-0 sm:m-2 overflow-hidden">

          {/* Grid Layout Logic */}
          <div className={`w-full h-full flex items-center justify-center gap-4 transition-all duration-500 ${remoteStream ? 'grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto' : 'flex'}`}>

            {/* Remote Video (Main Stage if connected) */}
            {remoteStream ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                <VideoTile
                  name={participants[1] || (role === 'expert' ? "Candidate" : "Expert")}
                  stream={remoteStream}
                  isMainTile={true}
                  isSpeaking={status === "Live"}
                  className="w-full h-full"
                />
                <div className={`absolute bottom-4 right-4 backdrop-blur-md px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ${(connectionState === 'connected' || connectionState === 'completed') ? 'bg-green-900/70 text-green-200' : 'bg-black/60 text-gray-200'}`}>
                  {connectionState === 'connected' || connectionState === 'completed' ? 'Connected' : `Connection: ${connectionState}`}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 sm:p-12 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-700 bg-[#303134]/50 max-w-md w-full relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#303134] rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-pulse">
                  <Users size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-2">Waiting for {role === 'expert' ? "Candidate" : "Expert"} to join...</h3>

                {(connectionState === 'failed' || connectionState === 'disconnected') ? (
                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <p className="text-red-400 text-xs sm:text-sm font-medium">Remote connection failed. Video/audio need a direct or relay path between you and the other participant.</p>
                    {import.meta.env.PROD && (
                      <p className="text-amber-200/90 text-[10px] sm:text-xs">
                        For different networks you need your own <strong>TURN</strong> (e.g. Coturn). On the server set <code className="bg-black/30 px-1 rounded">TURN_HOST</code>, <code className="bg-black/30 px-1 rounded">TURN_USERNAME</code>, <code className="bg-black/30 px-1 rounded">TURN_CREDENTIAL</code>. See server/TURN_SETUP.md.
                      </p>
                    )}
                    <button
                      onClick={handleRetryConnection}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">The video stream will start automatically once they connect.</p>
                    {import.meta.env.PROD && (
                      <p className="text-gray-500 text-[10px] sm:text-xs max-w-xs">First load may take up to a minute while the server starts.</p>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 bg-[#202124] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-mono text-blue-400 border border-blue-500/20 mt-3 sm:mt-4">
                  <span>{status}</span>
                </div>
              </div>
            )}

            {/* Local Video - Always visible in grid for now, consistent with modern "Side-by-side" view requests */}
            {(!remoteStream) && localStream && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <VideoTile
                  name="You"
                  stream={localStream}
                  isMainTile={true}
                  muted={true}
                  cameraEnabled={isCameraOn}
                  micEnabled={isMicOn}
                />
              </div>
            )}
          </div>

          {/* If Remote Exists, Local Video Floats Bottom Right - smaller on mobile */}
          {remoteStream && localStream && (
            <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-36 h-28 sm:w-64 sm:aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-2 ring-white/10 z-30 hover:scale-105 transition-transform cursor-grab active:cursor-grabbing">
              <VideoTile
                name="You"
                stream={localStream}
                isMainTile={false}
                muted={true}
                cameraEnabled={isCameraOn}
                micEnabled={isMicOn}
              />
            </div>
          )}

        </div>

        {/* Right Panel: Chat - full width on mobile */}
        {showChat && (
          <div className="absolute sm:relative inset-0 sm:inset-auto w-full sm:w-96 bg-white border-l border-gray-200 z-20 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <ChatPanel onClose={() => setShowChat(false)} />
          </div>
        )}

      </div>

      {/* Bottom Control Bar - responsive: scroll on small, wrap or compact */}
      <div className="h-auto min-h-[72px] sm:h-24 bg-[#202124] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-0 border-t border-gray-800 z-20">

        {/* Left Info - hide or truncate on very small */}
        <div className="hidden sm:flex items-center gap-4 min-w-0 max-w-[180px] lg:max-w-[200px] shrink-0">
          <span className="text-sm font-medium text-gray-300 truncate">
            {sessionData?.session?.topics?.[0] || "Live Interview Session"}
          </span>
        </div>

        {/* Center Controls - horizontal scroll on mobile */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden py-1 min-h-[56px] sm:min-h-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <button
            onClick={toggleMic}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 ${isMicOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-green-400' : 'bg-red-500/90 hover:bg-red-600 text-white'}`}
            title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
          >
            {isMicOn ? <Mic size={20} className="sm:w-[22px] sm:h-[22px]" /> : <MicOff size={20} className="sm:w-[22px] sm:h-[22px]" />}
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">{isMicOn ? 'Mic on' : 'Mic off'}</span>
          </button>

          <button
            onClick={toggleCamera}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 ${isCameraOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-green-400' : 'bg-red-500/90 hover:bg-red-600 text-white'}`}
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Video size={20} className="sm:w-[22px] sm:h-[22px]" /> : <VideoOff size={20} className="sm:w-[22px] sm:h-[22px]" />}
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">{isCameraOn ? 'Cam on' : 'Cam off'}</span>
          </button>

          <div className="w-px h-8 sm:h-10 bg-gray-700 mx-0.5 sm:mx-1 shrink-0 hidden sm:block" />

          <button
            onClick={toggleCodeEditor}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 ${showCodeEditor ? 'bg-[#f97316] text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300'}`}
            title="Code Editor"
          >
            <CodeIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">Code</span>
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 ${isScreenSharing ? 'bg-[#f97316] text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300'}`}
            title={isScreenSharing ? "Stop Presenting" : "Present Screen"}
          >
            <MonitorUp size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleToggleRecord}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300'}`}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
          >
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${isRecording ? 'border-white' : 'border-current'}`}>
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
            </div>
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">Record</span>
          </button>

          <button
            onClick={toggleChat}
            className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 relative ${showChat ? 'bg-[#f97316] text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300'}`}
            title="Chat"
          >
            <MessageSquare size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[9px] sm:text-xs font-medium hidden sm:inline">Chats</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300 transition-all duration-200 min-w-[48px] sm:min-w-[56px] shrink-0 hidden sm:flex"
            title="More options"
          >
            <MoreVertical size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[9px] sm:text-xs font-medium hidden md:inline">More</span>
          </button>

          <div className="w-px h-8 sm:h-10 bg-gray-700 mx-0.5 sm:mx-1 shrink-0 hidden sm:block" />

          {role === 'expert' && (
            <button
              onClick={handleEndMeeting}
              className="flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 hidden sm:flex shrink-0"
              title="End meeting for everyone"
            >
              <PhoneOff size={20} className="sm:w-[22px] sm:h-[22px]" />
              <span className="text-[9px] sm:text-xs font-medium">End</span>
            </button>
          )}

          <button
            onClick={handleLeave}
            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-200 shrink-0"
          >
            <LogOut size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span className="text-[9px] sm:text-xs font-medium">Leave</span>
          </button>
        </div>

        {/* Right Info - hide on small */}
        <div className="hidden sm:flex items-center justify-end gap-2 min-w-0 lg:min-w-[120px] shrink-0">
          <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-400 hover:text-white transition-colors" title="Info">
            <Info size={18} />
          </button>
          <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-400 hover:text-white transition-colors" title="People">
            <Users size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};


// --- Main Page Wrapper ---
export default function LiveMeetingPage() {
  const { sessionId: sessionIdParam } = useParams<{ sessionId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // meetingId: from URL path (/live-meeting/:sessionId), query (?meetingId=), or state (e.g. from MySessions)
  const sessionFromState = (location.state as any)?.session;
  const meetingId =
    sessionIdParam ||
    searchParams.get('meetingId') ||
    sessionFromState?.sessionId ||
    null;
  const role = searchParams.get('role') || (user as any)?.role || (location.state as any)?.role;

  // Business logic: expired only after endTime (e.g. 2:00–2:30 → expire after 2:30, not at 2:00)
  const now = new Date();
  const isSessionEndedOrExpired = sessionFromState && (
    sessionFromState.status === 'Completed' ||
    sessionFromState.status === 'Cancelled' ||
    (sessionFromState.endTime && new Date(sessionFromState.endTime) < now) ||
    (!sessionFromState.endTime && sessionFromState.startTime && new Date(sessionFromState.startTime) < now)
  );

  useEffect(() => {
    if (!meetingId) {
      toast.error("Invalid Meeting ID");
      navigate('/my-sessions', { replace: true });
    }
  }, [meetingId, navigate]);

  useEffect(() => {
    if (isSessionEndedOrExpired) {
      toast.error("This meeting has ended or expired.");
      navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions', { replace: true });
    }
  }, [isSessionEndedOrExpired, navigate, role]);

  if (!meetingId || !user) {
    return (
      <div className="h-screen bg-[#202124] flex items-center justify-center text-white">
        {!user ? "Loading..." : "Invalid meeting link. Redirecting..."}
      </div>
    );
  }

  if (isSessionEndedOrExpired) {
    return (
      <div className="h-screen bg-[#202124] flex items-center justify-center text-white">
        <p className="text-sm">Meeting ended or expired. Redirecting...</p>
      </div>
    );
  }

  // HTTPS / secure context required for getUserMedia and WebRTC in production
  if (import.meta.env.PROD && typeof window !== 'undefined' && !window.isSecureContext) {
    return (
      <div className="h-screen bg-[#202124] flex items-center justify-center p-4">
        <div className="max-w-md rounded-lg bg-amber-900/30 border border-amber-600/50 p-6 text-center">
          <p className="text-amber-200 font-medium mb-2">Video calls require a secure connection</p>
          <p className="text-gray-400 text-sm">Open this page over HTTPS (e.g. https://www.mockeefy.com) to use camera and microphone.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ActiveMeeting
        meetingId={meetingId}
        role={role}
        userId={user.id || user._id || user.userId}
        onLeave={() => navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions')}
        sessionData={location.state}
      />
      {/* <div className="fixed bottom-0 left-0 bg-black/80 text-white p-2 text-xs z-50 pointer-events-none">
      Debug: Role={role} | Meeting={meetingId} | User={user.id || user._id} | Status={status}
    </div> */}
    </>
  );
}
