import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

// Default STUN servers as fallback
const DEFAULT_ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
];

export function useWebRTC(onIceCandidateSend: (candidate: RTCIceCandidate) => void) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [connectionState, setConnectionState] = useState<RTCIceConnectionState>('new');
    const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
    const [isIceLoaded, setIsIceLoaded] = useState(false);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const candidateQueue = useRef<RTCIceCandidateInit[]>([]);

    // 0. Fetch TURN Credentials
    useEffect(() => {
        const fetchIceServers = async () => {
            try {
                // Check if we already have them or if env is missing
                // Ideally this endpoint should always return an array
                const res = await axios.get('/api/meetings/turn-credentials');
                if (Array.isArray(res.data)) {
                    console.log("[WebRTC] Loaded TURN servers:", res.data.length);
                    setIceServers(res.data);
                } else {
                    console.warn("[WebRTC] Invalid TURN format, using defaults");
                    setIceServers(DEFAULT_ICE_SERVERS);
                }
            } catch (error) {
                console.error("[WebRTC] Failed to fetch TURN credentials, using defaults", error);
                setIceServers(DEFAULT_ICE_SERVERS);
            } finally {
                setIsIceLoaded(true);
            }
        };
        fetchIceServers();
    }, []);

    // 1. Initialize Local Media
    const initLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            setIsMicOn(true);
            setIsCameraOn(true);
            // Ensure tracks are enabled initially
            stream.getAudioTracks().forEach(t => t.enabled = true);
            stream.getVideoTracks().forEach(t => t.enabled = true);
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            return null;
        }
    }, []);

    // 2. Initialize PeerConnection (Singleton)
    const getOrCreatePeerConnection = useCallback(() => {
        if (!isIceLoaded) {
            console.warn("[WebRTC] Skipping PC creation - ICE servers not loaded");
            return null;
        }

        if (pcRef.current && pcRef.current.signalingState !== 'closed') {
            return pcRef.current;
        }

        console.log("[WebRTC] Creating RTCPeerConnection with servers", iceServers);

        const pc = new RTCPeerConnection({
            iceServers: iceServers,
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            iceCandidatePoolSize: 10
        });

        // ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidateSend(event.candidate);
            }
        };

        // Remote Track Handling
        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        // Monitor Connection State
        pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE State Change:', pc.iceConnectionState);
            setConnectionState(pc.iceConnectionState);

            if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
                console.warn('[WebRTC] Connection unstable or failed.');
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection State Change:', pc.connectionState);
        };

        pcRef.current = pc;
        return pc;
    }, [isIceLoaded, iceServers, onIceCandidateSend]);

    // Helper: Add Tracks to PC
    const addLocalTracksToPC = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
        stream.getTracks().forEach((track) => {
            // Check if track already exists to avoid duplication
            const senders = pc.getSenders();
            const exists = senders.some(s => s.track === track);
            if (!exists) {
                pc.addTrack(track, stream);
            }
        });
    }, []);

    // 3. Expert: Create Offer
    const createOffer = useCallback(async () => {
        const pc = getOrCreatePeerConnection();
        if (!pc) return null;

        // Reliability: Create Data Channel
        const dc = pc.createDataChannel("chat");
        dc.onopen = () => { };

        if (localStream) {
            addLocalTracksToPC(pc, localStream);
        } else {
            console.warn("Creating offer with NO local stream (Receive Only)");
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });
        }

        try {
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
                iceRestart: true
            });

            await pc.setLocalDescription(offer);
            return offer;
        } catch (error) {
            console.error("Error creating offer:", error);
            return null;
        }
    }, [localStream, getOrCreatePeerConnection, addLocalTracksToPC]);

    // 4. Candidate: Handle Offer & Create Answer
    const handleReceivedOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        const pc = getOrCreatePeerConnection();
        if (!pc) return null;

        if (localStream) {
            addLocalTracksToPC(pc, localStream);
        } else {
            console.warn("Handling offer with NO local stream - adding recvonly transceivers");
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Process Queued Candidates
            while (candidateQueue.current.length > 0) {
                const c = candidateQueue.current.shift();
                if (c) await pc.addIceCandidate(new RTCIceCandidate(c));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            return answer;
        } catch (error) {
            console.error("Error handling offer:", error);
            return null;
        }
    }, [localStream, getOrCreatePeerConnection, addLocalTracksToPC]);

    // 5. Expert: Handle Answer
    const handleReceivedAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = pcRef.current;
        if (!pc) return;

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Process Queued Candidates (Rare for answer side but good practice)
            while (candidateQueue.current.length > 0) {
                const c = candidateQueue.current.shift();
                if (c) await pc.addIceCandidate(new RTCIceCandidate(c));
            }
        } catch (error) {
            console.error("Error handling answer:", error);
        }
    }, []);

    // 6. Handle ICE Candidate
    const handleReceivedIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = pcRef.current;
        if (!pc) {
            // Queue if PC not created yet
            candidateQueue.current.push(candidate);
            return;
        }

        try {
            if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                candidateQueue.current.push(candidate);
            }
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }, []);

    // 7. Toggle Logic (Enabled/Disabled)
    const toggleMic = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    }, [localStream]);

    // Track stream in ref for cleanup access
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setRemoteStream(null);
        // Clear candidates
        candidateQueue.current = [];
    }, []);

    const resetPeerConnection = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setRemoteStream(null);
        candidateQueue.current = [];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const stopScreenShare = useCallback(async () => {
        try {
            // Re-acquire camera
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const videoTrack = cameraStream.getVideoTracks()[0];

            if (localStream && pcRef.current) {
                const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(videoTrack);
                }

                // Restore local stream
                setLocalStream(cameraStream);

                // Ensure mic/camera state is respected
                if (!isMicOn) cameraStream.getAudioTracks().forEach(t => t.enabled = false);
                if (!isCameraOn) cameraStream.getVideoTracks().forEach(t => t.enabled = false);
            }
        } catch (error) {
            console.error("Error stopping screen share:", error);
        }
    }, [localStream, isMicOn, isCameraOn]);

    // 8. Screen Share Logic
    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            if (localStream && pcRef.current) {
                const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                }

                // Update local stream to show screen share locally
                const newStream = new MediaStream([screenTrack, ...localStream.getAudioTracks()]);
                setLocalStream(newStream);

                // Handle screen share stop (user clicks browser "Stop Sharing")
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            }
            return screenStream;
        } catch (error) {
            console.error("Error starting screen share:", error);
            return null;
        }
    }, [localStream, stopScreenShare]);

    return {
        localStream,
        remoteStream,
        isMicOn,
        isCameraOn,
        initLocalMedia,
        createOffer,
        handleReceivedOffer,
        handleReceivedAnswer,
        handleReceivedIceCandidate,
        toggleMic,
        toggleCamera,
        startScreenShare,
        stopScreenShare,
        cleanup,
        resetPeerConnection,
        connectionState
    };
}
