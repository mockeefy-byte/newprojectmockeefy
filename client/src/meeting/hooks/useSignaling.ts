import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../../config';

interface SignalingProps {
    meetingId: string;
    role: string;
    userId: string;
    onBothReady: () => void;
    onOffer: (payload: { sdp: RTCSessionDescriptionInit; caller: string }) => void;
    onAnswer: (payload: { sdp: RTCSessionDescriptionInit; caller: string }) => void;
    onIceCandidate: (payload: { candidate: RTCIceCandidateInit; caller: string }) => void;
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
    isMediaReady,
}: SignalingProps) {
    const socketRef = useRef<Socket | null>(null);
    const [status, setStatus] = useState('Initializing...');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!isMediaReady) {
            setStatus('Waiting for Media to be ready...');
            return;
        }

        const socketServerUrl = SOCKET_URL || API_BASE_URL;
        const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:';
        console.log('[useSignaling] Connecting to', socketServerUrl, '(secure:', isSecure + ')');

        const socketInstance = io(socketServerUrl, {
            query: { userId, meetingId, role },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: import.meta.env.PROD ? 60000 : 20000,
            secure: isSecure,
            withCredentials: true,
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            console.log('[useSignaling] Socket connected, id:', socketInstance.id);
            setStatus('Connected to Signaling Server');
            setSocket(socketInstance);

            const joinPayload = { meetingId, role, userId };
            socketInstance.emit('join-room', joinPayload);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('[useSignaling] Socket disconnected:', reason);
            if (reason === 'io server disconnect') setSocket(null);
        });

        socketInstance.on('both-ready', () => {
            console.log('[useSignaling] Both ready – starting WebRTC');
            onBothReady();
        });

        socketInstance.on('offer', (payload: { sdp: RTCSessionDescriptionInit; caller: string }) => {
            onOffer(payload);
        });

        socketInstance.on('answer', (payload: { sdp: RTCSessionDescriptionInit; caller: string }) => {
            onAnswer(payload);
        });

        socketInstance.on('ice-candidate', (payload: { candidate: RTCIceCandidateInit; caller: string }) => {
            onIceCandidate(payload);
        });

        socketInstance.on('user-left', (leftUserId: string) => {
            onUserLeft(leftUserId);
        });

        socketInstance.on('meeting-ended', (payload?: { meetingId?: string }) => {
            onMeetingEnded();
        });

        socketInstance.on('connect_error', (err) => {
            console.error('[useSignaling] Connect error:', err.message);
            setStatus('Socket error: ' + err.message);
        });

        return () => {
            socketInstance.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, [meetingId, role, userId, isMediaReady]);

    const sendOffer = (sdp: RTCSessionDescriptionInit) => {
        if (socketRef.current) socketRef.current.emit('offer', { meetingId, sdp });
    };

    const sendAnswer = (sdp: RTCSessionDescriptionInit) => {
        if (socketRef.current) socketRef.current.emit('answer', { meetingId, sdp });
    };

    const sendIceCandidate = (candidate: RTCIceCandidateInit) => {
        if (socketRef.current) socketRef.current.emit('ice-candidate', { meetingId, candidate });
    };

    const endCall = () => {
        if (socketRef.current) socketRef.current.emit('end-call', { meetingId });
    };

    return {
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        endCall,
        socket,
        status,
    };
}
