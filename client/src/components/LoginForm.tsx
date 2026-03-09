// src/components/LoginForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./auth/AuthLayout";
import { GoogleAuthButton } from "./auth/GoogleAuthButton";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, googleLogin, user: ctxUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
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
      const role = finalUser.userType?.toLowerCase();
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "expert") {
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
    try {
      const result = await googleLogin(accessToken);
      if (result?.success && result?.user) {
        const role = result.user.userType?.toLowerCase();
        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "expert") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError("Account not found. Please create an account.");
      }
    } catch {
      setError("Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 focus:bg-white outline-none transition-all text-sm"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#004fcb] hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-11 px-4 pr-11 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 focus:bg-white outline-none transition-all text-sm"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#004fcb] text-white font-bold text-sm hover:bg-blue-700 focus:ring-2 focus:ring-[#004fcb]/30 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={setError}
          disabled={isLoading}
          label="Sign in with Google"
        />

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#004fcb] hover:text-blue-700 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
