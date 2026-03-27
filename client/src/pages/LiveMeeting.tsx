// --- Google Meet only: no socket, no WebRTC ---

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Clock, Copy, ExternalLink, HelpCircle, LogOut, PhoneOff, CheckCircle2, AlertTriangle, Star, X, User, Briefcase, CalendarDays, Timer, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import MockeefyLogo from '../components/MockeefyLogo';

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
  currentUserId,
}: {
  meetingId: string;
  role: string;
  onLeave: () => void;
  sessionData: any;
  currentUserId: string;
}) => {
  const [localMeetLink, setLocalMeetLink] = useState<string | null>(null);
  const [fetchedMeetingLink, setFetchedMeetingLink] = useState<string | null>(null);
  const [resolvedSession, setResolvedSession] = useState<any>(sessionData?.session || null);
  const [loadingSession, setLoadingSession] = useState<boolean>(!sessionData?.session);
  const [expertReviewSubmitted, setExpertReviewSubmitted] = useState(false);
  const [autoClosed, setAutoClosed] = useState(false);
  const onLeaveRef = useRef(onLeave);
  const [showMeetLinkInput, setShowMeetLinkInput] = useState(false);
  const [meetLinkInputValue, setMeetLinkInputValue] = useState('');
  const [savingMeetLink, setSavingMeetLink] = useState(false);
  const [showMeetHelp, setShowMeetHelp] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    technicalRating: 4,
    communicationRating: 4,
    problemSolvingRating: 4,
    confidenceRating: 4,
    strengths: '',
    improvements: '',
    feedback: '',
  });

  const sessionEndTime = resolvedSession?.endTime ? new Date(resolvedSession.endTime).getTime() : null;

  const overallRating = Number((
    (reviewForm.technicalRating +
      reviewForm.communicationRating +
      reviewForm.problemSolvingRating +
      reviewForm.confidenceRating) / 4
  ).toFixed(1));

  const isTimerEnded = remainingSeconds != null && remainingSeconds <= 0;
  const canReviewCandidate = role === 'expert' && isTimerEnded && !expertReviewSubmitted;
  const candidateName = resolvedSession?.candidateDetails?.name || resolvedSession?.candidateName || 'Candidate';

  const fetchReviewStatus = async () => {
    if (!meetingId) return;
    try {
      const res = await axios.get(`/api/sessions/${meetingId}/reviews`);
      setExpertReviewSubmitted(Boolean(res.data?.data?.expertReview));
    } catch (_) { }
  };

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  const playCompletionAlarm = async () => {
    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as any;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const destination = ctx.destination;

      // Short beep pattern using WebAudio (no external audio files required).
      const beepFrequencies = [880, 660, 880];
      const beepCount = beepFrequencies.length;
      const startAt = ctx.currentTime + 0.02;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, startAt);
      masterGain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02);
      masterGain.connect(destination);

      beepFrequencies.forEach((freq: number, i: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, startAt + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.8, startAt + i * 0.22 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + i * 0.22 + 0.16);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt + i * 0.22);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startAt + i * 0.22);
        osc.stop(startAt + i * 0.22 + 0.18);
      });

      const totalMs = Math.ceil(beepCount * 220 + 500);
      window.setTimeout(() => {
        try {
          masterGain.disconnect();
          ctx.close();
        } catch (_) {}
      }, totalMs);
    } catch (_) {
      // Ignore audio errors (autoplay restrictions, unsupported contexts, etc.)
    }

    try {
      if ('vibrate' in navigator) navigator.vibrate([120, 80, 120]);
    } catch (_) {}
  };

  useEffect(() => {
    if (!meetingId) return;
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/${meetingId}`);
        if (res.data) setResolvedSession(res.data);
        const link = res.data?.meetingLink || res.data?.meetLink || null;
        if (link && /meet\.google\.com/i.test(link)) setFetchedMeetingLink(link);
      } catch (_) {}
      finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
    const interval = setInterval(fetchSession, 20000);
    return () => clearInterval(interval);
  }, [meetingId]);

  useEffect(() => {
    fetchReviewStatus();
    const interval = setInterval(fetchReviewStatus, 20000);
    return () => clearInterval(interval);
  }, [meetingId]);

  // Auto-alert + auto-close when the session is completed and expert feedback is available.
  useEffect(() => {
    if (!meetingId) return;
    if (autoClosed) return;
    const status = resolvedSession?.status;
    if (status === 'completed' && expertReviewSubmitted) {
      setAutoClosed(true);
      playCompletionAlarm();
      toast.success('Session completed. Closing meeting...');
      window.setTimeout(() => onLeaveRef.current(), 800);
    }
  }, [meetingId, resolvedSession?.status, expertReviewSubmitted, autoClosed]);

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

  const googleMeetLink = localMeetLink || fetchedMeetingLink || resolvedSession?.meetingLink || resolvedSession?.meetLink || sessionData?.session?.meetingLink || sessionData?.session?.meetLink;
  const isGoogleMeetUrl = typeof googleMeetLink === 'string' && /meet\.google\.com/i.test(googleMeetLink);
  const expertName = resolvedSession?.expertDetails?.name || 'Expert';
  const expertRole = resolvedSession?.expertDetails?.role || 'Interview Expert';
  const expertCompany = resolvedSession?.expertDetails?.company || 'N/A';
  const topicLabel = resolvedSession?.topics?.length ? resolvedSession.topics.join(', ') : 'General Mock Interview';
  const startAt = resolvedSession?.startTime ? new Date(resolvedSession.startTime) : null;
  const endAt = resolvedSession?.endTime ? new Date(resolvedSession.endTime) : null;
  const durationMins = startAt && endAt ? Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60000)) : null;

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

  const handleSubmitCandidateReview = async () => {
    if (!resolvedSession?.candidateId || !resolvedSession?.expertId) {
      toast.error('Session participant details missing. Please refresh and try again.');
      return;
    }

    if (!reviewForm.feedback.trim()) {
      toast.error('Please add detailed feedback before submitting.');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(`/api/sessions/${meetingId}/review`, {
        overallRating,
        technicalRating: reviewForm.technicalRating,
        communicationRating: reviewForm.communicationRating,
        feedback: `${reviewForm.feedback.trim()} \n\nAdditional Scores:\n- Problem Solving: ${reviewForm.problemSolvingRating}/5\n- Confidence: ${reviewForm.confidenceRating}/5`,
        strengths: reviewForm.strengths.split(',').map((s) => s.trim()).filter(Boolean),
        weaknesses: reviewForm.improvements.split(',').map((s) => s.trim()).filter(Boolean),
        expertId: resolvedSession.expertId || currentUserId,
        candidateId: resolvedSession.candidateId,
        reviewerRole: 'expert',
      });

      setExpertReviewSubmitted(true);
      setShowReviewModal(false);
      toast.success('Candidate review submitted successfully.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderRating = (
    label: string,
    value: number,
    onChange: (value: number) => void
  ) => (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={`${label}-${star}`}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-transform hover:scale-110 ${star <= value ? 'text-amber-400' : 'text-slate-300'}`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-1">{value}/5</span>
      </div>
    </div>
  );

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success('Meeting ID copied');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MockeefyLogo className="w-11 h-11 shrink-0" />
                <div>
                  <p className="text-xs font-black tracking-wide uppercase text-slate-400">Mockeefy Live Session</p>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">Google Meet Interview Room</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center gap-3 min-h-[220px]">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">Loading interview details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MockeefyLogo className="w-11 h-11 shrink-0" />
              <div>
                <p className="text-xs font-black tracking-wide uppercase text-slate-400">Mockeefy Live Session</p>
                <h1 className="text-base sm:text-lg font-bold text-slate-900">Google Meet Interview Room</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLeave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                <ChevronLeft size={14} />
                Back
              </button>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-blue-50 border border-blue-200 text-blue-700">
                {role || 'participant'}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                <Clock size={16} className="text-slate-500" />
                <span className="font-mono text-sm text-slate-700">Meeting: {meetingId.slice(0, 20)}...</span>
                <button onClick={copyMeetingId} className="p-1 hover:bg-slate-200 rounded" aria-label="Copy">
                  <Copy size={14} />
                </button>
              </div>
              {remainingSeconds != null && (
                <span className="text-sm text-slate-600 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                  {remainingSeconds <= 0 ? "Time's up" : `Ends in ${formatTimer(remainingSeconds)}`}
                </span>
              )}
            </div>
            <button
              onClick={handleEndMeeting}
              disabled={completing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-sm font-medium text-white"
            >
              {role === 'expert' ? <PhoneOff size={18} /> : <LogOut size={18} />}
              {role === 'expert' ? 'End meeting' : 'Leave'}
            </button>
          </div>
        </div>

        {isTimerEnded && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 animate-pulse">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={18} />
                <span className="text-sm font-semibold">Session timer ended. Please close the call and submit candidate feedback.</span>
              </div>
              {canReviewCandidate && (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
                >
                  Review Candidate
                </button>
              )}
              {role === 'expert' && expertReviewSubmitted && (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Candidate review submitted
                </span>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Interview Details</h2>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              Session ID: {meetingId}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <CalendarDays size={14} />
                <span className="text-xs font-semibold">Date</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{startAt ? startAt.toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock size={14} />
                <span className="text-xs font-semibold">Time</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {startAt ? startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                {' - '}
                {endAt ? endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Timer size={14} />
                <span className="text-xs font-semibold">Duration</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{durationMins ? `${durationMins} mins` : 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Briefcase size={14} />
                <span className="text-xs font-semibold">Topic</span>
              </div>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{topicLabel}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={15} className="text-blue-700" />
                <p className="text-xs font-black tracking-wide uppercase text-blue-700">Candidate</p>
              </div>
              <p className="text-sm font-bold text-slate-900">{candidateName}</p>
              <p className="text-xs text-slate-600 mt-1">{resolvedSession?.candidateDetails?.email || 'Email not available'}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={15} className="text-emerald-700" />
                <p className="text-xs font-black tracking-wide uppercase text-emerald-700">Expert</p>
              </div>
              <p className="text-sm font-bold text-slate-900">{expertName}</p>
              <p className="text-xs text-slate-600 mt-1">{expertRole} {expertCompany !== 'N/A' ? `- ${expertCompany}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Google Meet section */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900">Google Meet</span>
              <button type="button" onClick={() => setShowMeetHelp(true)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <HelpCircle size={18} />
              </button>
            </div>

            {role === 'expert' ? (
              <>
                {isGoogleMeetUrl ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">Link saved. Candidate can join now.</span>
                    <button type="button" onClick={handleJoinWithGoogleMeet} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      Open in Google Meet
                    </button>
                    <button type="button" onClick={() => { setShowMeetLinkInput(true); setMeetLinkInputValue(googleMeetLink || ''); }} className="text-sm text-slate-500 hover:text-slate-900">
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
                      className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSaveMeetLink} disabled={savingMeetLink} className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50">
                        {savingMeetLink ? 'Saving...' : 'Save link'}
                      </button>
                      <button type="button" onClick={() => { setShowMeetLinkInput(false); setMeetLinkInputValue(''); }} className="px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => setShowMeetLinkInput(true)} className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      Paste Meet link
                    </button>
                    <button type="button" onClick={handleJoinWithGoogleMeet} className="px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">
                      Create new Meet
                    </button>
                    <span className="text-sm text-slate-500">Create a meeting, copy the link, then paste and save it here.</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {isGoogleMeetUrl ? (
                  <button type="button" onClick={handleJoinWithGoogleMeet} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-center">
                    Open in Google Meet and Join
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-600">Waiting for expert to add Meet link.</span>
                    <button type="button" onClick={fetchMeetingLinkOnce} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200">
                      Refresh link
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            This session uses Google Meet only. Open the link above to join the video call in a new tab.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">Quick Instructions</h3>
          <div className="space-y-2.5 text-sm text-slate-600">
            {role === 'expert' ? (
              <>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />Create a Google Meet link and save it here before interview starts.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />Use "Open in Google Meet" to verify your mic/camera setup.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />End the meeting only after the interview is fully completed.</p>
              </>
            ) : (
              <>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />Wait for the expert to share a Google Meet link.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />Click "Open in Google Meet and Join" once the button appears.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />Keep this page open for session timer and controls.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Candidate Review</h3>
                <p className="text-xs text-slate-500">Session feedback for {candidateName}</p>
              </div>
              <button type="button" onClick={() => setShowReviewModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {renderRating('Technical Skills', reviewForm.technicalRating, (v) => setReviewForm((f) => ({ ...f, technicalRating: v })))}
                {renderRating('Communication', reviewForm.communicationRating, (v) => setReviewForm((f) => ({ ...f, communicationRating: v })))}
                {renderRating('Problem Solving', reviewForm.problemSolvingRating, (v) => setReviewForm((f) => ({ ...f, problemSolvingRating: v })))}
                {renderRating('Confidence', reviewForm.confidenceRating, (v) => setReviewForm((f) => ({ ...f, confidenceRating: v })))}
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Overall score (auto-calculated): <strong>{overallRating}/5</strong>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Strengths (comma separated)</label>
                <input
                  value={reviewForm.strengths}
                  onChange={(e) => setReviewForm((f) => ({ ...f, strengths: e.target.value }))}
                  placeholder="Example: Clear fundamentals, Good debugging, Structured approach"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Areas for Improvement (comma separated)</label>
                <input
                  value={reviewForm.improvements}
                  onChange={(e) => setReviewForm((f) => ({ ...f, improvements: e.target.value }))}
                  placeholder="Example: Time management, Better edge-case handling"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Detailed Feedback</label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm((f) => ({ ...f, feedback: e.target.value }))}
                  placeholder="Summarize interview performance, strengths, and next steps."
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCandidateReview}
                disabled={submittingReview}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              >
                {submittingReview ? 'Submitting...' : 'Submit Candidate Review'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showMeetHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45" onClick={() => setShowMeetHelp(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
              <HelpCircle size={20} className="text-blue-600" />
              How to use Google Meet
            </h3>
            <div className="text-slate-600 text-sm space-y-3">
              <p><strong className="text-slate-900">Expert:</strong> Click &quot;Paste Meet link&quot;, create a meeting at meet.google.com/new, copy the link, then paste and save.</p>
              <p><strong className="text-slate-900">Candidate:</strong> Once the expert has saved a link, click &quot;Open in Google Meet and Join&quot;. If you don’t see it, click &quot;Refresh link&quot;.</p>
            </div>
            <button type="button" onClick={() => setShowMeetHelp(false)} className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Got it</button>
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

  const playCompletionAlarm = () => {
    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as any;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
      window.setTimeout(() => {
        try { ctx.close(); } catch (_) {}
      }, 400);
    } catch (_) {}

    try {
      if ('vibrate' in navigator) navigator.vibrate([120, 80, 120]);
    } catch (_) {}
  };

  useEffect(() => {
    if (!meetingId) {
      toast.error('Invalid Meeting ID');
      navigate('/my-sessions', { replace: true });
    }
  }, [meetingId, navigate]);

  useEffect(() => {
    if (isSessionEndedOrExpired) {
      toast.error('This meeting has ended or expired.');
      playCompletionAlarm();
      navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions', { replace: true });
    }
  }, [isSessionEndedOrExpired, navigate, role]);

  if (!meetingId || !user) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        {!user ? 'Loading...' : 'Invalid meeting link. Redirecting...'}
      </div>
    );
  }

  if (isSessionEndedOrExpired) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center text-slate-700">
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
      currentUserId={(user as any)?.id || (user as any)?._id || ''}
    />
  );
}
