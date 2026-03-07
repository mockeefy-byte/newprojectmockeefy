import { useState, useRef } from 'react';

interface ScreenShareProps {
    onScreenShareStopped: () => void;
}

export const useScreenShare = ({ onScreenShareStopped }: ScreenShareProps) => {
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false // Usually don't share screen audio in meetings unless specifically requested
            });

            screenStreamRef.current = stream;
            setIsScreenSharing(true);

            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            return stream;
        } catch (err) {
            console.error('Error starting screen share:', err);
            return null;
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
        onScreenShareStopped();
    };

    return {
        isScreenSharing,
        startScreenShare,
        stopScreenShare,
        screenStream: screenStreamRef.current
    };
};
