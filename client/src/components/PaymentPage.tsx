import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Calendar, Clock, Video, ShieldCheck, Zap } from "lucide-react";
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
  const { user } = useAuth();
  const bookingDetails = location.state?.bookingDetails;

  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(false);
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

  const basePrice = bookingDetails ? parsePrice(bookingDetails.price) : 0;

  const orderSummary = {
    productName: bookingDetails
      ? `${bookingDetails.category} Mock Interview`
      : "Premium Subscription",
    plan: bookingDetails
      ? `${bookingDetails.duration} Min Session with ${bookingDetails.expertName}`
      : "Annual Plan",
    basePrice: basePrice,
    discount: appliedDiscount ? Math.floor(basePrice * 0.25) : 0,
    gst: Math.floor(basePrice * 0.18),
    get total() {
      return this.basePrice - this.discount + this.gst;
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
        const [startStr] = bookingDetails.slot.time.split(" - ");
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
        bookingDetails: {
          expertId: bookingDetails?.expertId,
          candidateId: user?.id || user?.userId,
          startTime: startTimeISO,
          endTime: endTimeISO,
          price: orderSummary.total,
          topics: [bookingDetails?.category || "General Mock Interview"],
          duration: bookingDetails?.duration,
          notes: "Booked via Payment Page"
        }
      });

      if (verifyResponse.data.success) {
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
    if (discountCode.trim() === "SAVE25") {
      setAppliedDiscount(true);
      Swal.fire({ title: "Applied!", text: "25% discount added!", icon: "success", timer: 1500 });
    } else {
      Swal.fire({ title: "Invalid", text: "Code not found", icon: "error" });
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

                <div className="flex justify-center items-center space-x-6 pt-4 border-t border-gray-50">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/800px-UPI-Logo.png" alt="UPI" className="h-4 grayscale hover:grayscale-0 transition-opacity opacity-60" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 grayscale hover:grayscale-0 transition-opacity opacity-60" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="MC" className="h-5 grayscale hover:grayscale-0 transition-opacity opacity-60" />
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
              {appliedDiscount && <p className="text-green-600 text-sm font-medium mt-2">✓ 25% discount applied!</p>}
            </div>
          </div>

          {/* Detailed Summary Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-900/5 border border-gray-100 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Details</h3>
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

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Base Amount</span>
                <span>₹{orderSummary.basePrice}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>GST (18%)</span>
                <span>₹{orderSummary.gst}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>Discount</span>
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
            <h2 className="text-3xl font-black text-gray-900 mb-2">Booking Success!</h2>
            <p className="text-gray-500 mb-2 leading-relaxed">
              Your session has been successfully scheduled. Check your email for details.
            </p>
            {transactionId && (
              <p className="text-xs text-gray-400 mb-8 font-mono">
                Transaction ID: {transactionId}
              </p>
            )}
            <div className="w-full space-y-3">
              <button
                onClick={() => navigate("/my-sessions")}
                className="w-full bg-[#004fcb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Go to My Sessions
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;