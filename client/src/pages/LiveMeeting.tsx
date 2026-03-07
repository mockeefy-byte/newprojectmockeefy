// --- Google Meet Style Components ---

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, Code as CodeIcon,
  Users, MonitorUp, Info, Clock, Copy, MoreVertical
} from 'lucide-react';
import { toast } from "sonner";
import { useWebRTC } from '../meeting/hooks/useWebRTC';
import { useSignaling } from '../meeting/hooks/useSignaling';
import { VideoTile } from './meeting/VideoTile';
import { ChatPanel } from './meeting/ChatPanel';
import { CodeEditorPanel } from './meeting/CodeEditorPanel';
import { useAuth } from '../context/AuthContext';

const ActiveMeeting = ({ meetingId, role, userId, onLeave, sessionData }: any) => {
  const [status, setStatus] = useState("Connecting...");
  const [isBothReady, setIsBothReady] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Time updater
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
      toast.info("Meeting has been ended by the host.");
      cleanup();
      onLeave();
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
      cleanup();
      onLeave();
    }
  };

  const handleLeave = () => {
    if (confirm("Leave the meeting?")) {
      cleanup();
      onLeave();
    }
  };

  const handleRetryConnection = () => {
    toast.loading("Retrying connection...");
    resetPeerConnection();
    // Re-trigger offer creation if expert
    if (role === 'expert') {
      setTimeout(() => {
        hasOfferedRef.current = false;
        setIsBothReady(true); // Re-trigger effect
      }, 500);
    } else {
      // Candidate just waits
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

  // --- Render ---

  return (
    <div className="flex flex-col h-screen w-full bg-[#202124] text-white overflow-hidden font-sans">

      {/* Top Bar (Transparent Overlay) */}
      <div className="h-16 flex items-center justify-between px-6 z-10 bg-gradient-to-b from-black/50 to-transparent absolute top-0 w-full pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          {sessionData?.session?.startTime && (
            <div className="flex items-center gap-2 bg-[#303134] px-3 py-1.5 rounded-md">
              <Clock size={16} className="text-gray-300" />
              <span className="text-sm font-medium">{currentTime}</span>
              <div className="w-px h-4 bg-gray-500 mx-1"></div>
              <span className="text-xs text-gray-400 font-mono tracking-wider">{meetingId.slice(0, 8)}...</span>
              <button onClick={copyMeetingId} className="hover:text-blue-400 transition-colors">
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-auto">
          {/* Recording indicator removed */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative mt-0">

        {/* Left Panel: Code Editor */}
        <div className={`transition-all duration-300 ease-in-out bg-[#1e1e1e] border-r border-gray-800 z-20 ${showCodeEditor ? 'w-[45%] translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}`}>
          <CodeEditorPanel isOpen={showCodeEditor} onClose={() => setShowCodeEditor(false)} />
        </div>

        {/* Center: Video Stage */}
        <div className="flex-1 relative flex items-center justify-center bg-[#202124] p-4 transition-all duration-300">

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
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Remote Connection: {connectionState}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-gray-700 bg-[#303134]/50 max-w-md relative z-10">
                <div className="w-16 h-16 bg-[#303134] rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Waiting for {role === 'expert' ? "Candidate" : "Expert"} to join...</h3>

                {(connectionState === 'failed' || connectionState === 'disconnected') ? (
                  <div className="flex flex-col gap-3 w-full">
                    <p className="text-red-400 text-sm font-medium">Connection failed. Please retry.</p>
                    <button
                      onClick={handleRetryConnection}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-6">The video stream will start automatically once they connect.</p>
                )}

                <div className="flex items-center gap-2 bg-[#202124] px-4 py-2 rounded-lg text-sm font-mono text-blue-400 border border-blue-500/20 mt-4">
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

          {/* If Remote Exists, Local Video Floats Bottom Right (Google Meet style) */}
          {remoteStream && localStream && (
            <div className="absolute bottom-6 right-6 w-64 aspect-video rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-2 ring-white/10 z-30 hover:scale-105 transition-transform cursor-grab active:cursor-grabbing">
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

        {/* Right Panel: Chat */}
        {showChat && (
          <div className="w-96 bg-white border-l border-gray-200 z-20 shadow-2xl animate-in slide-in-from-right duration-300">
            <ChatPanel onClose={() => setShowChat(false)} />
          </div>
        )}

      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-[#202124] flex items-center justify-between px-6 border-t border-gray-800 z-20">

        {/* Left Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <span className="text-sm font-medium text-gray-300 truncate max-w-[200px]">
            {sessionData?.session?.topics?.[0] || "Live Interview Session"}
          </span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all duration-200 ${isMicOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
            title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all duration-200 ${isCameraOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2"></div>

          <button
            onClick={toggleCodeEditor}
            className={`p-4 rounded-full transition-all duration-200 ${showCodeEditor ? 'bg-blue-300 text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
            title="Open Code Editor"
          >
            <CodeIcon size={20} />
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${isScreenSharing ? 'bg-blue-300 text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
            title={isScreenSharing ? "Stop Presenting" : "Present Screen"}
          >
            <MonitorUp size={20} />
          </button>

          <button
            onClick={handleToggleRecord}
            className={`p-4 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isRecording ? 'border-white' : 'border-current'}`}>
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
            </div>
          </button>

          <button
            onClick={toggleChat}
            className={`p-4 rounded-full transition-all duration-200 relative ${showChat ? 'bg-blue-300 text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
            title="Chat with everyone"
          >
            <MessageSquare size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#3c4043] hidden"></span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 rounded-full bg-[#3c4043] hover:bg-[#4a4e51] text-white transition-all duration-200 hidden sm:flex"
            title="More options"
          >
            <MoreVertical size={20} />
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2"></div>

          {role === 'expert' && (
            <button
              onClick={handleEndMeeting}
              className="hidden sm:flex px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium items-center gap-2 transition-all duration-200 mr-2"
              title="End meeting for everyone"
            >
              <PhoneOff size={20} />
              <span className="hidden sm:inline">End</span>
            </button>
          )}

          <button
            onClick={handleLeave}
            className="px-6 py-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-medium flex items-center gap-2 transition-all duration-200"
          >
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="flex items-center justify-end gap-3 min-w-[200px]">
          <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-400 hover:text-white transition-colors">
            <Info size={20} />
          </button>
          <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-400 hover:text-white transition-colors">
            <Users size={20} />
          </button>
        </div>
      </div>

    </div>
  );
};


// --- Main Page Wrapper ---
export default function LiveMeetingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const meetingId = searchParams.get('meetingId');
  const role = searchParams.get('role') || user?.role || location.state?.role;

  // DEBUG: Inspect user object structure
  console.log('[LiveMeeting] Current User Object:', user);

  useEffect(() => {
    if (!meetingId) {
      toast.error("Invalid Meeting ID");
      navigate('/dashboard');
    }
  }, [meetingId, navigate]);

  if (!meetingId || !user) return <div className="h-screen bg-[#202124] flex items-center justify-center text-white">Loading...</div>;

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
