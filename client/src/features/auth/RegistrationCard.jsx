// src/components/Registration/Registration.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaKey,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaUserPlus,
  FaTimes,
  FaRedo,
} from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import Image from "../../assets/LoginRegisterImage.jpg";
import { sendOTP, registerUser } from "../../config/api";

// ============================================================
// COUNTRY CODES (UI only)
// ============================================================
const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+82", country: "South Korea" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+41", country: "Switzerland" },
  { code: "+65", country: "Singapore" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+52", country: "Mexico" },
];

// ============================================================
// TERMS & CONDITIONS CONTENT
// ============================================================
const TERMS_CONTENT = `
Terms and Conditions

1. Acceptance of Terms
By creating an account, you agree to be bound by these terms.

2. User Accounts
You are responsible for maintaining the confidentiality of your account and credentials.

3. Deliverables & Galleries
Client galleries and deliverables will be safely synchronized to designated cloud storage.

4. Privacy Policy
Your email and personal information will be protected and used solely for studio communication.

5. Changes
We may update these terms at any time. Continued use constitutes acceptance.

Last updated: January 2026
`;

// ============================================================
// MAIN REGISTRATION COMPONENT
// ============================================================
const Registration = ({ onSuccess, isModal = false }) => {
  const navigate = useNavigate();

  // --- Form fields ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // --- OTP states ---
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // --- Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim();

    // Validation
    if (!trimmedName) {
      toast.error("Full name is required");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!trimmedPhone) {
      toast.error("Phone number is required");
      return;
    }
    if (trimmedPhone.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number (min 7 digits)");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await sendOTP(trimmedEmail);
      toast.success(
        response.data?.message || `Verification OTP sent to ${trimmedEmail}! Please check your inbox.`
      );
      setStep("otp");
      setResendCooldown(30);
    } catch (error) {
      console.error("Registration Send OTP Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP. Please check your email address and try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;

    setLoading(true);
    try {
      await sendOTP(trimmedEmail);
      toast.success(`New verification OTP sent to ${trimmedEmail}!`);
      setResendCooldown(30);
      setOtp("");
      setOtpError(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Verify OTP and register user ---
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setOtpError(true);
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "USER",
        otp: cleanOtp,
      };

      const response = await registerUser(userData);

      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>
            <strong>{name.trim()}</strong> registered successfully!
          </span>
        </div>
      );

      // Reset form
      setName("");
      setEmail("");
      setCountryCode("+91");
      setPhoneNumber("");
      setTermsAccepted(false);
      setOtp("");
      setOtpError(false);
      setStep("form");

      // Redirect or switch tab
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/login");
        }
      }, 1500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  const goBackToForm = () => {
    setStep("form");
    setOtp("");
    setOtpError(false);
  };

  // Form content markup
  const formContent = (
    <div className="w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* ========== LEFT SIDE – LUXURY BRAND IMAGE ========== */}
      <div className="hidden md:flex md:w-5/12 relative overflow-hidden bg-[#18231c] min-h-[500px]">
        <img
          src={Image}
          alt="Photography"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#121c16]/90 via-[#18231c]/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-8 h-full text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
              <MdPhotoCamera className="text-[#C9A96E] text-lg" />
            </div>
            <span className="text-white/90 text-xs tracking-[0.25em] uppercase font-medium">
              The Wedding Sedding
            </span>
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/30 text-[#C9A96E] text-[10px] font-bold uppercase tracking-wider mb-3">
              Photo & Cinematic Studio
            </div>
            <h2 className="text-white text-3xl font-light tracking-[0.1em] leading-tight">
              Capturing Timeless
              <br />
              <span className="font-bold text-[#C9A96E]">Moments & Memories</span>
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-0.5 bg-[#C9A96E]" />
              <span className="text-white/70 text-xs tracking-widest uppercase">
                Exclusive Studio Workspace
              </span>
            </div>
          </div>

          <div className="text-[11px] text-white/50 tracking-wider">
            © {new Date().getFullYear()} The Wedding Sedding
          </div>
        </div>
      </div>

      {/* ========== RIGHT SIDE – FORM CONTENT ========== */}
      <div className="w-full md:w-7/12 p-6 sm:p-8 bg-white flex flex-col justify-center">
        {step === "form" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vineet Pancheshwar"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A 6-digit verification OTP will be sent to this email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative w-28">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-11 pl-8 pr-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#5A7863] transition appearance-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 9876543210"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed">
              <strong>Account Setup Note:</strong> Your official login credentials will be automatically generated and emailed once your registration is approved.
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#5A7863] rounded border-slate-300 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-[#5A7863] font-semibold hover:underline"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#5A7863] text-white font-semibold text-sm tracking-wide shadow-sm hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Register & Send OTP
                  </>
                )}
              </button>
            </div>

            {!isModal && (
              <p className="text-center text-xs text-slate-500 mt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-[#5A7863] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </form>
        ) : (
          /* ---- OTP Verification Step ---- */
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-[#5A7863] flex items-center justify-center text-xl mb-2 shadow-inner">
                <FaKey />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Enter Verification OTP
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                We sent a 6-digit code to <strong className="text-slate-700">{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                  setOtpError(false);
                }}
                placeholder="• • • • • •"
                className={`w-full h-13 py-3 px-4 rounded-xl border ${
                  otpError ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
                } bg-slate-50/80 text-slate-800 text-center text-2xl tracking-[10px] font-mono outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition font-bold`}
                autoFocus
              />
              {otpError && (
                <p className="text-xs text-rose-500 mt-1 text-center font-medium">
                  Invalid OTP. Please check the code and try again.
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-center">
              💡 <em>Check your Spam / Junk folder if you don't see the email in Primary inbox within 30 seconds.</em>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Code valid for 5 min</span>
              {resendCooldown > 0 ? (
                <span className="text-slate-400 font-medium">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#5A7863] hover:underline font-bold flex items-center gap-1"
                >
                  <FaRedo size={10} /> Resend OTP
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={goBackToForm}
                className="px-4 h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 text-xs font-semibold"
              >
                <FaArrowLeft size={12} />
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 h-11 rounded-xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Verify & Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative bg-white shadow-2xl max-w-lg w-full flex flex-col rounded-3xl overflow-hidden z-10">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center text-slate-400"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
              {TERMS_CONTENT}
            </div>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full h-10 rounded-xl bg-[#5A7863] text-white font-semibold text-sm hover:bg-[#4A6853] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModal ? (
        formContent
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl overflow-hidden shadow-2xl rounded-3xl">
            {formContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Registration;