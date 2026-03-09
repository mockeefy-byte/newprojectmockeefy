import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./auth/AuthLayout";
import Select from "react-select";

interface LocationState {
  email: string;
  userType?: string;
  googleId?: string;
  name?: string;
}

const userTypeOptions = [
  { value: "candidate", label: "Candidate" },
  { value: "expert", label: "Expert" },
];

const inputClass =
  "w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 focus:bg-white outline-none transition-all text-sm";
const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";
const btnPrimary =
  "w-full h-11 rounded-xl bg-[#004fcb] text-white font-bold text-sm hover:bg-blue-700 focus:ring-2 focus:ring-[#004fcb]/30 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20";

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.email) {
      navigate("/signup");
    }
    if (state?.userType) {
      setFormData((prev) => ({ ...prev, userType: state.userType! }));
    }
    if (state?.name) {
      setFormData((prev) => ({ ...prev, name: state.name }));
    }
  }, [state, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.userType) {
      setError("Please select whether you're a Candidate or Expert");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await register(
        state.email,
        formData.password,
        formData.userType,
        formData.name.trim(),
        state.googleId
      );
      if (formData.userType === "expert") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!state?.email) return null;

  return (
    <AuthLayout title="Complete profile">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Complete your profile</h2>
        <p className="text-slate-500 text-sm mt-1">Add your details to get started</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="userType" className={labelClass}>
              I am a
            </label>
            <Select
              id="userType"
              options={userTypeOptions}
              value={userTypeOptions.find((o) => o.value === formData.userType)}
              onChange={(option) => handleInputChange("userType", option?.value ?? "")}
              placeholder="Select your role"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "2.75rem",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.75rem",
                  borderWidth: "2px",
                  fontSize: "0.875rem",
                  "&:hover": { borderColor: "#cbd5e1" },
                }),
                menu: (base) => ({ ...base, fontSize: "0.875rem", zIndex: 10 }),
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Create password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={btnPrimary}>
            {isLoading ? "Creating account..." : "Complete account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/signin" className="font-semibold text-[#004fcb] hover:text-blue-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
