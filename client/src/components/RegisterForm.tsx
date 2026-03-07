// src/components/RegisterForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import api from '../lib/axios';
import { isAxiosError } from 'axios';
import { Card, CardContent } from "./ui/card";


import { GoogleLogin } from '@react-oauth/google';

interface FormData {
  email: string;

  otp: string;
  name: string;
  password: string;
  confirmPassword: string;
  googleId?: string;
}



export const RegisterForm = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    if (!credentialResponse.credential) {
      setError("Google sign in failed");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/google-signup", {
        token: credentialResponse.credential
      });

      if (response.data.exists) {
        setError("An account with this email already exists. Please sign in.");
        setIsLoading(false);
        return;
      }

      navigate("/complete-profile", {
        state: {
          email: response.data.googleData.email,
          googleId: response.data.googleData.googleId,
          name: response.data.googleData.name
        }
      });
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Google authentication failed. Please try again.");
      console.error(err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      await sendOtp();
      setIsLoading(false);
      setStep("otp");
      startCountdown();
    } catch (err) {
      setIsLoading(false);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.post("/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp
      });
      setIsLoading(false);
      navigate("/complete-profile", {
        state: {
          email: formData.email
        }
      });
    } catch (err: unknown) {
      setIsLoading(false);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid verification code");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid verification code");
      }
    }
  };



  const sendOtp = async () => {
    try {
      const response = await api.post("/api/auth/send-otp", {
        email: formData.email
      });
      return response.data;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        throw new Error(err.response?.data?.message || "Failed to send OTP");
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Failed to send OTP");
    }
  };

  const startCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError("");
    try {
      await sendOtp();
      setIsLoading(false);
      startCountdown();
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message || "Failed to resend OTP");
      } else {
        setError("Failed to resend OTP");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-sm">
        <Card className="w-full shadow-lg border-none bg-white overflow-hidden">
          <CardContent className="p-8">

            {/* Header: Logo + Title */}
            <div className="flex flex-col items-center justify-center mb-6 space-y-4">
              <div className="flex items-center justify-center gap-0 relative h-24">
                <img
                  src="/mockeefy.png"
                  alt="Mockeefy"
                  className="absolute h-[100px] w-auto object-contain mix-blend-multiply -ml-[140px]"
                />
                <span className="text-4xl font-bold tracking-tight text-[#004fcb] font-['Outfit'] ml-[40px] animate-fade-in">
                  Mockeefy
                </span>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {step === "email" ? "Create your account" : "Verify your email"}
                </h1>
                <p className="text-gray-500 text-xs text-balance">
                  {step === "email"
                    ? "Join thousands of professionals mastering interviews"
                    : `Enter verification code sent to ${formData.email}`}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                {error}
              </div>
            )}

            {step === "email" ? (
              <>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={e => handleInputChange("email", e.target.value)}
                      className="w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 text-sm"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition-all text-sm mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">Or join with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google authentication failed")}
                    theme="outline"
                    shape="rectangular"
                    width="330"
                    text="signup_with"
                    size="large"
                  />
                </div>
              </>
            ) : step === "otp" ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs font-semibold text-gray-700 text-center block">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={e => handleInputChange("otp", e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-10 text-center text-lg tracking-widest border-gray-300 focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-gray-400">
                      Didn't receive it?
                    </p>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition-all text-sm mt-2"
                  disabled={isLoading || formData.otp.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); }}
                  className="w-full text-xs text-center text-gray-500 hover:text-gray-700 font-medium"
                >
                  ← Use a different email
                </button>
              </form>

            ) : null}

            <div className="text-center pt-6">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link to="/signin" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default RegisterForm;
