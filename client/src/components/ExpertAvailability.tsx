import { useEffect, useState } from "react";
import axios from '../lib/axios';
import { toast } from "sonner";
import { PrimaryButton } from '../pages/ExpertDashboard';
import { X, Copy, Plus, Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

interface Slot {
  from: string;
  to: string;
}

interface Availability {
  sessionDuration: number;
  maxPerDay: number;
  weekly: Record<string, Slot[]>;
  breakDates: { start: string; end: string }[];
}

interface ProfileState {
  availability: Availability;
}

// --- Time Helpers ---

// Convert "14:30" -> { hour: "02", minute: "30", period: "PM" }
const parseTime24 = (time24: string) => {
  if (!time24) return { hour: "09", minute: "00", period: "AM" };
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return {
    hour: hour.toString().padStart(2, '0'),
    minute: m.toString().padStart(2, '0'),
    period
  };
};

// Convert { hour, minute, period } -> "14:30"
const formatTime24 = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
};

// Display "14:30" as "02:30 PM"
const displayTime = (time24: string) => {
  if (!time24) return "";
  const { hour, minute, period } = parseTime24(time24);
  return `${hour}:${minute} ${period}`;
};

const TimeSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [localState, setLocalState] = useState(parseTime24(value));

  useEffect(() => {
    setLocalState(parseTime24(value));
  }, [value]);

  const handleChange = (field: 'hour' | 'minute' | 'period', newVal: string) => {
    const newState = { ...localState, [field]: newVal };
    setLocalState(newState);
    onChange(formatTime24(newState.hour, newState.minute, newState.period));
  };

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1">
      <select
        value={localState.hour}
        onChange={(e) => handleChange('hour', e.target.value)}
        className="bg-transparent text-sm font-medium focus:outline-none appearance-none cursor-pointer text-center w-8"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-gray-400 font-bold">:</span>
      <select
        value={localState.minute}
        onChange={(e) => handleChange('minute', e.target.value)}
        className="bg-transparent text-sm font-medium focus:outline-none appearance-none cursor-pointer text-center w-8"
      >
        {["00", "15", "30", "45"].map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={localState.period}
        onChange={(e) => handleChange('period', e.target.value)}
        className="bg-gray-50 text-xs font-bold rounded px-1 py-0.5 ml-1 focus:outline-none cursor-pointer text-gray-600"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};


