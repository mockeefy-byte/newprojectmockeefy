import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Info } from 'lucide-react';

interface PreJoinModalProps {
  localStream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  onMicToggle: () => void;
  onCameraToggle: () => void;
  onContinue: () => void;
  onClose?: () => void;
}

export function PreJoinModal({
  localStream,
  isMicOn,
  isCameraOn,
  onMicToggle,
  onCameraToggle,
  onContinue,
  onClose,
}: PreJoinModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [hdResolution, setHdResolution] = useState(false);
  const [mirrorVideo, setMirrorVideo] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
        setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
        if (devices.length > 0 && !selectedMicId) {
          const mic = devices.find((d) => d.kind === 'audioinput');
          const cam = devices.find((d) => d.kind === 'videoinput');
          if (mic) setSelectedMicId(mic.deviceId);
          if (cam) setSelectedCameraId(cam.deviceId);
        }
      } catch (e) {
        console.warn('Device enumeration failed', e);
      }
    };
    getDevices();
  }, [selectedMicId, selectedCameraId]);

  // Simple audio level meter
  useEffect(() => {
    if (!localStream || !isMicOn) {
      setAudioLevel(0);
      return;
    }
    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(localStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100));
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
      return () => {
        cancelAnimationFrame(animationRef.current);
        audioContext.close();
      };
    } catch {
      setAudioLevel(0);
    }
  }, [localStream, isMicOn]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
            Select your audio & video preference
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Audio & Video sections - stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Audio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Audio</span>
              <button
                type="button"
                role="switch"
                aria-checked={isMicOn}
                onClick={onMicToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isMicOn ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isMicOn ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <select
              value={selectedMicId}
              onChange={(e) => setSelectedMicId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {audioDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isMicOn ? (
                <Mic className="w-4 h-4 text-green-600" />
              ) : (
                <MicOff className="w-4 h-4 text-gray-400" />
              )}
              <span>{isMicOn ? 'Your audio is switched ON' : 'Your audio is switched OFF'}</span>
            </div>
            <div className="flex gap-0.5 h-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-colors ${
                    (audioLevel / 100) * 12 > i ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Video */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Video</span>
              <button
                type="button"
                role="switch"
                aria-checked={isCameraOn}
                onClick={onCameraToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isCameraOn ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isCameraOn ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <div className="aspect-video max-h-[200px] sm:max-h-none bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden relative">
              {localStream && isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${mirrorVideo ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <VideoOff className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hdResolution}
                  onChange={(e) => setHdResolution(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span>HD resolution</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mirrorVideo}
                  onChange={(e) => setMirrorVideo(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span>Mirror my video</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex justify-center shrink-0">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
