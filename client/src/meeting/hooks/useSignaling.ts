import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../config';

interface SignalingProps {
    meetingId: string;
    role: string;
    userId: string;
    onBothReady: () => void;
    onOffer: (payload: { sdp: RTCSessionDescriptionInit, caller: string }) => void;
    onAnswer: (payload: { sdp: RTCSessionDescriptionInit, caller: string }) => void;
    onIceCandidate: (payload: { candidate: RTCIceCandidateInit, caller: string }) => void;
    onUserLeft: (userId: string) => void;
    onMeetingEnded: () => void;
    isMediaReady: boolean;
}

export function useSignaling({
    meetingId,
    role,
    userId,
    onBothReady,
    onOffer,
    onAnswer,
    onIceCandidate,
    onUserLeft,
    onMeetingEnded,
    isMediaReady
}: SignalingProps) {
    const socketRef = useRef<Socket | null>(null);
    const [status, setStatus] = useState("Initializing...");

    useEffect(() => {
        // Only connect if media is ready (stream obtained)
        if (!isMediaReady) {
            setStatus("Waiting for Media to be ready...");
            return;
        }

        console.log(`[useSignaling] Connecting to socket at: ${API_BASE_URL}`);

        const socket = io(API_BASE_URL, {
            query: { userId, meetingId },
            transports: ['websocket', 'polling'], // Prioritize websocket
            // reconnectionAttempts: 5, // Default is usually fine
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(`[useSignaling] ✅ SOCKET CONNECTED. ID: ${socket.id}`);
            setStatus("Connected to Signaling Server");

            // Join Room
            const joinPayload = { meetingId, role, userId };
            console.log("[useSignaling] Joining room:", joinPayload);
            socket.emit("join-room", joinPayload);
        });

        socket.on("both-ready", () => {
            console.log("[useSignaling] Received 'both-ready' event!");
            onBothReady();
        });

        socket.on("offer", (payload) => {
            console.log("[useSignaling] Received offer");
            onOffer(payload);
        });

        socket.on("answer", (payload) => {
            console.log("[useSignaling] Received answer");
            onAnswer(payload);
        });

        socket.on("ice-candidate", (payload) => {
            // console.log("[useSignaling] Received ICE candidate"); // verbose
            onIceCandidate(payload);
        });

        socket.on("user-left", (leftUserId) => {
            console.log(`[useSignaling] User left: ${leftUserId}`);
            onUserLeft(leftUserId);
        });

        socket.on("meeting-ended", () => {
            console.log("Meeting ended by host");
            onMeetingEnded();
        });

        socket.on("connect_error", (err) => {
            console.error("[useSignaling] Connection Error:", err.message);
            setStatus(`Socket Error: ${err.message}`);
        });

        return () => {
            console.log("[useSignaling] Disconnecting socket...");
            socket.disconnect();
            socketRef.current = null;
        };

    }, [meetingId, role, userId, isMediaReady]); // Critical: Re-run if these change, but mostly if media becomes ready.

    // Helper functions to send signals
    const sendOffer = (sdp: RTCSessionDescriptionInit) => {
        if (socketRef.current) socketRef.current.emit("offer", { meetingId, sdp });
    };

    const sendAnswer = (sdp: RTCSessionDescriptionInit) => {
        if (socketRef.current) socketRef.current.emit("answer", { meetingId, sdp });
    };

    const sendIceCandidate = (candidate: RTCIceCandidateInit) => {
        if (socketRef.current) socketRef.current.emit("ice-candidate", { meetingId, candidate });
    };

    const endCall = () => {
        if (socketRef.current) socketRef.current.emit("end-call", { meetingId });
    };

    return {
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        endCall,
        socket: socketRef.current
    };
}
