import { useEffect, useRef } from 'react';
import { MicOff, VideoOff, VolumeX } from 'lucide-react';

interface VideoTileProps {
    stream: MediaStream | null;
    name: string;
    isMainTile?: boolean;
    muted?: boolean; // Externally controlled mute (local user)
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    isSpeaking?: boolean;
    className?: string; // Allow passing external classes
}

export const VideoTile = ({
    stream,
    name,
    isMainTile = false,
    muted = false,
    micEnabled = true,
    cameraEnabled = true,
    isSpeaking = false,
    className = ""
}: VideoTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative bg-gray-900 overflow-hidden ${isMainTile ? 'rounded-xl' : 'rounded-lg'} ${className} shadow-lg ring-1 ring-white/10 group`}>

            {/* Video Element */}
            {stream && cameraEnabled ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={muted} // Muted prop for local video to prevent echo
                    className={`w-full h-full object-cover transform ${muted ? 'scale-x-[-1]' : ''}`} // Mirror local video
                />
            ) : (
                // Fallback Avatar if camera off or no stream
                <div className="w-full h-full flex items-center justify-center bg-[#303134]">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Speaking Indicator Outline */}
            {isSpeaking && (
                <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none animate-pulse"></div>
            )}

            {/* Name Label */}
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-md text-white/90 text-sm font-medium backdrop-blur-sm flex items-center gap-2 group-hover:bg-black/70 transition-colors">
                <span>{name} {muted ? "(You)" : ""}</span>
                {!micEnabled && <MicOff size={14} className="text-red-400" />}
            </div>

            {/* Status Icons Top Right */}
            <div className="absolute top-3 right-3 flex gap-2">
                {!cameraEnabled && (
                    <div className="bg-black/60 p-1.5 rounded-full backdrop-blur-sm text-red-400">
                        <VideoOff size={16} />
                    </div>
                )}
                {muted && (
                    <div className="bg-black/60 p-1.5 rounded-full backdrop-blur-sm text-gray-400" title="Muted for you">
                        <VolumeX size={16} />
                    </div>
                )}
            </div>
        </div>
    );
};
