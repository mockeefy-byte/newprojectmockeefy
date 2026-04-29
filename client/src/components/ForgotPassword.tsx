import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthLayout from "./auth/AuthLayout";
import MockeefyLogo from "./MockeefyLogo";

const inputClass =
  "w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 focus:bg-white outline-none transition-all text-sm";
const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";
const btnPrimary =
  "w-full h-11 rounded-xl bg-[#004fcb] text-white font-bold text-sm hover:bg-blue-700 focus:ring-2 focus:ring-[#004fcb]/30 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const startCountdown = () => {
    setCountdown(30);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const sendOtpMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const res = await axios.post("/api/auth/send-otp", { email: emailAddress, type: "reset" });
      return res.data;
    },
    onSuccess: (_, emailAddress) => {
      setEmail(emailAddress);
      setStep(2);
      setError("");
      startCountdown();
      toast.success("Code sent to your email");
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err.response?.data?.message || "Failed to send code");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      return res.data;
    },
    onSuccess: (data: { success: boolean }) => {
      if (data?.success) {
        setStep(3);
        setError("");
        toast.success("Code verified");
      } else {
        setError("Invalid code. Please try again.");
      }
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err.response?.data?.message || "Invalid code");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password reset! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 1500);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err.response?.data?.message || "Failed to reset password");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    sendOtpMutation.mutate(trimmed);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    resetPasswordMutation.mutate();
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    setError("");
    sendOtpMutation.mutate(email);
  };

  return (
    <AuthLayout title="Forgot password">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-5">
          <MockeefyLogo className="h-12 w-12" variant="brand" />
          <span className="text-2xl font-logo tracking-tight text-[#004fcb]">Mockeefy</span>
        </div>

        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === 1 && "Forgot password?"}
          {step === 2 && "Enter verification code"}
          {step === 3 && "Set new password"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {step === 1 && "Enter your email and we'll send you a code to reset your password."}
          {step === 2 && `We sent a 6-digit code to ${email}. Enter it below.`}
          {step === 3 && "Create a new secure password for your account."}
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={sendOtpMutation.isPending}
              />
            </div>
            <button type="submit" disabled={sendOtpMutation.isPending} className={btnPrimary}>
              {sendOtpMutation.isPending ? "Sending..." : "Send code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="otp" className={`${labelClass} text-center block`}>
                Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${inputClass} text-center text-lg tracking-[0.4em]`}
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-slate-400">Didn't receive it?</span>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={countdown > 0 || sendOtpMutation.isPending}
                  className="text-xs font-semibold text-[#004fcb] hover:text-blue-700 disabled:text-slate-400"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={verifyOtpMutation.isPending || otp.length !== 6} className={btnPrimary}>
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify code"}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setOtp(""); }}
              className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className={labelClass}>
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
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
            <button type="submit" disabled={resetPasswordMutation.isPending} className={btnPrimary}>
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/signin" className="font-semibold text-[#004fcb] hover:text-blue-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
