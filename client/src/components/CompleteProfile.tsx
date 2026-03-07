
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";

interface LocationState {
  email: string;
  userType?: string;
  googleId?: string;
}

const userTypeOptions = [
  { value: "candidate", label: "Candidate" },
  { value: "expert", label: "Expert" }
];

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    userType: ""
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
    // Set userType from state if available
    if (state?.userType) {
      setFormData(prev => ({ ...prev, userType: state.userType! }));
    }
  }, [state, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

      setIsLoading(false);
      if (formData.userType === "expert") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  if (!state?.email) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-sm">
        <Card className="w-full shadow-lg border-none bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center mb-6 space-y-4">
              <div className="flex items-center justify-center gap-0 relative h-24">
                <img
                  src="/mockeefy.png"
                  alt="Mockeefy"
                  className="absolute top-[-20px] h-[100px] w-auto object-contain mix-blend-multiply -ml-[140px]"
                />
                <span className="text-4xl font-bold tracking-tight text-[#004fcb] font-['Outfit'] ml-[40px]">
                  Mockeefy
                </span>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900">
                  Complete your profile
                </h1>
                <p className="text-gray-500 text-xs text-balance">
                  Add your personal details to get started
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  className="w-full h-10 border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="userType" className="text-xs font-semibold text-gray-700">
                  I am a
                </Label>
                <Select
                  id="userType"
                  options={userTypeOptions}
                  value={userTypeOptions.find(o => o.value === formData.userType)}
                  onChange={option => handleInputChange("userType", option?.value ?? "")}
                  placeholder="Select your role"
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderColor: "#D1D5DB",
                      boxShadow: "none",
                      fontSize: "0.875rem",
                      borderRadius: "0.375rem",
                      '&:hover': {
                        borderColor: "#9CA3AF"
                      }
                    }),
                    menu: base => ({
                      ...base,
                      fontSize: "0.875rem",
                      zIndex: 10,
                    }),
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                  Create Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={e => handleInputChange("password", e.target.value)}
                    className="w-full h-10 pr-10 border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full h-10 pr-10 border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition-all text-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Complete Account Creation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
