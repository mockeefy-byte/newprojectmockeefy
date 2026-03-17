// --- Google Meet only: no socket, no WebRTC ---

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Clock, Copy, ExternalLink, HelpCircle, LogOut, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const GoogleMeetOnlyMeeting = ({
  meetingId,
  role,
  onLeave,
  sessionData,
}: {
  meetingId: string;
  role: string;
  onLeave: () => void;
  sessionData: any;
}) => {
  const [localMeetLink, setLocalMeetLink] = useState<string | null>(null);
  const [fetchedMeetingLink, setFetchedMeetingLink] = useState<string | null>(null);
  const [showMeetLinkInput, setShowMeetLinkInput] = useState(false);
  const [meetLinkInputValue, setMeetLinkInputValue] = useState('');
  const [savingMeetLink, setSavingMeetLink] = useState(false);
  const [showMeetHelp, setShowMeetHelp] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  const sessionEndTime = sessionData?.session?.endTime ? new Date(sessionData.session.endTime).getTime() : null;

  useEffect(() => {
    if (!meetingId) return;
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/${meetingId}`);
        const link = res.data?.meetingLink || res.data?.meetLink || null;
        if (link && /meet\.google\.com/i.test(link)) setFetchedMeetingLink(link);
      } catch (_) {}
    };
    fetchSession();
    const interval = setInterval(fetchSession, 20000);
    return () => clearInterval(interval);
  }, [meetingId]);

  useEffect(() => {
    if (!sessionEndTime) return;
    const tick = () => {
      const rem = Math.max(0, Math.floor((sessionEndTime - Date.now()) / 1000));
      setRemainingSeconds(rem);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionEndTime]);

  const googleMeetLink = localMeetLink || fetchedMeetingLink || sessionData?.session?.meetingLink || sessionData?.session?.meetLink;
  const isGoogleMeetUrl = typeof googleMeetLink === 'string' && /meet\.google\.com/i.test(googleMeetLink);

  const handleSaveMeetLink = async () => {
    const link = meetLinkInputValue.trim();
    if (!link || !/meet\.google\.com/i.test(link)) {
      toast.error('Enter a valid Google Meet link (e.g. https://meet.google.com/xxx-xxxx-xxx)');
      return;
    }
    setSavingMeetLink(true);
    try {
      await axios.patch(`/api/sessions/${meetingId}/meeting-link`, { meetingLink: link });
      setLocalMeetLink(link);
      setShowMeetLinkInput(false);
      setMeetLinkInputValue('');
      toast.success('Google Meet link saved. Candidate can open it below.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save link');
    } finally {
      setSavingMeetLink(false);
    }
  };

  const fetchMeetingLinkOnce = async () => {
    if (!meetingId) return;
    try {
      const res = await axios.get(`/api/sessions/${meetingId}`);
      const link = res.data?.meetingLink || res.data?.meetLink || null;
      if (link && /meet\.google\.com/i.test(link)) {
        setFetchedMeetingLink(link);
        toast.success('Meet link loaded. Click "Open in Google Meet" to join.');
      } else {
        toast.info('Expert has not added a Meet link yet. Ask them to add it.');
      }
    } catch (_) {
      toast.error('Could not load Meet link.');
    }
  };

  const handleJoinWithGoogleMeet = () => {
    if (isGoogleMeetUrl && googleMeetLink) {
      window.open(googleMeetLink, '_blank', 'noopener,noreferrer');
      toast.success('Opened Google Meet in a new tab');
    } else {
      window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
      toast.info('Create your meeting, then paste the link above and Save (expert).');
    }
  };

  const handleEndMeeting = async () => {
    if (!confirm(role === 'expert' ? 'End meeting for everyone?' : 'Leave this meeting?')) return;
    setCompleting(true);
    try {
      await axios.post(`/api/sessions/${meetingId}/complete`);
      toast.success(role === 'expert' ? 'Meeting ended.' : 'You left the meeting.');
      onLeave();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to end meeting');
    } finally {
      setCompleting(false);
    }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success('Meeting ID copied');
  };

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#303134] px-3 py-2 rounded-lg">
            <Clock size={18} className="text-gray-400" />
            <span className="font-mono text-sm">{meetingId.slice(0, 20)}...</span>
            <button onClick={copyMeetingId} className="p-1 hover:bg-white/10 rounded" aria-label="Copy">
              <Copy size={14} />
            </button>
          </div>
          {remainingSeconds != null && (
            <span className="text-sm text-gray-400">
              {remainingSeconds <= 0 ? "Time's up" : `Ends in ${formatTimer(remainingSeconds)}`}
            </span>
          )}
        </div>
        <button
          onClick={handleEndMeeting}
          disabled={completing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
        >
          {role === 'expert' ? <PhoneOff size={18} /> : <LogOut size={18} />}
          {role === 'expert' ? 'End meeting' : 'Leave'}
        </button>
      </div>

      {/* Google Meet strip */}
      <div className="rounded-xl bg-[#2d2e31] border border-[#1a73e8]/40 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-6 h-6 text-[#1a73e8]" />
            <span className="text-lg font-semibold">Google Meet</span>
            <button type="button" onClick={() => setShowMeetHelp(true)} className="p-1 rounded text-gray-400 hover:text-white">
              <HelpCircle size={18} />
            </button>
          </div>

          {role === 'expert' ? (
            <>
              {isGoogleMeetUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-green-400">Link saved — candidate can join below.</span>
                  <button type="button" onClick={handleJoinWithGoogleMeet} className="px-4 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium">
                    Open in Google Meet
                  </button>
                  <button type="button" onClick={() => { setShowMeetLinkInput(true); setMeetLinkInputValue(googleMeetLink || ''); }} className="text-sm text-gray-400 hover:text-white">
                    Change link
                  </button>
                </div>
              ) : showMeetLinkInput ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    placeholder="Paste Google Meet link here (https://meet.google.com/xxx-xxxx-xxx)"
                    value={meetLinkInputValue}
                    onChange={(e) => setMeetLinkInputValue(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-[#202124] border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#1a73e8]"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSaveMeetLink} disabled={savingMeetLink} className="px-4 py-3 rounded-lg bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium disabled:opacity-50">
                      {savingMeetLink ? 'Saving...' : 'Save link'}
                    </button>
                    <button type="button" onClick={() => { setShowMeetLinkInput(false); setMeetLinkInputValue(''); }} className="px-4 py-3 rounded-lg bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setShowMeetLinkInput(true)} className="px-4 py-3 rounded-lg bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium">
                    Paste Meet link here
                  </button>
                  <button type="button" onClick={handleJoinWithGoogleMeet} className="px-4 py-3 rounded-lg bg-[#3c4043] hover:bg-[#4a4e51] text-gray-300">
                    Create new Meet
                  </button>
                  <span className="text-sm text-gray-400">Create a meeting, copy the link, then paste above and Save.</span>
                </div>
              )}
            </>
          ) : (
            <>
              {isGoogleMeetUrl ? (
                <button type="button" onClick={handleJoinWithGoogleMeet} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium text-center">
                  Open in Google Meet — Join call
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-400">Waiting for expert to add Meet link.</span>
                  <button type="button" onClick={fetchMeetingLinkOnce} className="px-4 py-2 rounded-lg bg-[#3c4043] hover:bg-[#4a4e51] text-white font-medium">
                    Refresh link
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        This session uses Google Meet only. Open the link above to join the video call in a new tab.
      </p>

      {showMeetHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowMeetHelp(false)}>
          <div className="bg-[#2d2e31] rounded-xl max-w-md w-full p-5 border border-gray-600" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <HelpCircle size={20} className="text-[#1a73e8]" />
              How to use Google Meet
            </h3>
            <div className="text-gray-300 text-sm space-y-3">
              <p><strong className="text-white">Expert:</strong> Click &quot;Paste Meet link here&quot; → create a meeting at meet.google.com/new → copy the link → paste and &quot;Save link&quot;. Then the candidate can open the same link.</p>
              <p><strong className="text-white">Candidate:</strong> Once the expert has saved a link, click &quot;Open in Google Meet — Join call&quot;. If you don’t see it, click &quot;Refresh link&quot;.</p>
            </div>
            <button type="button" onClick={() => setShowMeetHelp(false)} className="mt-4 w-full py-2 rounded-lg bg-[#1a73e8] text-white font-medium">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page wrapper ---
export default function LiveMeetingPage() {
  const { sessionId: sessionIdParam } = useParams<{ sessionId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sessionFromState = (location.state as any)?.session;
  const meetingId = sessionIdParam || searchParams.get('meetingId') || sessionFromState?.sessionId || null;
  const role = searchParams.get('role') || (user as any)?.role || (location.state as any)?.role;

  const now = new Date();
  const isSessionEndedOrExpired = sessionFromState && (
    sessionFromState.status === 'Completed' ||
    sessionFromState.status === 'Cancelled' ||
    (sessionFromState.endTime && new Date(sessionFromState.endTime) < now) ||
    (!sessionFromState.endTime && sessionFromState.startTime && new Date(sessionFromState.startTime) < now)
  );

  useEffect(() => {
    if (!meetingId) {
      toast.error('Invalid Meeting ID');
      navigate('/my-sessions', { replace: true });
    }
  }, [meetingId, navigate]);

  useEffect(() => {
    if (isSessionEndedOrExpired) {
      toast.error('This meeting has ended or expired.');
      navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions', { replace: true });
    }
  }, [isSessionEndedOrExpired, navigate, role]);

  if (!meetingId || !user) {
    return (
      <div className="h-screen bg-[#202124] flex items-center justify-center text-white">
        {!user ? 'Loading...' : 'Invalid meeting link. Redirecting...'}
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

  return (
    <GoogleMeetOnlyMeeting
      meetingId={meetingId}
      role={role}
      onLeave={() => navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions')}
      sessionData={location.state}
    />
  );
}
