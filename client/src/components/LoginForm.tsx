// src/components/LoginForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, googleLogin, user: ctxUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const returnedUser = await login(formData.email, formData.password);
      const finalUser = returnedUser ?? ctxUser;

      if (!finalUser) {
        setError("Login succeeded but user data is unavailable.");
        return;
      }

      if (finalUser.userType === "expert") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    setIsLoading(true);
    setError("");
    const result = await googleLogin(accessToken);
    if (result.success) {
      const finalUser = result.user;
      if (finalUser.userType === "expert") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      setError("Account not found. Please create an account.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-sm"> {/* max-w-sm for tighter fit */}
        <Card className="w-full shadow-lg border-none bg-white overflow-hidden">
          <CardContent className="p-8">

            {/* Consolidated Header: Logo + Welcome */}
            <div className="flex flex-col items-center justify-center mb-6 space-y-4">
              {/* Logo matching Navigation */}
              <div className="flex items-center justify-center gap-2 relative h-16 w-full">
                <img
                  src="/mockeefy.png"
                  alt="Mockeefy"
                  className="h-full w-auto object-contain mix-blend-multiply"
                />
                <span className="text-3xl font-bold tracking-tight text-[#004fcb] font-['Outfit'] animate-fade-in">
                  Mockeefy
                </span>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 text-xs">
                  Enter your credentials to access your account
                </p>
              </div>
            </div>

            {/* Error Message Area */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                    Password
                  </Label>
                  {/* <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link> */}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-10 border-gray-300 rounded-md shadow-sm pr-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm hover:shadow transition-all text-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Google Sign-In - same flow as email sign in, then redirect to landing or dashboard */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={setError}
              disabled={isLoading}
            />

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
