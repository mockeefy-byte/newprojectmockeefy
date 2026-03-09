import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import {
  Star, MapPin, Clock, Users, Award,
  Calendar, CheckCircle, CreditCard, Shield, Video,
  ChevronLeft, ChevronRight, X, ThumbsUp, Zap, MessageCircle, Briefcase,
  Share2, Check, Info, ArrowRight, Timer
} from "lucide-react";
import Swal from "sweetalert2";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { mapExpertToProfile, Profile } from "../lib/bookSessionUtils";

/**
 * Enhanced Skeleton Loader matching the LinkedIn-style design
 */
const BookSessionSkeleton = () => (
  <div className="min-h-screen bg-[#f3f2ef] pb-20 lg:pb-0">
    <Navigation />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 w-2/3 rounded mb-6"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg"></div>)}
            </div>
            <div className="mt-8 h-12 bg-gray-200 w-full rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

const BookSessionPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile: existingProfile, expertId: stateExpertId, price: overridePrice } = location.state || {};

  const expertId = stateExpertId || existingProfile?.id;
  const [profile, setProfile] = useState<Profile | null>(existingProfile || null);

  const sessionPrice = overridePrice ? overridePrice : (profile?.price || 0);
  // Skill (for pricing): expert's skills only; duration 30 or 60; level from expert
  const skillOptions = profile?.skills?.length ? profile.skills : (profile?.category ? [profile.category] : ["General"]);
  const [selectedSkill, setSelectedSkill] = useState<string>(skillOptions[0] || "General");
  const [expertLevel, setExpertLevel] = useState(existingProfile?.level || "Intermediate");
  // Only show durations the expert offers (30 and/or 60)
  const durationOptions = useMemo(() => {
    const allowed = profile?.availability?.allowedDurations;
    if (Array.isArray(allowed) && allowed.length > 0) return allowed.filter((d) => d === 30 || d === 60);
    const single = profile?.availability?.sessionDuration;
    if (single === 30 || single === 60) return [single];
    return [30];
  }, [profile?.availability?.allowedDurations, profile?.availability?.sessionDuration]);
  const [sessionDuration, setSessionDuration] = useState<number>(durationOptions[0] ?? 30);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // LinkedIn-style Profile Header
  const bannerImage = useMemo(() => {
    const banners = [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80"
    ];
    // Use expertId to consistently pick a banner for the same expert
    const charSum = expertId ? expertId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
    return banners[charSum % banners.length];
  }, [expertId]);

  useEffect(() => {
    if (profile?.level) setExpertLevel(profile.level);
    const opts = profile?.skills?.length ? profile.skills : (profile?.category ? [profile.category] : ["General"]);
    if (opts.length && !opts.includes(selectedSkill)) setSelectedSkill(opts[0]);
    const dur = profile?.availability?.allowedDurations?.length ? profile.availability.allowedDurations : (profile?.availability?.sessionDuration ? [profile.availability.sessionDuration] : [30]);
    const validDur = dur.filter((d) => d === 30 || d === 60);
    if (validDur.length && !validDur.includes(sessionDuration)) setSessionDuration(validDur[0]);
  }, [profile]);
  const [loading, setLoading] = useState(!existingProfile || !existingProfile.availability);
  const [errorValue, setErrorValue] = useState<string | null>(null);

  useEffect(() => {
    // Always fetch fresh profile data to ensure availability is up-to-date
    if (expertId) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
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
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [expertId]);

  // Dynamic price: skill + expert + duration (only 30 or 60 min; uses expert's level from backend)
  useEffect(() => {
    const fetchPrice = async () => {
      if (!profile?.id || !selectedSkill || ![30, 60].includes(sessionDuration)) {
        setCalculatedPrice(0);
        return;
      }
      try {
        const res = await axios.get("/api/pricing/calculate-price", {
          params: { skill: selectedSkill, expertId: profile.id, duration: sessionDuration }
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
  }, [profile?.id, selectedSkill, sessionDuration]);


  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(0); // Default to first available date (Today)
  // Better: selectedDate as index is tricky with switching months. 
  // Let's keep selectedDate as index of 'dates' array but reset it on month change.

  const [selectedSlot, setSelectedSlot] = useState<{ time: string; available: boolean } | null>(null);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
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

    console.log(`[Debug] Date: ${date.toDateString()}, DayShort: ${dayShort}, AvailableKey: ${availableKey}, Ranges:`, weeklyRanges);

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

    weeklyRanges.forEach((range: { from: string; to: string }) => {
      if (!range.from || !range.to) return;

      let currentMinutes = parseTimeToMinutes(range.from);
      let endMinutes = parseTimeToMinutes(range.to);

      if (endMinutes < currentMinutes) {
        endMinutes += 24 * 60;
      }

      const duration = Number(sessionDuration);
      console.log(`[Debug] Checking range ${range.from}-${range.to} (${currentMinutes}-${endMinutes}) with duration ${duration}`);

      while (currentMinutes + duration <= endMinutes) {
        // Validation: HIDE past slots for "Today"
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

        // Skip past slots entirely
        if (isToday && currentMinutes < currentTimeMinutes) {
          currentMinutes += duration;
          continue;
        }

        const slotStartMinutes = currentMinutes;
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(slotStartMinutes / 60), slotStartMinutes % 60, 0, 0);

        const isBooked = bookedSessions.some(session => {
          if (session.status === 'cancelled') return false;
          // Robust date parsing
          const sStart = new Date(session.startTime);
          const sEnd = new Date(session.endTime);

          if (isNaN(sStart.getTime()) || isNaN(sEnd.getTime())) return false;

          const slotEndMinutes = currentMinutes + duration;
          const slotEndDate = new Date(date);
          slotEndDate.setHours(Math.floor(slotEndMinutes / 60), slotEndMinutes % 60, 0, 0);

          return slotDate < sEnd && slotEndDate > sStart;
        });

        const slotStart = formatMinutesToTime(currentMinutes);
        const slotEnd = formatMinutesToTime(currentMinutes + duration);

        generatedSlots.push({
          time: `${slotStart} - ${slotEnd}`,
          available: !isBooked
        });
        currentMinutes += duration;
      }
    });

    console.log(`[Debug] Generated Slots for ${date.toDateString()}:`, generatedSlots);
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
          price: calculatedPrice || sessionPrice,
          duration: sessionDuration,
          category: profile.category,
          level: expertLevel,
          skill: selectedSkill,
          topics: [selectedSkill]
        }
      }
    });
  };

  if (loading) return <BookSessionSkeleton />;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{errorValue || "Profile Not Found"}</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors font-medium"
          >
            Return to Home
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

  // LinkedIn-style Profile Header


  const ProfileHeader = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="h-40 md:h-48 relative overflow-hidden">
        <img
          src={bannerImage}
          alt="Banner"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="white-glass p-2 rounded-full hover:bg-white/40 transition-colors shadow-sm bg-white/20 backdrop-blur-md">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pb-6 mt-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar on Left */}
          <div className="relative shrink-0 -mt-16 md:-mt-20">
            <div className="relative inline-block">
              <img
                src={profile.avatar || "/mockeefy.png"}
                alt={profile.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/mockeefy.png";
                }}
              />
              <div className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
            </div>
          </div>

          {/* Details on Right */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {profile.name}
                  </h1>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-yellow-800">{profile.rating}</span>
                  </div>
                </div>

                <p className="text-lg text-gray-700 font-medium mb-1">
                  {profile.role}
                  {profile.company && (
                    <span className="text-gray-500"> • {profile.company}</span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium my-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {profile.experience} Experience
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(profile.category)}`}>
                    {profile.category} SPECIALIST
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-green-100 bg-green-50 text-green-700">
                    VERIFIED EXPERT
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[120px] bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div className="text-xl font-bold text-[#004fcb]">{calculatedPrice > 0 ? `₹${calculatedPrice}` : sessionPrice}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">per session</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // LinkedIn-style Booking Sidebar
  const BookingCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Configure Session</h3>
        <Info className="w-4 h-4 text-gray-400 cursor-help" />
      </div>

      {/* Level Selector */}
      {/* Skill (from expert) + Duration (30 or 60) — amount from these only */}
      <div className="space-y-4 mb-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Skill / Topic</span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full text-sm font-bold text-gray-900 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {skillOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Expert Level</span>
            <div className="w-full text-sm font-bold text-gray-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
              {expertLevel}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Set by expert</p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Duration</span>
            <select
              value={durationOptions.includes(sessionDuration) ? sessionDuration : durationOptions[0]}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="w-full text-sm font-bold text-gray-900 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {durationOptions.includes(30) && <option value={30}>30 Minutes</option>}
              {durationOptions.includes(60) && <option value={60}>60 Minutes</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
        <div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] block mb-1">Total Amount</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#004fcb]">₹{calculatedPrice > 0 ? calculatedPrice : sessionPrice}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">INR</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Timer className="w-3 h-3" /> {sessionDuration} Min Session
          </div>
          <div className="px-2 py-0.5 rounded bg-blue-100 text-[#004fcb] text-[9px] font-black uppercase tracking-widest border border-blue-200">
            {expertLevel} Level
          </div>
        </div>
      </div>


      {/* Month Header */}
      <div className="flex flex-col px-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-[10px] font-black text-[#004fcb] uppercase tracking-widest mb-0.5">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <span className="text-[10px] font-medium text-gray-400">Select your preferred date</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Picker - Modern & Bold */}
      <div className="relative group/carousel px-0 mt-4 mb-6">
        {/* Floating Arrows - Always visible for better UX */}
        <button
          type="button"
          onClick={() => scrollCarousel('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-30 p-2 rounded-full bg-white shadow-lg border border-gray-100 text-[#004fcb] hover:bg-[#004fcb] hover:text-white transition-all duration-300"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => scrollCarousel('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-30 p-2 rounded-full bg-white shadow-lg border border-gray-100 text-[#004fcb] hover:bg-[#004fcb] hover:text-white transition-all duration-300"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {dates.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString();
            const isPast = false; // Already filtered

            return (
              <button
                key={index}
                data-active={selectedDate === index}
                disabled={isPast}
                onClick={() => {
                  setSelectedDate(index);
                  setSelectedSlot(null);
                }}
                className={`flex flex-col items-center py-4 px-5 rounded-2xl min-w-[85px] transition-all duration-300 shrink-0 snap-center relative border ${selectedDate === index
                  ? "bg-[#004fcb] border-[#004fcb] text-white shadow-lg shadow-blue-900/20 scale-105 z-10"
                  : isToday
                    ? "bg-white border-blue-200 text-gray-900 shadow-sm ring-1 ring-blue-50"
                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
              >
                {isToday && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap z-20 ${selectedDate === index ? "bg-white text-[#004fcb] border border-blue-100" : "bg-[#004fcb] text-white"
                    }`}>
                    Today
                  </span>
                )}
                <span className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${selectedDate === index ? "text-blue-100" : "text-gray-400"}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-2xl font-black leading-none mb-1.5 tracking-tight">
                  {date.getDate()}
                </span>
                <span className={`text-[10px] font-bold uppercase ${selectedDate === index ? "text-blue-100" : "text-gray-400"}`}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Grid - Gen Z / Modern */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          Available Times
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004fcb] text-[10px] font-black border border-blue-100">{currentSlots.length}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 pb-2">
        {currentSlots.length > 0 ? (
          currentSlots.map((slot, index) => {
            const [start, end] = slot.time.split(' - ');
            return (
              <button
                key={index}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot)}
                className={`group relative flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-200 ${!slot.available
                  ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                  : selectedSlot?.time === slot.time
                    ? "bg-[#004fcb] border-[#004fcb] text-white shadow-lg shadow-blue-600/20 scale-[1.02] ring-2 ring-blue-100"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#004fcb] hover:shadow-md hover:-translate-y-0.5 hover:text-[#004fcb]"
                  }`}
              >
                {!slot.available && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl z-20">
                    <div className="bg-gray-100/90 px-2 py-1 rounded text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200">
                      Unavailable
                    </div>
                  </div>
                )}
                <div className={`flex flex-col items-center leading-none gap-1.5 ${!slot.available ? 'opacity-20 blur-[0.5px]' : ''}`}>
                  <span className="text-sm font-black tracking-tight">
                    {start}
                  </span>
                  <span className={`text-[10px] font-medium ${selectedSlot?.time === slot.time ? "text-blue-100" : "text-gray-400 group-hover:text-blue-400"}`}>
                    To {end}
                  </span>
                </div>
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

      {/* Booking Actions */}
      <div className="border-t border-gray-100 pt-5">
        {selectedSlot ? (
          <div className="mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
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
          <p className="text-xs text-center text-gray-400 mb-4 px-4">
            Select an available time slot above to continue with your booking.
          </p>
        )}

        <button
          onClick={() => setShowPayment(true)}
          disabled={!selectedSlot}
          className={`w-full py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 group ${selectedSlot
            ? "bg-[#004fcb] text-white hover:bg-[#003bb5] shadow-md"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {selectedSlot ? (
            <>
              Confirm & Book
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
    <div className="lg:hidden fixed bottom-6 right-6 z-40">
      <button
        onClick={() => setShowMobileBooking(true)}
        className="flex items-center gap-2 px-6 py-4 bg-[#004fcb] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold"
      >
        <Calendar className="w-5 h-5" />
        Book Now
      </button>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#f3f2ef] pb-10">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#004fcb] font-medium mb-4 transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content Areas */}
            <div className="lg:col-span-8 space-y-6">
              {ProfileHeader()}

              {/* Tabs Section - Minimal Layout Shift */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[500px]">
                <div className="border-b border-gray-200">
                  <div className="flex px-4">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`px-6 py-4 font-bold text-sm transition-all relative ${activeTab === "details"
                        ? "text-[#004fcb] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#004fcb]"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      About Session
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`px-6 py-4 font-bold text-sm transition-all relative ${activeTab === "reviews"
                        ? "text-[#004fcb] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#004fcb]"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      Reviews & Ratings ({reviews.length})
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {activeTab === "details" ? (
                    <div className="space-y-10 animate-fadeIn">
                      {/* Session Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#004fcb]">
                            <Timer className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{sessionDuration}m</div>
                            <div className="text-xs text-gray-500 font-medium">Session duration</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#004fcb]">
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">1:1 Video</div>
                            <div className="text-xs text-gray-500 font-medium">Live interaction</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#004fcb]">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Customized</div>
                            <div className="text-xs text-gray-500 font-medium">Tailored plan</div>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-gray-400" />
                          Areas of Expertise
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, idx) => (
                            <span key={idx} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:border-[#004fcb] transition-colors cursor-default">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Session Structure */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-gray-900">Session flow</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          A structured mock interview with clear outcomes—optimized for fast improvements.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { title: "Align goals", desc: "We confirm your target role, seniority, and focus areas." },
                            { title: "Mock interview", desc: "Real questions, realistic pacing, and professional evaluation." },
                            { title: "Feedback & scorecard", desc: "Strengths, gaps, and specific fixes—no generic advice." },
                            { title: "Next steps", desc: "A short action plan + resources to practice right away." }
                          ].map((step, idx) => (
                            <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                              <h5 className="font-bold text-gray-900 text-sm mb-1">{idx + 1}) {step.title}</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits Checklist */}
                      <div className="bg-[#004fcb]/5 p-6 rounded-xl border border-[#004fcb]/10">
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
                    <div className="space-y-8 animate-fadeIn">
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
                          <div className="py-20 text-center">
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
                          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
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
            </div>

            {/* Sidebar Columns */}
            <div className="hidden lg:block lg:col-span-4 h-fit sticky top-[80px]">
              <div className="space-y-6">
                {BookingCard()}

                {/* Proof Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 px-1">Why learn from {profile.name.split(' ')[0]}?</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#004fcb]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Trusted Guidance</p>
                        <p className="text-[11px] text-gray-500">500+ professionals successfully coached this year.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Fast Response</p>
                        <p className="text-[11px] text-gray-500">Typically responds to booking requests within {profile.responseTime}.</p>
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
            <div className="bg-white w-full rounded-t-[32px] max-h-[85vh] overflow-y-auto animate-slideUp relative pb-10">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md items-center border-b border-gray-100 p-6 flex justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Book Session</h3>
                  <p className="text-xs text-gray-500 font-medium">with {profile.name}</p>
                </div>
                <button onClick={() => setShowMobileBooking(false)} className="p-2 bg-gray-50 rounded-full text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {BookingCard()}
              </div>
            </div>
          </div>
        )}

        {/* Dummy Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fadeIn">
            <div className="bg-white rounded-[24px] p-8 shadow-2xl w-full max-w-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#004fcb]"></div>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-[#004fcb]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Checkout Summary
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Review your session details before making the payment. Secure gateway powered by Stripe.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500 font-medium">Session Fee ({sessionDuration} mins)</span>
                  <span className="text-gray-900 font-bold">₹{calculatedPrice}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500 font-medium">Service Tax</span>
                  <span className="text-gray-900 font-bold">₹0</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between text-base py-1">
                  <span className="text-gray-900 font-bold">Total Amount</span>
                  <span className="text-[#004fcb] font-black">₹{calculatedPrice}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    showPaymentPage();
                  }}
                  className="flex-1 py-4 bg-[#004fcb] text-white rounded-xl font-bold hover:bg-[#003bb5] transition-all shadow-md active:scale-95"
                >
                  Confirm Pay
                </button>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    Swal.fire({
                      title: "Payment Cancelled",
                      text: "The checkout process was aborted. Your session is not booked.",
                      icon: "info",
                      iconColor: "#004fcb",
                      confirmButtonColor: "#004fcb",
                    });
                  }}
                  className="px-6 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
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
