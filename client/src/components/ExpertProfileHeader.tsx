import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Camera, AlertCircle, CheckCircle, XCircle } from "lucide-react";

// Progress Ring Component
const ProgressRing = memo(({
  percent = 0,
  children
}: {
  percent?: number;
  children: React.ReactNode
}) => {
  const size = 110; // Slightly larger for better visibility
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
});

ProgressRing.displayName = "ProgressRing";

const ExpertProfileHeader = memo(({ onRefresh }: { onNavigate?: (tab: string) => void; onRefresh?: () => void; }) => {
  const { user, fetchProfile: refreshGlobalUser } = useAuth();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "",
    title: "",
    company: "",
    photoUrl: "",
    status: "pending",
    rejectionReason: ""
  });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await axios.get("/api/expert/profile");

      if (res.data?.success) {
        const p = res.data.profile || {};
        setProfile({
          name: p.name || user.name || "",
          title: p.title || "",
          company: p.company || "",
          photoUrl: p.photoUrl || "",
          status: p.status || "pending",
          rejectionReason: p.rejectionReason || ""
        });
        setCompletion(res.data.completion || 0);
        setMissingSections(res.data.missingSections || []);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Handle 404 silently or redirect if needed, but here we expect data now
        console.error("Profile not found");
      }
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoUpload = async (file: File) => {
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axios.post("/api/expert/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        toast.success("Profile photo updated");
        setProfile(prev => ({
          ...prev,
          photoUrl: res.data.profile?.photoUrl || prev.photoUrl
        }));
        // Refresh to get updated completion status
        fetchProfile();
        // Sync global auth state so TopNav updates
        refreshGlobalUser();
        // Notify parent (ProfilePage) to refresh its state
        onRefresh?.();
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleResubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/expert/resubmit");
      if (res.data.success) {
        toast.success("Profile resubmitted");
        fetchProfile();
        refreshGlobalUser();
        onRefresh?.();
      }
    } catch (err) {
      toast.error("Failed to resubmit");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      Active: {
        label: "Verified",
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
        badgeColor: "bg-green-500"
      },
      approved: {
        label: "Approved",
        icon: CheckCircle,
        color: "text-blue-600 bg-blue-50 border-blue-200",
        badgeColor: "bg-blue-500"
      },
      rejected: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-600 bg-red-50 border-red-200",
        badgeColor: "bg-red-500"
      },
      default: {
        label: "Pending",
        icon: AlertCircle,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        badgeColor: "bg-amber-500"
      }
    };

    return configs[status as keyof typeof configs] || configs.default;
  };

  const statusConfig = getStatusConfig(profile.status);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse mb-4" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile-Friendly Layout Container */}
      <div className="flex flex-col items-center text-center px-4 w-full">

        {/* Top Section: Status & Image */}
        <div className="relative mb-6">
          {/* Status Badge - Floating or Inline? User likes clean. Let's keep status badge nearby or remove if redundant */}
          {/* Moving status badge to top-right of container was previous design, sticking to cleaner centered layout */}

          <ProgressRing percent={completion}>
            {profile.photoUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm">
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff&size=96`;
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white flex items-center justify-center shadow-sm">
                <span className="text-3xl font-semibold text-gray-300">
                  {(profile.name || user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </ProgressRing>

          {/* Upload Button */}
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border hover:bg-gray-50 transition-colors disabled:opacity-75 z-10"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <input
            ref={photoInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
          />
        </div>

        {/* Profile Info */}
        <div className="mb-6 w-full max-w-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 truncate">
            {profile.name || user?.name || "Your Name"}
          </h2>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>

          {(profile.title || profile.company) && (
            <p className="text-sm text-gray-500 font-medium truncate">
              {profile.title}{profile.title && profile.company && " at "}{profile.company}
            </p>
          )}

          {/* Progress Bar Label */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span>Profile Completion</span>
              <span className="text-blue-600">{completion}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Required Section */}
        {completion < 100 && (
          <div className="w-full max-w-md bg-amber-50/50 rounded-xl border border-amber-100 p-4 md:p-6 mb-2">
            {profile.status === "rejected" ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <h4 className="font-semibold">Updates Required</h4>
                </div>
                <p className="text-sm text-red-600/90 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                  {profile.rejectionReason || "Please update your profile information as requested."}
                </p>
                <button
                  onClick={handleResubmit}
                  disabled={loading}
                  className="w-full py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
                >
                  {loading ? "Submitting..." : "Resubmit Profile"}
                </button>
              </div>
            ) : (
              missingSections.length > 0 && (
                <div className="w-full">
                  <div className="mb-3 flex items-center justify-center gap-2 text-amber-700">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-semibold">Complete Your Profile</h4>
                  </div>

                  <div className="bg-white rounded-lg border border-amber-100 p-4">
                    <p className="text-xs text-center text-gray-500 mb-3">
                      Profile Completion Status:
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Personal Information",
                        "Education",
                        "Professional Details",
                        "Skills & Expertise",
                        "Availability",
                        "Profile Photo",
                        "Verification Documents"
                      ].map((section, idx) => {
                        const isMissing = missingSections.includes(section);
                        return (
                          <li key={idx} className="flex items-center gap-2 text-sm px-2">
                            {isMissing ? (
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                            <span className={isMissing ? "text-amber-700 font-medium" : "text-green-700 font-medium"}>
                              {section}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Completed State */}
        {completion >= 100 && (
          <div className="w-full max-w-sm mt-4 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-800 mb-1">All Set!</h4>
            <p className="text-sm text-green-600/90 mb-4">
              Your profile is complete and pending verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ExpertProfileHeader.displayName = "ExpertProfileHeader";

export default ExpertProfileHeader;