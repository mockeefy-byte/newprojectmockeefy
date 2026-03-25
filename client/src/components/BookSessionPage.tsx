import { useState, useEffect, useMemo, useRef } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";
import {
  Star, MapPin, Clock, Users, Award,
  Calendar, CheckCircle, Shield, Video,
  ChevronLeft, ChevronRight, ChevronDown, X, ThumbsUp, Zap, MessageCircle, Briefcase,
  Share2, Check, Info, ArrowRight, Timer, UserCircle2, BadgeCheck, Code2, Terminal
} from "lucide-react";
import Swal from "sweetalert2";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { mapExpertToProfile, Profile } from "../lib/bookSessionUtils";

/**
 * Enhanced Skeleton Loader matching the LinkedIn-style design
 */
const BookSessionSkeleton = () => (
  <div className="min-h-screen bg-white pb-10">
    <Navigation />
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-8 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gray-200"></div>
          <div className="px-6 pb-6 relative">
            <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-white bg-gray-100 shadow-sm"></div>
            <div className="mt-20 space-y-3">
              <div className="h-8 bg-gray-200 w-64 rounded-lg"></div>
              <div className="h-4 bg-gray-200 w-96 rounded"></div>
              <div className="h-4 bg-gray-200 w-48 rounded"></div>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="h-10 bg-gray-200 w-32 rounded-full"></div>
              <div className="h-10 bg-gray-200 w-32 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Details Content Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="h-6 bg-gray-200 w-48 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-100 rounded-xl"></div>
            <div className="h-24 bg-gray-100 rounded-xl"></div>
            <div className="h-24 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-50 rounded"></div>
            <div className="h-4 w-full bg-gray-50 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-50 rounded"></div>
          </div>
        </div>
      </div>

        {/* Right column placeholder so layout feels consistent */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 w-2/3 rounded mb-6"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
            <div className="mt-8 h-12 bg-gray-200 w-full rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

type PremiumSelectOption = {
  value: string;
  label: string;
};

function PremiumSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: PremiumSelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{selected?.label || "Select option"}</p>
        </div>
        <ChevronDown size={16} className={`text-slate-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{option.label}</p>
                </div>
                {isActive ? <Check className="w-4 h-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BookSessionPage = () => {
  type SessionDuration = 30 | 60;
  const isSessionDuration = (d: unknown): d is SessionDuration => d === 30 || d === 60;

  const [discountCode, setDiscountCode] = useState("");
  const [appliedFreePromo, setAppliedFreePromo] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile: existingProfile, expertId: stateExpertId, price: overridePrice } = location.state || {};
  const queryExpertId = searchParams.get("expertId");

  const expertId = stateExpertId || existingProfile?.id || queryExpertId;
  const [profile, setProfile] = useState<Profile | null>(existingProfile || null);
  const hasInitialProfile = Boolean(existingProfile);

  const sessionPrice = overridePrice ? overridePrice : (profile?.price || 0);
  // Skill (for pricing): expert's skills only; duration 30 or 60; level from expert
  const skillOptions = profile?.skills?.length ? profile.skills : (profile?.category ? [profile.category] : ["General"]);
  const [selectedSkill, setSelectedSkill] = useState<string>(skillOptions[0] || "General");
  const [expertLevel, setExpertLevel] = useState(existingProfile?.level || "Intermediate");
  // Only show durations the expert offers (30 and/or 60)
  const durationOptions = useMemo<SessionDuration[]>(() => {
    const allowed = profile?.availability?.allowedDurations;
    if (Array.isArray(allowed) && allowed.length > 0) return allowed.filter(isSessionDuration);
    const single = profile?.availability?.sessionDuration;
    if (isSessionDuration(single)) return [single];
    return [30];
  }, [profile?.availability?.allowedDurations, profile?.availability?.sessionDuration]);
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(durationOptions[0] ?? 30);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const skillSelectOptions = useMemo<PremiumSelectOption[]>(
    () => skillOptions.map((skill) => ({ value: skill, label: skill })),
    [skillOptions]
  );
  const durationSelectOptions = useMemo<PremiumSelectOption[]>(
    () =>
      durationOptions.map((duration) => ({
        value: String(duration),
        label: `${duration} Minutes`,
      })),
    [durationOptions]
  );

  // Professional category-aware banner images
  const bannerImage = useMemo(() => {
    const category = (profile?.category || "General").toLowerCase();
    const categoryBanners: Record<string, string[]> = {
      it: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
      ],
      hr: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
      ],
      business: [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
      ],
      design: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=80",
      ],
      marketing: [
        "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1400&q=80",
      ],
      finance: [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1400&q=80",
      ],
      ai: [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&w=1400&q=80",
      ],
      general: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
      ],
    };

    const banners = categoryBanners[category] || categoryBanners.general;
    // Use expertId to consistently pick one banner for the same expert
    const charSum = expertId ? expertId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
    return banners[charSum % banners.length];
  }, [expertId, profile?.category]);

  useEffect(() => {
    if (profile?.level) setExpertLevel(profile.level);
    const opts = profile?.skills?.length ? profile.skills : (profile?.category ? [profile.category] : ["General"]);
    if (opts.length && !opts.includes(selectedSkill)) setSelectedSkill(opts[0]);
    const dur = profile?.availability?.allowedDurations?.length ? profile.availability.allowedDurations : (profile?.availability?.sessionDuration ? [profile.availability.sessionDuration] : [30]);
    const validDur = dur.filter(isSessionDuration);
    if (validDur.length && !validDur.includes(sessionDuration)) setSessionDuration(validDur[0]);
  }, [profile]);
  const [loading, setLoading] = useState(!existingProfile);
  const [errorValue, setErrorValue] = useState<string | null>(null);

  useEffect(() => {
    // Always fetch fresh profile data to ensure availability is up-to-date
    if (expertId) {
      const fetchProfile = async () => {
        try {
          // Avoid UI flicker: only show full-page skeleton when we don't already have a profile to render.
          if (!hasInitialProfile) setLoading(true);
          const response = await axios.get("/api/expert/verified");
          if (response.data?.success && response.data?.data) {
            const foundExpert = response.data.data.find((e: any) =>
              e._id === expertId || e.userId === expertId
            );

            if (foundExpert) {
              setProfile(mapExpertToProfile(foundExpert));
            } else {
              setErrorValue("Expert not found");
            }
          } else {
            setErrorValue("Failed to load expert data");
          }
        } catch (err) {
          console.error(err);
          setErrorValue("Error connecting to server");
        } finally {
          if (!hasInitialProfile) setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [expertId, hasInitialProfile]);

  // Price is category-based only (expert's category + level + duration). No skill.
  useEffect(() => {
    const fetchPrice = async () => {
      if (!profile?.id || ![30, 60].includes(sessionDuration)) {
        setCalculatedPrice(0);
        return;
      }
      try {
        const res = await axios.get("/api/pricing/calculate-price", {
          params: { expertId: profile.id, duration: sessionDuration, level: expertLevel }
        });
        if (res.data?.finalPrice != null) {
          setCalculatedPrice(res.data.finalPrice);
        } else {
          setCalculatedPrice(0);
        }
      } catch (err) {
        console.error("Pricing fetch failed", err);
        setCalculatedPrice(0);
      }
    };
    fetchPrice();
  }, [profile?.id, sessionDuration, expertLevel]);


  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(0); // Default to first available date (Today)
  // Better: selectedDate as index is tricky with switching months. 
  // Let's keep selectedDate as index of 'dates' array but reset it on month change.

  const [selectedSlot, setSelectedSlot] = useState<{ time: string; available: boolean } | null>(null);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [expertAvatarError, setExpertAvatarError] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll active date into view on mount or when navigation drawer opens
  useEffect(() => {
    if (carouselRef.current) {
      const activeBtn = carouselRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate, showMobileBooking]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const amount = clientWidth * 0.7;
      carouselRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - amount : scrollLeft + amount,
        behavior: 'smooth'
      });
    }
  };

  const getShareUrl = () => {
    const id = expertId || profile?.id || "";
    if (typeof window === "undefined") return `/book-session?expertId=${encodeURIComponent(id)}`;
    return `${window.location.origin}/book-session?expertId=${encodeURIComponent(id)}`;
  };

  const handleShare = (platform: "whatsapp" | "linkedin" | "x" | "facebook" | "telegram" | "email" | "copy" | "native") => {
    const shareUrl = getShareUrl();
    const text = `Book a mock interview with ${profile?.name || "expert"} on Mockeefy`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

    if (platform === "native") {
      if (navigator.share) {
        navigator.share({ title: "Mockeefy Expert Booking", text, url: shareUrl }).catch(() => {});
      } else {
        handleShare("copy");
      }
      return;
    }

    switch (platform) {
      case "whatsapp":
        open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`);
        break;
      case "linkedin":
        open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
        break;
      case "x":
        open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
        break;
      case "facebook":
        open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
      case "telegram":
        open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`);
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent("Mock Interview Booking")}&body=${encodedText}%0A${encodedUrl}`;
        break;
      case "copy":
      default:
        navigator.clipboard.writeText(shareUrl);
        Swal.fire({ title: "Copied", text: "Booking link copied to clipboard.", icon: "success", timer: 1800, showConfirmButton: false });
        break;
    }
    setIsShareMenuOpen(false);
  };

  // Reviews
  interface Review {
    id: string;
    name: string;
    role: string;
    rating: number;
    comment: string;
    date: string;
    avatar?: string;
    strengths?: string[];
  }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (expertId) {
      const fetchSessions = async () => {
        try {
          const res = await axios.get(`/api/sessions/expert/${expertId}`);
          if (Array.isArray(res.data)) {
            setBookedSessions(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch booked sessions", err);
        }
      };
      fetchSessions();

      const fetchReviews = async () => {
        try {
          setReviewsLoading(true);
          const response = await axios.get(`/api/reviews/expert/${expertId}`);
          if (response.data.success) {
            const formattedReviews = response.data.data.map((r: any) => ({
              ...r,
              date: new Date(r.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
            }));
            setReviews(formattedReviews);
          }
        } catch (error) {
          console.error("Failed to fetch reviews", error);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [expertId]);

  const dates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const allDates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    // Filter out past dates for the current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allDates.filter(date => {
      // If it's a future month, show all days
      if (date.getMonth() > today.getMonth() || date.getFullYear() > today.getFullYear()) return true;
      // If it's current month, show only today onwards
      return date >= today;
    });
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(0);
    setSelectedSlot(null);
  };

  const prevMonth = () => {
    const now = new Date();
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Allow going back only if it's same month or future
    if (prev.getMonth() < now.getMonth() && prev.getFullYear() <= now.getFullYear()) {
      setCurrentMonth(new Date()); // Reset to today
    } else {
      setCurrentMonth(prev);
    }
    setSelectedDate(0);
    setSelectedSlot(null);
  };


  const getAvailableSlots = (dateIndex: number) => {
    if (!profile?.availability) return [];

    const date = dates[dateIndex];
    if (!date) return [];

    const isBreakDate = profile.availability.breakDates?.some((breakDate: any) => {
      const bd = new Date(breakDate.start);
      return bd.toDateString() === date.toDateString();
    });

    if (isBreakDate) return [];

    // Robust Day Matching (mon, Mon, Monday, etc.)
    const weekly = profile.availability.weekly || {};
    const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // mon
    const dayLong = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();   // monday

    const availableKey = Object.keys(weekly).find(key => {
      const k = key.toLowerCase();
      return k === dayShort || k === dayLong;
    });

    const weeklyRanges = availableKey ? weekly[availableKey] : [];

    if (!weeklyRanges || weeklyRanges.length === 0) return [];

    const parseTimeToMinutes = (timeStr: string) => {
      const parts = timeStr.split(':');
      if (parts.length < 2) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    };

    const formatMinutesToTime = (totalMinutes: number) => {
      const adjustedMinutes = totalMinutes % (24 * 60);
      const hours = Math.floor(adjustedMinutes / 60);
      const minutes = adjustedMinutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };


    const generatedSlots: { time: string; available: boolean }[] = [];
    const duration = Number(sessionDuration);
    // Step by 15 min so we get 10:00–10:30, 10:15–10:45, 10:30–11:00 etc. Only past or actually booked slots are unavailable.
    const SLOT_STEP_MINUTES = 15;

    weeklyRanges.forEach((range: { from: string; to: string }) => {
      if (!range.from || !range.to) return;

      let currentMinutes = parseTimeToMinutes(range.from);
      let endMinutes = parseTimeToMinutes(range.to);

      if (endMinutes < currentMinutes) {
        endMinutes += 24 * 60;
      }

      while (currentMinutes + duration <= endMinutes) {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

        // Only hide slots whose start time has already passed (today)
        if (isToday && currentMinutes < currentTimeMinutes) {
          currentMinutes += SLOT_STEP_MINUTES;
          continue;
        }

        const slotStartMinutes = currentMinutes;
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(slotStartMinutes / 60), slotStartMinutes % 60, 0, 0);
        const slotEndMinutes = currentMinutes + duration;
        const slotEndDate = new Date(date);
        slotEndDate.setHours(Math.floor(slotEndMinutes / 60), slotEndMinutes % 60, 0, 0);

        // Only mark booked if a confirmed session overlaps this exact slot on the same day
        const isBooked = bookedSessions.some(session => {
          if (session.status === 'cancelled') return false;
          const sStart = new Date(session.startTime);
          const sEnd = new Date(session.endTime);
          if (isNaN(sStart.getTime()) || isNaN(sEnd.getTime())) return false;
          // Same calendar day only
          if (sStart.toDateString() !== date.toDateString()) return false;
          return slotDate < sEnd && slotEndDate > sStart;
        });

        const slotStart = formatMinutesToTime(currentMinutes);
        const slotEnd = formatMinutesToTime(slotEndMinutes);
        const timeStr = `${slotStart} - ${slotEnd}`;
        const available = !isBooked;

        const existing = generatedSlots.find(s => s.time === timeStr);
        if (existing) {
          existing.available = existing.available || available;
        } else {
          generatedSlots.push({ time: timeStr, available });
        }
        currentMinutes += SLOT_STEP_MINUTES;
      }
    });

    return generatedSlots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const currentSlots = getAvailableSlots(selectedDate);

  const showPaymentPage = () => {
    if (!profile) return;
    navigate("/payment", {
      state: {
        bookingDetails: {
          expertId: expertId,
          expertName: profile.name,
          expertRole: profile.role,
          date: dates[selectedDate],
          slot: selectedSlot,
          price: displayPrice,
          duration: sessionDuration,
          category: profile.category,
          level: expertLevel,
          skill: selectedSkill,
          topics: [selectedSkill]
        }
      }
    });
  };

  const buildFreeBookingPayload = () => {
    const dateStr = dates[selectedDate];
    const slot = selectedSlot;
    if (!dateStr || !slot?.time) return null;
    const dateObj = new Date(dateStr);
    const [startStr] = slot.time.split(" - ");
    const [time, period] = startStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    dateObj.setHours(hours, minutes, 0, 0);
    const startTimeISO = dateObj.toISOString();
    const endTimeISO = new Date(dateObj.getTime() + (sessionDuration || 60) * 60000).toISOString();
    return {
      expertId,
      candidateId: user?.id || user?.userId,
      startTime: startTimeISO,
      endTime: endTimeISO,
      topics: [selectedSkill],
      duration: sessionDuration,
      skill: selectedSkill,
      category: profile?.category,
      notes: "Booked with free promo code",
    };
  };

  const handleFreeBooking = async () => {
    if (!appliedFreePromo || !selectedSlot || !profile) return;
    const payload = buildFreeBookingPayload();
    if (!payload?.candidateId) {
      Swal.fire({ title: "Login required", text: "Please sign in to book a session.", icon: "warning" });
      return;
    }
    if (!payload) {
      Swal.fire({ title: "Error", text: "Invalid date or slot.", icon: "error" });
      return;
    }
    try {
      const res = await axios.post("/api/payment/create-free-booking", { bookingDetails: payload });
      if (res.data?.success) {
        Swal.fire({
          title: "Booked!",
          text: "Your free session has been confirmed. Check My Sessions for details.",
          icon: "success",
          confirmButtonColor: "#004fcb",
        }).then(() => navigate("/my-sessions"));
      } else {
        throw new Error(res.data?.message || "Booking failed");
      }
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err.message || "Failed to confirm free booking.", icon: "error" });
    }
  };

  const handleApplyPromo = () => {
    const code = discountCode.trim().toUpperCase();
    if (code === "FREE100" || code === "MOCKEEFYFREE") {
      setAppliedFreePromo(true);
      Swal.fire({ title: "Applied!", text: "Free session — no payment required. Click Confirm & Book to complete.", icon: "success", timer: 2500 });
    } else {
      Swal.fire({ title: "Invalid", text: "Code not found. Try FREE100 or MOCKEEFYFREE for a free session.", icon: "error" });
    }
  };

  if (!expertId) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <BookSessionSkeleton />;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{errorValue || "Profile Not Found"}</h2>
          <button
            onClick={() => navigate("/book-session")}
            className="px-6 py-3 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (section: string) => {
    const colors: Record<string, string> = {
      "IT": "bg-blue-50 text-[#004fcb] border-blue-100",
      "HR": "bg-purple-50 text-purple-700 border-purple-100",
      "Business": "bg-orange-50 text-orange-700 border-orange-100",
      "Design": "bg-pink-50 text-pink-700 border-pink-100"
    };
    return colors[section] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  const parsePriceToNumber = (value: unknown): number | null => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    // Accept formats like "₹700/hr", "700", "700.00", "INR 700"
    const match = value.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
    if (!match?.[1]) return null;
    const num = Number(match[1]);
    return Number.isFinite(num) ? num : null;
  };

  // Single source for price display — avoids double rupee symbol and handles string prices like "₹700/hr"
  const basePrice = parsePriceToNumber(sessionPrice) ?? 0;
  const displayPrice = calculatedPrice > 0 ? calculatedPrice : basePrice;
  const formatPrice = (amount: number | null | undefined) => {
    if (amount == null || !Number.isFinite(amount)) return "—";
    return `₹${amount}`;
  };

  // LinkedIn-style Profile Header


  const ProfileHeader = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
      {/* Banner */}
      <div className="h-36 md:h-44 relative overflow-hidden">
        <img
          src={bannerImage}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/5" />
        <div className="absolute right-4 bottom-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 border border-white/70">
            {profile.category} Interview Mentor
          </span>
        </div>
        <div className="absolute top-4 right-4 flex gap-2" ref={shareMenuRef}>
          <button
            type="button"
            onClick={() => setIsShareMenuOpen((v) => !v)}
            className="white-glass p-2.5 rounded-full hover:bg-white/40 transition-colors shadow-sm bg-white/20 backdrop-blur-md"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
          {isShareMenuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-20">
              <button onClick={() => handleShare("native")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Share...</button>
              <button onClick={() => handleShare("whatsapp")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">WhatsApp</button>
              <button onClick={() => handleShare("linkedin")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">LinkedIn</button>
              <button onClick={() => handleShare("x")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">X (Twitter)</button>
              <button onClick={() => handleShare("facebook")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Facebook</button>
              <button onClick={() => handleShare("telegram")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Telegram</button>
              <button onClick={() => handleShare("email")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Email</button>
              <button onClick={() => handleShare("copy")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Copy link</button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info Section — single row: avatar + details + price aligned */}
      <div className="px-5 sm:px-6 pb-6 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-5 md:gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0 -mt-14 md:-mt-16">
            <div className="relative inline-block">
              {profile.avatar && !/\/mockeefy\.png$/i.test(profile.avatar) && !expertAvatarError ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white bg-white object-cover shadow-lg shadow-black/5"
                  onError={() => setExpertAvatarError(true)}
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white bg-slate-100 text-slate-700 flex items-center justify-center text-2xl font-bold shadow-lg shadow-black/5">
                  {(profile.name || "E").trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Name, role, location, experience — main block */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5 gap-y-2">
              <div className="inline-flex items-center gap-1.5">
                <UserCircle2 className="w-4 h-4 text-gray-400" />
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  {profile.name}
                </h1>
              </div>
              <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                <span className="text-xs font-bold text-amber-900 tabular-nums">{profile.rating ?? 0}</span>
                <span className="text-[11px] font-semibold text-amber-900/70">({profile.reviews ?? 0})</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 pl-0.5 text-xs text-gray-700 font-semibold leading-snug">
              <Code2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{profile.role}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate max-w-[260px]">{profile.location}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-gray-400 shrink-0" />
                {profile.experience} Experience
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${getCategoryColor(profile.category)}`}>
                <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                {profile.category} Specialist
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Expert
              </span>
            </div>
          </div>

          {/* Price card removed per UX request */}
        </div>
      </div>
    </div>
  );

  // Booking card — used in sidebar (desktop) and mobile sheet
  const BookingCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">Configure Session</h3>
          <p className="text-xs text-gray-500 mt-0.5">Topic, duration, date & time</p>
        </div>
        <button type="button" className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" title="Session info">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Skill, level, duration */}
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Skill / Topic</label>
          <PremiumSelect
            value={selectedSkill}
            options={skillSelectOptions}
            onChange={setSelectedSkill}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Expert Level</label>
            <div className="w-full text-sm font-semibold text-gray-700 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl">
              {expertLevel}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Set by expert</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Duration</label>
            <PremiumSelect
              value={String(durationOptions.includes(sessionDuration) ? sessionDuration : durationOptions[0])}
              options={durationSelectOptions}
              onChange={(value) => {
                const next = Number(value);
                if (isSessionDuration(next)) setSessionDuration(next);
              }}
            />
          </div>
        </div>
      </div>

      {/* Total Amount — session total (not hourly); label matches */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-blue-200 bg-blue-50/80">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-0.5">Total amount</span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-xl sm:text-2xl font-bold tabular-nums ${appliedFreePromo ? "text-green-600" : "text-[#004fcb]"}`}>
              {appliedFreePromo ? "Free" : formatPrice(displayPrice)}
            </span>
            {!appliedFreePromo && (
              <span className="text-xs font-semibold text-gray-600">for {sessionDuration} min · INR</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
            <Timer className="w-3.5 h-3.5" /> {sessionDuration} min
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#004fcb] text-xs font-bold">
            {expertLevel}
          </span>
        </div>
      </div>

      {/* Promo code — free session */}
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Promo code</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. FREE100"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-300"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <button
            type="button"
            onClick={handleApplyPromo}
            className="px-4 py-2.5 bg-blue-50 text-[#004fcb] rounded-xl font-bold text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Apply
          </button>
        </div>
        {appliedFreePromo && (
          <p className="text-green-600 text-xs font-medium mt-2">✓ Free session — no payment. Click Confirm & Book to complete.</p>
        )}
      </div>

      {/* ——— Pick a date ——— */}
      <div className="border-t border-gray-100 pt-4 sm:pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pick a date</p>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="-mx-1">
          <div
            ref={carouselRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {dates.map((date, index) => {
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <button
                  key={index}
                  data-active={selectedDate === index}
                  onClick={() => {
                    setSelectedDate(index);
                    setSelectedSlot(null);
                  }}
                  className={`flex flex-col items-center justify-start pt-3 pb-3 px-4 rounded-xl min-w-[72px] sm:min-w-[80px] transition-all duration-200 shrink-0 snap-center border ${selectedDate === index
                    ? "bg-[#004fcb] border-[#004fcb] text-white shadow-md"
                    : isToday
                      ? "bg-white border-blue-200 text-gray-900 ring-1 ring-blue-100"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                    }`}
                >
                  {isToday ? (
                    <span
                      className={`flex flex-wrap align-bottom text-left mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] ${selectedDate === index ? "bg-white/20 text-white" : "bg-[#004fcb] text-white"}`}
                      style={{ backgroundClip: 'unset', WebkitBackgroundClip: 'unset', backgroundImage: 'none' }}
                    >
                      Today
                    </span>
                  ) : (
                    <span className={`text-[10px] font-semibold uppercase mb-0.5 ${selectedDate === index ? "text-blue-200" : "text-gray-400"}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  )}
                  <span className="text-lg sm:text-xl font-bold leading-none my-0.5 tabular-nums">
                    {date.getDate()}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase ${selectedDate === index ? "text-blue-200" : "text-gray-400"}`}>
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full bg-white shadow-md border border-gray-200 text-[#004fcb] hover:bg-[#004fcb] hover:text-white transition-all"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full bg-white shadow-md border border-gray-200 text-[#004fcb] hover:bg-[#004fcb] hover:text-white transition-all"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ——— Pick a time ——— */}
      <div className="border-t border-gray-100 pt-4 sm:pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pick a time</p>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#004fcb] text-xs font-semibold border border-blue-100">
            {currentSlots.length} slots
          </span>
        </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-[320px] sm:max-h-[380px] lg:max-h-[400px] overflow-y-auto overflow-x-hidden pt-1 pb-3">
        {currentSlots.length > 0 ? (
          currentSlots.map((slot, index) => {
            const isSelected = selectedSlot?.time === slot.time;
            const isUnavailable = slot.available === false;
            const timeParts = (slot.time || "").split(/\s*[-–]\s*/);
            const startRaw = timeParts[0]?.trim() ?? "";
            const endRaw = timeParts[1]?.trim() ?? "";
            const compact = (t: string) => t.replace(/^0(\d)/, "$1");
            const start = compact(startRaw);
            const end = compact(endRaw);
            // Same format for every slot: "1:00–1:30 PM" or "12:00–12:30 AM"
            const timeLabel = (() => {
              if (!start || !end) return slot.time || "—";
              const s = start.match(/^(.+?)\s*(AM|PM)$/i);
              const e = end.match(/^(.+?)\s*(AM|PM)$/i);
              const sTime = s ? s[1]!.trim() : start;
              const eTime = e ? e[1]!.trim() : end;
              const sMer = (s && s[2]) ? s[2].toUpperCase() : (e && e[2]) ? e[2].toUpperCase() : "";
              const eMer = (e && e[2]) ? e[2].toUpperCase() : sMer;
              if (sMer && eMer) {
                return sMer === eMer ? `${sTime}–${eTime} ${eMer}` : `${sTime} ${sMer}–${eTime} ${eMer}`;
              }
              return `${start}–${end}`;
            })();
            return (
              <button
                key={index}
                type="button"
                disabled={isUnavailable}
                onClick={() => setSelectedSlot(slot)}
                className={`group relative flex flex-row items-center justify-center gap-2 w-full min-h-[44px] py-3 px-4 rounded-lg border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#004fcb]/30 focus:ring-offset-1 box-border ${isUnavailable
                  ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-80"
                  : isSelected
                    ? "bg-[#004fcb] border-[#004fcb] text-white shadow-lg shadow-blue-600/20 ring-2 ring-blue-100 ring-offset-1"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#004fcb] hover:bg-blue-50/50 hover:text-[#004fcb] active:scale-[0.98]"
                  }`}
              >
                <span className="flex flex-row items-center justify-center gap-2 flex-1">
                  <Clock className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-100" : "text-gray-500 group-hover:text-[#004fcb]"}`} strokeWidth={2} aria-hidden />
                  <span
                    className={`text-sm font-semibold tracking-tight whitespace-nowrap text-center tabular-nums ${isSelected ? "text-white" : "text-gray-700 group-hover:text-[#004fcb]"}`}
                    title={slot.time}
                  >
                    {timeLabel}
                  </span>
                </span>
                {isUnavailable && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10 bg-gray-50/95" aria-hidden>
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Unavailable
                    </span>
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold mb-1">No slots available</p>
            <p className="text-xs text-gray-500">Try selecting another date or viewing next month</p>
          </div>
        )}
      </div>
      </div>

      {/* Booking Actions */}
      <div className="border-t border-gray-100 pt-5">
        {selectedSlot ? (
          <div className="mb-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Selected Slot</span>
              <button onClick={() => setSelectedSlot(null)} className="text-[#004fcb] text-xs font-bold hover:underline">
                Clear
              </button>
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {dates[selectedDate].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[#004fcb] font-bold text-sm mt-1">
              At {selectedSlot.time}
            </p>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-500 mb-4 px-4">
            Select an available time slot above to continue with your booking.
          </p>
        )}

        <button
          onClick={() => {
            if (!selectedSlot) return;
            if (appliedFreePromo) {
              handleFreeBooking();
            } else {
              showPaymentPage();
            }
          }}
          disabled={!selectedSlot}
          className={`w-full py-3.5 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 group ${selectedSlot
            ? appliedFreePromo
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-900/10 active:scale-[0.99]"
              : "bg-[#004fcb] text-white hover:bg-[#003bb5] shadow-md shadow-blue-900/10 active:scale-[0.99]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {selectedSlot ? (
            <>
              {appliedFreePromo ? "Confirm free booking" : "Confirm & Book"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          ) : (
            "Select a Slot"
          )}
        </button>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Secure 256-bit SSL encrypted payment</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>24-hour cancellation policy applies</span>
          </div>
        </div>
      </div>
    </div>
  );

  const MobileBookingFAB = () => (
    <div className="lg:hidden fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setShowMobileBooking(true)}
        className="flex items-center gap-1.5 px-4 py-3 bg-[#004fcb] text-white rounded-full shadow-lg shadow-blue-900/20 hover:shadow-xl active:scale-95 transition-all font-bold text-sm"
      >
        <Calendar className="w-4 h-4" />
        Book
      </button>
    </div>
  );

  const CareerAdsSection = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
      <div className="px-4 md:px-5 py-3.5 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900">Recommended for you</h4>
      </div>
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 h-full min-h-[164px] flex flex-col">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">Career Boost</p>
          <p className="text-sm font-semibold text-slate-900">Resume Review Add-on</p>
          <p className="text-xs text-slate-600 mt-1">Get targeted edits from experts and improve shortlisting chances.</p>
          <button className="mt-auto pt-3 text-xs font-bold text-blue-700 hover:underline text-left">Learn more</button>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 h-full min-h-[164px] flex flex-col">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1">Interview Prep</p>
          <p className="text-sm font-semibold text-slate-900">Expert Interview Tips</p>
          <p className="text-xs text-slate-600 mt-1">Go through practical tips and frameworks before your live mock interview.</p>
          <button
            type="button"
            onClick={() => navigate("/tips")}
            className="mt-auto pt-3 text-xs font-bold text-emerald-700 hover:underline text-left"
          >
            Open tips
          </button>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 h-full min-h-[164px] flex flex-col">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">New Offer</p>
          <p className="text-sm font-semibold text-slate-900">Bundle & Save</p>
          <p className="text-xs text-slate-600 mt-1">Book 3 sessions together and unlock discount pricing.</p>
          <button className="mt-auto pt-3 text-xs font-bold text-amber-700 hover:underline text-left">View plans</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-white pb-10">
        <Navigation />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-white/80 border border-gray-200 text-gray-600 hover:text-[#004fcb] hover:border-[#004fcb] hover:bg-blue-50 transition-colors text-sm font-semibold shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Main Content Areas */}
            <div className="lg:col-span-8 space-y-5">
              {ProfileHeader()}

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
                <div className="border-b border-gray-200">
                <div className="flex px-3 sm:px-4 gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab("details")}
                    className={`px-4 sm:px-5 py-3 font-extrabold text-xs sm:text-sm transition-all relative rounded-t-xl ${activeTab === "details"
                        ? "text-[#004fcb] bg-blue-50/60 after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#004fcb]"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      About Session
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                    className={`px-4 sm:px-5 py-3 font-extrabold text-xs sm:text-sm transition-all relative rounded-t-xl ${activeTab === "reviews"
                        ? "text-[#004fcb] bg-blue-50/60 after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#004fcb]"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      Reviews & Ratings ({reviews.length})
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  {activeTab === "details" ? (
                    <div className="space-y-7 animate-fadeIn">
                      {/* Session Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#004fcb] border border-gray-100">
                            <Timer className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 tabular-nums">{sessionDuration}m</div>
                            <div className="text-xs text-gray-500 font-semibold">Session duration</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#004fcb] border border-gray-100">
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900">1:1 Video</div>
                            <div className="text-xs text-gray-500 font-semibold">Live interaction</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#004fcb] border border-gray-100">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900">Customized</div>
                            <div className="text-xs text-gray-500 font-semibold">Tailored plan</div>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-gray-400" />
                          Areas of Expertise
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {profile.skills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl text-sm font-bold hover:border-[#004fcb] hover:bg-blue-50/40 transition-colors cursor-default shadow-sm">
                              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                              {skill}
                            </span>
                          ))}
                          {["Mock Interviews", "Technical Round", "Behavioral"].map((label, idx) => (
                            <span key={`extra-${idx}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:border-[#004fcb] hover:bg-blue-50/40 transition-colors cursor-default">
                              <Check className="w-4 h-4 text-green-600 shrink-0" />
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Session Structure */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">Session flow</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          A structured mock interview with clear outcomes—optimized for fast improvements.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { title: "Align goals", desc: "We confirm your target role, seniority, and focus areas." },
                            { title: "Mock interview", desc: "Real questions, realistic pacing, and professional evaluation." },
                            { title: "Feedback & scorecard", desc: "Strengths, gaps, and specific fixes—no generic advice." },
                            { title: "Next steps", desc: "A short action plan + resources to practice right away." }
                          ].map((step, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                              <h5 className="font-bold text-gray-900 text-sm mb-1">{idx + 1}) {step.title}</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits Checklist */}
                      <div className="bg-[#004fcb]/5 p-5 rounded-xl border border-[#004fcb]/10">
                        <h4 className="text-sm font-bold text-[#002a6b] uppercase tracking-wider mb-4">Included in every session</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                          {[
                            "Performance scorecard",
                            "Actionable improvement plan",
                            "Curated question bank",
                            "Session recording",
                            "Resume review tips",
                            "Follow-up email support"
                          ].map((b, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Check className="w-4 h-4 text-green-600 font-bold" />
                              <span className="text-sm font-medium text-gray-700">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Rating Summary Card */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="text-center md:border-r border-gray-200 pr-0 md:pr-10">
                            <div className="text-6xl font-bold text-gray-900 mb-1">{profile.rating}</div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < Math.floor(profile.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <div className="text-sm font-medium text-gray-500">{profile.reviews} total reviews</div>
                          </div>

                          <div className="flex-1 w-full space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-600 w-3">{star}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-yellow-500 h-full rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${star === 5 ? (profile.rating > 4.5 ? 85 : 70) : star === 4 ? 20 : 5}%`
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-400 w-8">
                                  {star === 5 ? '85%' : star === 4 ? '12%' : '1%'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-6">
                        {reviewsLoading ? (
                          <div className="py-14 text-center">
                            <div className="w-10 h-10 border-4 border-[#004fcb]/20 border-t-[#004fcb] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-sm font-medium text-gray-500">Curating client feedback...</p>
                          </div>
                        ) : reviews.length > 0 ? (
                          reviews.map((review) => (
                            <div key={review.id} className="p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 font-bold">
                                  {review.avatar ? (
                                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                  ) : (
                                    review.name.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <div>
                                      <h5 className="font-bold text-gray-900">{review.name}</h5>
                                      <p className="text-xs text-gray-500 font-medium">{review.role}</p>
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1 sm:mt-0">
                                      {review.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-200'}`} />
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed italic">"{review.comment}"</p>

                                  {review.strengths && review.strengths.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {review.strengths.map((s, idx) => (
                                        <span key={idx} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold border border-green-100 uppercase tracking-tighter">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-6 mt-5 border-t border-gray-50 pt-3">
                                    <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#004fcb] transition-colors">
                                      <ThumbsUp className="w-4 h-4" />
                                      Helpful
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-14 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <MessageCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">No reviews yet</h4>
                            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Be the first to share your experience after completing a session.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {CareerAdsSection()}
            </div>

            {/* Sidebar Columns */}
            <div className="hidden lg:block lg:col-span-4 h-fit sticky top-[88px]">
              <div className="space-y-6">
                {BookingCard()}

                {/* Proof Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-gray-900">Why learn from {profile.name.split(' ')[0]}?</h4>
                  </div>
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#004fcb]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Trusted Guidance</p>
                        <p className="text-[11px] text-gray-500">
                          {profile.reviews > 0
                            ? `${profile.reviews}+ reviews with strong learner feedback.`
                            : "Verified mentor profile with structured mock interview approach."}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Fast Response</p>
                        <p className="text-[11px] text-gray-500">
                          {profile.responseTime && profile.responseTime !== "New expert"
                            ? `Typically responds to booking requests within ${profile.responseTime}.`
                            : "New expert profile. Response times may vary by schedule."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {MobileBookingFAB()}

        {/* Mobile Booking Sheet */}
        {showMobileBooking && (
          <div className="lg:hidden fixed inset-0 bg-black/60 z-[60] flex items-end animate-fadeIn">
            <div className="bg-white w-full rounded-t-[24px] sm:rounded-t-[32px] max-h-[90vh] overflow-y-auto animate-slideUp relative pb-10 shadow-2xl shadow-black/20">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-10">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Book Session</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">with {profile.name}</p>
                </div>
                <button onClick={() => setShowMobileBooking(false)} className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shrink-0" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="px-4 py-4 pb-8">
                {BookingCard()}
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .white-glass { background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); }
      `}</style>
    </>
  );
};

export default BookSessionPage;