const ExpertAvailability = () => {
  const [profile, setProfile] = useState<ProfileState>({
    availability: {
      sessionDuration: 30,
      maxPerDay: 1,
      weekly: {},
      breakDates: []
    }
  });

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabel: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const res = await axios.get("/api/expert/availability");
      const data = res.data.data;
      const weekly = data.weekly || {};

      // Ensure structure
      Object.keys(weekly).forEach(day => {
        if (Array.isArray(weekly[day])) {
          weekly[day] = weekly[day].map((slot: any) => ({ from: slot.from, to: slot.to }));
        }
      });

      setProfile((p) => ({
        ...p,
        availability: {
          sessionDuration: data.sessionDuration || 30,
          maxPerDay: data.maxPerDay || 4,
          weekly: weekly,
          breakDates: data.breakDates || [],
        }
      }));
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  }

  function calculateEndTime(startTime: string, duration: number) {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    return `${endHours}:${endMinutes}`;
  }

  const addSlotForDay = (day: string) => {
    const currentSlots = profile.availability.weekly[day] || [];
    const maxPerDay = profile.availability.maxPerDay || 4;

    if (currentSlots.length >= maxPerDay) {
      toast.error(`Daily limit reached (${maxPerDay} sessions).`);
      return;
    }

    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      const defaultStart = "09:00";
      const defaultEnd = calculateEndTime(defaultStart, p.availability.sessionDuration);
      weekly[day] = [...(weekly[day] || []), { from: defaultStart, to: defaultEnd }];
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  const updateSlotForDay = (day: string, idx: number, newStartTime: string) => {
    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      const slots = [...(weekly[day] || [])];
      const endTime = calculateEndTime(newStartTime, p.availability.sessionDuration);
      slots[idx] = { ...slots[idx], from: newStartTime, to: endTime }; // Auto-update end time
      weekly[day] = slots;
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  const removeSlotForDay = (day: string, idx: number) => {
    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      weekly[day] = weekly[day].filter((_, i) => i !== idx);
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  const copyToAllDays = (sourceDay: string) => {
    if (!confirm(`Copy schedule from ${dayLabel[sourceDay]} to all other days?`)) return;

    const sourceSlots = profile.availability.weekly[sourceDay] || [];
    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      days.forEach(d => {
        if (d !== sourceDay) {
          weekly[d] = [...sourceSlots];
        }
      });
      return { ...p, availability: { ...p.availability, weekly } };
    });
    toast.success("Schedule copied to all days");
  };

  const clearDay = (day: string) => {
    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      weekly[day] = [];
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  // --- Break Dates ---
  const addBreakDate = (dateStr: string) => {
    if (!dateStr) return;
    if (profile.availability.breakDates.some(b => b.start === dateStr)) {
      toast.error("Date already blocked");
      return;
    }
    setProfile((p) => ({
      ...p,
      availability: {
        ...p.availability,
        breakDates: [...p.availability.breakDates, { start: dateStr, end: dateStr }]
      }
    }));
  };

  const removeBreakDate = (idx: number) => {
    setProfile((p) => ({
      ...p,
      availability: {
        ...p.availability,
        breakDates: p.availability.breakDates.filter((_, i) => i !== idx)
      }
    }));
  };

  const saveAvailability = async () => {
    try {
      const payload = JSON.parse(JSON.stringify(profile.availability));
      await axios.put("/api/expert/availability", payload);
      toast.success("Availability saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save availability");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Availability & Scheduling</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your weekly hours and session preferences.</p>
        </div>
        <PrimaryButton onClick={saveAvailability} className="shadow-lg shadow-blue-500/20">
          <CheckCircle2 size={18} className="mr-2" />
          Save Changes
        </PrimaryButton>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Settings & Blocked Dates */}
          <div className="space-y-6">

            {/* Global Settings Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Clock size={18} className="text-blue-600" />
                Session Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={profile.availability.sessionDuration}
                    onChange={(e) => setProfile(p => ({ ...p, availability: { ...p.availability, sessionDuration: Number(e.target.value) } }))}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Max Sessions / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={profile.availability.maxPerDay}
                    onChange={(e) => setProfile(p => ({ ...p, availability: { ...p.availability, maxPerDay: Number(e.target.value) } }))}
                  />
                </div>
              </div>
            </div>

            {/* Blocked Dates Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CalendarIcon size={18} className="text-red-500" />
                Blocked Dates
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  id="blockDateInput"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById("blockDateInput") as HTMLInputElement;
                    if (el.value) { addBreakDate(el.value); el.value = ""; }
                  }}
                  className="bg-gray-900 hover:bg-black text-white p-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {profile.availability.breakDates.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">No dates blocked.</p>
                )}
                {profile.availability.breakDates.map((date, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-red-50 border border-red-100 px-3 py-2 rounded-lg text-sm text-red-700">
                    <span>{new Date(date.start).toDateString()}</span>
                    <button onClick={() => removeBreakDate(idx)} className="text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Weekly Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Weekly Schedule</h3>
                <p className="text-xs text-gray-500 hidden sm:block">Set your recurring availability</p>
              </div>

              <div className="divide-y divide-gray-100">
                {days.map((day) => {
                  const slots = profile.availability.weekly[day] || [];
                  const isAvailable = slots.length > 0;

                  return (
                    <div key={day} className={`p-6 transition-colors ${isAvailable ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                        {/* Day Label & Toggle */}
                        <div className="w-32 pt-1 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isAvailable}
                                onChange={() => isAvailable ? clearDay(day) : addSlotForDay(day)}
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <span className={`font-semibold ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                              {dayLabel[day]}
                            </span>
                          </div>
                        </div>

                        {/* Slots Area */}
                        <div className="flex-1">
                          {!isAvailable ? (
                            <div className="text-sm text-gray-400 italic pt-1">Unavailable</div>
                          ) : (
                            <div className="space-y-3">
                              {slots.map((slot, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">

                                  <TimeSelect
                                    value={slot.from}
                                    onChange={(newTime) => updateSlotForDay(day, idx, newTime)}
                                  />

                                  <span className="text-gray-300">-</span>

                                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-500 font-medium w-24 text-center">
                                    {displayTime(slot.to)}
                                  </div>

                                  <button
                                    onClick={() => removeSlotForDay(day, idx)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-auto sm:ml-0"
                                    title="Remove Slot"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}

                              <div className="flex items-center gap-4 pt-2">
                                <button
                                  onClick={() => addSlotForDay(day)}
                                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                >
                                  <Plus size={14} /> Add Slot
                                </button>

                                {slots.length > 0 && (
                                  <button
                                    onClick={() => copyToAllDays(day)}
                                    className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                                    title="Copy this schedule to all other days"
                                  >
                                    <Copy size={12} /> Copy to all
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpertAvailability;
