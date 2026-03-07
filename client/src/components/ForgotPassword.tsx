
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from '../lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ChevronRight, ArrowLeft, KeyRound, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// --- Zod Schemas ---
const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // --- Step 1: Send OTP ---
    const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
    });

    const sendOtpMutation = useMutation({
        mutationFn: async (data: EmailFormValues) => {
            const response = await axios.post('/api/auth/send-otp', { email: data.email });
            return response.data;
        },
        onSuccess: (_, variables) => {
            setEmail(variables.email);
            setStep(2);
            toast.success("OTP sent to your email!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        },
    });

    const onEmailSubmit = (data: EmailFormValues) => {
        sendOtpMutation.mutate(data);
    };


    // --- Step 2: Verify OTP ---
    const {
        handleSubmit: handleSubmitOtp,
        setValue: setOtpValue,
        watch: watchOtp,
        formState: { errors: otpErrors }
    } = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
    });

    const otpValue = watchOtp("otp");

    const verifyOtpMutation = useMutation({
        mutationFn: async (data: OtpFormValues) => {
            const response = await axios.post('/api/auth/verify-otp', {
                email,
                otp: data.otp
            });
            return response.data; // Expect { message, resetToken }
        },
        onSuccess: (data) => {
            if (data.resetToken) {
                setResetToken(data.resetToken);
                setStep(3);
                toast.success("OTP verified!");
            } else {
                toast.error("Verified, but no reset token received. Please try again.");
            }
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Invalid OTP");
        },
    });

    const onOtpSubmit = (data: OtpFormValues) => {
        verifyOtpMutation.mutate(data);
    };


    // --- Step 3: Reset Password ---
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormValues) => {
            const response = await axios.post('/api/auth/reset-password', {
                resetToken,
                newPassword: data.password
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password reset successfully! Redirecting to login...");
            setTimeout(() => navigate('/signin'), 2000);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to reset password");
        },
    });

    const onPasswordSubmit = (data: PasswordFormValues) => {
        resetPasswordMutation.mutate(data);
    };


    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-sm">
                <Card className="w-full shadow-lg border-none bg-white overflow-hidden">
                    <CardContent className="p-8">

                        {/* Consolidated Header: Logo + Back Link */}
                        <div className="flex flex-col items-center justify-center mb-6 space-y-4">
                            {/* Back to Sign In Link */}
                            <div className="w-full flex justify-start">
                                <Link to="/signin" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                                </Link>
                            </div>

                            {/* Logo matching Navigation */}
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
                                    {step === 1 && "Forgot password?"}
                                    {step === 2 && "Enter verification code"}
                                    {step === 3 && "Set new password"}
                                </h1>
                                <p className="text-gray-500 text-xs">
                                    {step === 1 && "Enter your email address and we'll send you a code to reset your password."}
                                    {step === 2 && `We sent a 6-digit code to ${email}. Enter it below.`}
                                    {step === 3 && "Create a new secure password for your account."}
                                </p>
                            </div>
                        </div>

                        {/* Error Message Area */}
                        {sendOtpMutation.error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                                {(sendOtpMutation.error as any)?.response?.data?.message || "Failed to send OTP"}
                            </div>
                        )}

                        {verifyOtpMutation.error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                                {(verifyOtpMutation.error as any)?.response?.data?.message || "Failed to verify OTP"}
                            </div>
                        )}

                        {resetPasswordMutation.error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md font-medium text-center">
                                {(resetPasswordMutation.error as any)?.response?.data?.message || "Failed to reset password"}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"

                                        type="email"
                                        autoComplete="username"
                                        placeholder="name@company.com"
                                        className="w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                        {...registerEmail("email")}
                                        disabled={sendOtpMutation.isPending}
                                    />
                                    {emailErrors.email && <p className="text-sm text-red-500">{emailErrors.email.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm hover:shadow transition-all text-sm mt-2"
                                    disabled={sendOtpMutation.isPending}
                                >
                                    {sendOtpMutation.isPending ? "Sending..." : "Send Code"}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
                                <div className="space-y-2 flex flex-col items-center justify-center">
                                    <Label htmlFor="otp" className="text-xs font-semibold text-gray-700">
                                        Verification Code
                                    </Label>
                                    <InputOTP
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={(val) => setOtpValue("otp", val)}
                                        disabled={verifyOtpMutation.isPending}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    {otpErrors.otp && <p className="text-sm text-red-500">{otpErrors.otp.message}</p>}
                                </div>
                                <div className="text-center text-sm">
                                    <span className="text-gray-500">Didn't receive code? </span>
                                    <button
                                        type="button"
                                        onClick={() => sendOtpMutation.mutate({ email })}
                                        className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                        disabled={sendOtpMutation.isPending}
                                    >
                                        Resend
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm hover:shadow transition-all text-sm"
                                    disabled={verifyOtpMutation.isPending}
                                >
                                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                                </Button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-10 border-gray-300 rounded-md shadow-sm pr-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                            {...registerPassword("password")}
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
                                    {passwordErrors.password && <p className="text-sm text-red-500">{passwordErrors.password.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-10 border-gray-300 rounded-md shadow-sm pr-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                            {...registerPassword("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm hover:shadow transition-all text-sm mt-2"
                                    disabled={resetPasswordMutation.isPending}
                                >
                                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
