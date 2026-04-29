import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Calendar, Clock, Video, ShieldCheck, Zap, Sparkles, CreditCard, Smartphone, Landmark } from "lucide-react";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchProfile } = useAuth();
  const bookingDetails = location.state?.bookingDetails;
  const upgradeType = location.state?.upgradeType;

  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(false);
  const [appliedFreePromo, setAppliedFreePromo] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [transactionId, setTransactionId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Parse price from string (e.g. "₹500") if needed
  const parsePrice = (price: string | number) => {
    if (typeof price === "number") return price;
    if (typeof price === "string")
      return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
    return 0;
  };

  // Set base price to 1 INR for premium upgrade testing
  const basePrice = upgradeType === 'premium' ? 1 : (bookingDetails ? parsePrice(bookingDetails.price) : 0);

  const gstAmount = Math.floor(basePrice * 0.18);
  const discountAmount = appliedFreePromo
    ? basePrice + gstAmount
    : appliedDiscount
      ? Math.floor(basePrice * 0.25)
      : 0;

  const orderSummary = {
    productName: upgradeType === 'premium' 
      ? "Premium Membership" 
      : (bookingDetails ? `${bookingDetails.skill || bookingDetails.category} Mock Interview` : "Premium Subscription"),
    plan: upgradeType === 'premium'
      ? "LIFETIME - 3 Free Interviews"
      : (bookingDetails ? `${bookingDetails.duration} Min Session with ${bookingDetails.expertName}` : "Annual Plan"),
    basePrice: basePrice,
    discount: discountAmount,
    gst: gstAmount,
    get total() {
      return Math.max(0, this.basePrice - this.discount + this.gst);
    },
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsProcessing(true);
      // 1. Verify Payment & Create Session on Backend
      let startTimeISO = new Date().toISOString();
      let endTimeISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      if (bookingDetails?.date && bookingDetails?.slot?.time) {
        const dateObj = new Date(bookingDetails.date);
        const timeParts = bookingDetails.slot.time.split(/\s*[-–]\s*/);
        const startStr = timeParts[0];
        const [time, period] = startStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        dateObj.setHours(hours, minutes, 0, 0);
        startTimeISO = dateObj.toISOString();
        const duration = bookingDetails.duration || 60;
        endTimeISO = new Date(dateObj.getTime() + duration * 60000).toISOString();
      }

      const verifyResponse = await axios.post('/api/payment/verify-payment', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        paymentType: upgradeType === 'premium' ? 'subscription' : 'booking',
        bookingDetails: upgradeType === 'premium' ? null : {
          expertId: bookingDetails?.expertId,
          candidateId: user?.id || user?.userId,
          startTime: startTimeISO,
          endTime: endTimeISO,
          price: orderSummary.total,
          topics: Array.isArray(bookingDetails?.topics) && bookingDetails.topics.length
            ? bookingDetails.topics
            : [bookingDetails?.skill || bookingDetails?.category || "General Mock Interview"],
          duration: bookingDetails?.duration,
          notes: "Booked via Payment Page"
        }
      });

      if (verifyResponse.data.success) {
        await fetchProfile(); // Refresh user state (isPremium, credits)
        setPaymentStatus("success");
        setTransactionId(response.razorpay_payment_id);
        setShowSuccessModal(true);
      } else {
        throw new Error("Payment verification failed.");
      }
    } catch (err: any) {
      console.error("Verification Error:", err);
      setPaymentStatus("error");
      setErrors({ submit: err.message || "Failed to process payment." });
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to process payment.",
        icon: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      const orderResponse = await axios.post('/api/payment/create-order', {
        amount: orderSummary.total,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      });

      const { order } = orderResponse.data;

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay Key is missing from Vite Environment!");
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Mockeefy",
        description: orderSummary.productName,
        order_id: order.id,
        handler: handlePaymentSuccess,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#004fcb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment Initiation Error:", err);
      setPaymentStatus("error");
      setErrors({ submit: err.message || "Payment initiation failed." });
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (code === "FREE100" || code === "MOCKEEFYFREE") {
      setAppliedFreePromo(true);
      setAppliedDiscount(false);
      Swal.fire({ title: "Applied!", text: "Free session — no payment required!", icon: "success", timer: 2000 });
    } else if (code === "SAVE25") {
      setAppliedDiscount(true);
      setAppliedFreePromo(false);
      Swal.fire({ title: "Applied!", text: "25% discount added!", icon: "success", timer: 1500 });
    } else {
      Swal.fire({ title: "Invalid", text: "Code not found", icon: "error" });
    }
  };

  const buildBookingPayload = () => {
    let startTimeISO = new Date().toISOString();
    let endTimeISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    if (bookingDetails?.date && bookingDetails?.slot?.time) {
      const dateObj = new Date(bookingDetails.date);
      const timeParts = bookingDetails.slot.time.split(/\s*[-–]\s*/);
      const startStr = timeParts[0];
      const [time, period] = startStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      dateObj.setHours(hours, minutes, 0, 0);
      startTimeISO = dateObj.toISOString();
      const duration = bookingDetails.duration || 60;
      endTimeISO = new Date(dateObj.getTime() + duration * 60000).toISOString();
    }
    return {
      expertId: bookingDetails?.expertId,
      candidateId: user?.id || user?.userId || (user as any)?._id,
      startTime: startTimeISO,
      endTime: endTimeISO,
      topics: Array.isArray(bookingDetails?.topics) && bookingDetails.topics.length
        ? bookingDetails.topics
        : [bookingDetails?.skill || bookingDetails?.category || "General Mock Interview"],
      duration: bookingDetails?.duration,
      skill: bookingDetails?.skill,
      category: bookingDetails?.category,
      notes: "Booked with free promo code",
    };
  };

  const handleConfirmFreeBooking = async () => {
    if (orderSummary.total > 0) return;
    setIsProcessing(true);
    try {
      if (upgradeType === 'premium') {
        const res = await axios.post("/api/payment/create-free-subscription", {
          userId: user?.id || user?.userId || (user as any)?._id
        });
        if (res.data?.success) {
          if (fetchProfile) await fetchProfile();
          setPaymentStatus("success");
          setTransactionId("FREE-PREMIUM-" + Date.now());
          setShowSuccessModal(true);
        } else {
          throw new Error(res.data?.message || "Free subscription failed");
        }
      } else {
        const payload = buildBookingPayload();
        const res = await axios.post("/api/payment/create-free-booking", {
          bookingDetails: payload,
        });
        if (res.data?.success) {
          setPaymentStatus("success");
          setTransactionId(res.data.sessionId || "FREE");
          setShowSuccessModal(true);
        } else {
          throw new Error(res.data?.message || "Free booking failed");
        }
      }
    } catch (err: any) {
      setPaymentStatus("error");
      const errorMessage = err.response?.data?.message || err.message || "Failed to confirm free transaction.";
      setErrors({ submit: errorMessage });
      Swal.fire({ title: "Error", text: errorMessage, icon: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Secure Checkout</span>
          </div>
        </header>

        {paymentStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center text-red-700">
            <ShieldCheck className="w-5 h-5 mr-3 text-red-500" />
            <span className="font-medium text-sm">Payment failed: {Object.values(errors)[0] || "Please check your Razorpay keys in .env"}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Payment CTA Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
              <p className="text-gray-500 mb-8">One-click secure payment. Choose between UPI, Cards, or Netbanking in the next step.</p>

              <div className="space-y-4">
                {orderSummary.total === 0 ? (
                  <button
                    onClick={handleConfirmFreeBooking}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 fill-current" />
                        Confirm free booking
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleInitiatePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#004fcb] text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2 fill-current" />
                        Proceed to Pay ₹{orderSummary.total}
                      </>
                    )}
                  </button>
                )}

                <div className="flex justify-center items-center space-x-6 pt-6 border-t border-gray-50 text-gray-400">
                  <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-[#004fcb] transition-all cursor-default">
                    <Smartphone className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">UPI</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-[#004fcb] transition-all cursor-default">
                    <CreditCard className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">Cards</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-[#004fcb] transition-all cursor-default">
                    <Landmark className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">Banking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Section */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
              <label className="block text-sm font-semibold text-blue-900 mb-3">Have a discount code?</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                  onClick={handleApplyDiscount}
                  className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedFreePromo && <p className="text-green-600 text-sm font-medium mt-2">✓ Free session — no payment required!</p>}
              {appliedDiscount && !appliedFreePromo && <p className="text-green-600 text-sm font-medium mt-2">✓ 25% discount applied!</p>}
            </div>
          </div>

          {/* Detailed Summary Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-900/5 border border-gray-100 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {upgradeType === 'premium' ? "Plan Details" : "Booking Details"}
            </h3>
            
            {upgradeType === 'premium' ? (
              <div className="space-y-4 mb-8">
                <div className="flex flex-col p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl relative overflow-hidden">
                  <Sparkles className="w-24 h-24 text-blue-500/10 absolute -right-6 -bottom-6" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-10 h-10 bg-[#004fcb] rounded-xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-bold leading-tight">Lifetime Membership</h4>
                      <p className="text-[10px] uppercase font-bold text-[#004fcb] tracking-wider">Premium Access</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 relative z-10">Unlock all Mockeefy advanced features and fast-track your interview preparation with priority options.</p>
                  <ul className="space-y-2.5 relative z-10">
                    <li className="flex items-start text-xs text-gray-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#004fcb] mr-2 shrink-0" /> 
                      <span><strong>3 Free Integrations</strong> — Use to book any Mock Interview session for free.</span>
                    </li>
                    <li className="flex items-start text-xs text-gray-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#004fcb] mr-2 shrink-0" /> 
                      <span><strong>Verified Certificates</strong> — Share authentic interview badges directly to your LinkedIn.</span>
                    </li>
                    <li className="flex items-start text-xs text-gray-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#004fcb] mr-2 shrink-0" /> 
                      <span><strong>Priority Matching</strong> — Get matched with top 1% industry experts faster.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                  <Video className="w-10 h-10 text-blue-600 p-2 bg-blue-100 rounded-xl mr-4" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{orderSummary.productName}</p>
                    <p className="text-xs text-gray-500">{bookingDetails?.expertName || "Expert Session"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <Calendar className="w-4 h-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-bold text-gray-900">{bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString() : "TBD"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <Clock className="w-4 h-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-bold text-gray-900">{bookingDetails?.slot?.time || "TBD"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Base Amount</span>
                <span>₹{orderSummary.basePrice}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>GST (18%)</span>
                <span>₹{orderSummary.gst}</span>
              </div>
              {(appliedDiscount || appliedFreePromo) && (
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>{appliedFreePromo ? "Free promo" : "Discount"}</span>
                  <span>-₹{orderSummary.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 text-xl font-black pt-4">
                <span>Total</span>
                <span>₹{orderSummary.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {upgradeType === 'premium' ? "Welcome to Premium!" : "Booking Success!"}
            </h2>
            <p className="text-gray-500 mb-2 leading-relaxed">
              {upgradeType === 'premium' 
                ? "Your Mockeefy Premium Membership is now active. You have 3 credits to book sessions for free!" 
                : "Your session has been successfully scheduled. Check your email for details."}
            </p>
            {transactionId && (
              <p className="text-xs text-gray-400 mb-8 font-mono">
                Transaction ID: {transactionId}
              </p>
            )}
            <div className="w-full space-y-3">
              {upgradeType !== 'premium' && (
                <button
                  onClick={() => navigate("/my-sessions")}
                  className="w-full bg-[#004fcb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Go to My Sessions
                </button>
              )}
              <button
                onClick={() => navigate(upgradeType === 'premium' ? "/dashboard" : "/")}
                className="w-full bg-[#004fcb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 md:bg-gray-50 md:text-gray-600 md:shadow-none"
              >
                {upgradeType === 'premium' ? "Go to Dashboard" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;