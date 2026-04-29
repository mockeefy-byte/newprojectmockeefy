import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./auth/AuthLayout";
import MockeefyLogo from "./MockeefyLogo";

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
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
        <div className="flex items-center justify-center gap-2 mb-5">
          <MockeefyLogo className="h-12 w-12" variant="brand" />
          <span className="text-2xl font-logo tracking-tight text-[#004fcb]">Mockeefy</span>
        </div>

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
            <div className="relative" ref={roleMenuRef}>
              <button
                id="userType"
                type="button"
                onClick={() => setIsRoleOpen((v) => !v)}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 outline-none transition-all text-sm flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isRoleOpen}
              >
                <span className={`${formData.userType ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}`}>
                  {formData.userType
                    ? userTypeOptions.find((opt) => opt.value === formData.userType)?.label
                    : "Select one — Candidate or Expert"}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isRoleOpen ? "rotate-180" : ""}`} />
              </button>

              {isRoleOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl p-1.5">
                  {userTypeOptions.map((opt) => {
                    const selected = formData.userType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          handleInputChange("userType", opt.value);
                          setIsRoleOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                          selected ? "bg-blue-50 text-[#004fcb]" : "text-slate-700 hover:bg-slate-50"
                        }`}
                        role="option"
                        aria-selected={selected}
                      >
                        <span>{opt.label}</span>
                        {selected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
