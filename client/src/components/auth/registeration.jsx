// src/components/Registration/Registration.jsx
import React, { useState } from "react";
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
} from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import Image from "../../assets/LoginRegisterImage.jpg";
import { sendOTP, registerUser } from "../../config/api"; // ✅ import actual API functions

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
You are responsible for maintaining the confidentiality of your account and password.

3. Privacy
Your personal data will be handled according to our Privacy Policy.

4. Prohibited Uses
You may not use the service for any unlawful purpose.

5. Termination
We reserve the right to terminate accounts that violate these terms.

6. Changes
We may update these terms at any time. Continued use constitutes acceptance.

Last updated: January 2026
`;

// ============================================================
// MAIN COMPONENT
// ============================================================
const Registration = ({ onSuccess }) => {
  const navigate = useNavigate();
  // --- Form fields ---
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // UI only (not sent to backend)
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // UI only
  const [phoneNumber, setPhoneNumber] = useState(""); // UI only
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // --- OTP states ---
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !username) {
      toast.error("Name and username are required");
      return;
    }
    if (!email) {
      toast.error("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }
    if (phoneNumber.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number (min 7 digits)");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      // Call actual sendOTP API
      const response = await sendOTP(email);
      toast.success(`OTP sent to ${email} successfully!`);
      setStep("otp");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Verify OTP and register user ---
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError(true);
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Prepare data for registration (only fields expected by backend)
      const userData = {
        name,
        email,
        role: "USER",
        otp, // the OTP entered by user
      };

      // Call actual register API
      const response = await registerUser(userData);

      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>
            <strong>{name}</strong> registered successfully!
          </span>
        </div>
      );

      // Reset form
      setName("");
      setUsername("");
      setEmail("");
      setCountryCode("+91");
      setPhoneNumber("");
      setTermsAccepted(false);
      setOtp("");
      setOtpError(false);
      setStep("form");

      // Redirect to login after a brief delay so toast can be read
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/login");
        }
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
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

  return (
    <>
      <ToastContainer position="top-right" />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative bg-white shadow-2xl max-w-lg w-full flex flex-col animate-fadeInUp rounded-3xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center text-slate-400"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {TERMS_CONTENT}
            </div>
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full h-11 rounded-xl bg-[#C9A96E] text-white font-semibold hover:bg-[#B8975E] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center bg-[#1a1a1a] min-h-screen p-4">
        <div className="w-full max-w-5xl overflow-hidden shadow-2xl bg-white rounded-3xl flex flex-col md:flex-row">
          
          {/* ========== LEFT SIDE – IMAGE WITH OVERLAY ========== */}
          <div className="hidden md:flex md:w-2/5 relative overflow-hidden min-h-[600px]">
            <img
              src={Image}
              alt="Photography"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

            <div className="relative z-10 flex flex-col justify-between p-8 h-full text-white">
              <div>
                <div className="flex items-center gap-2">
                  <MdPhotoCamera className="text-[#C9A96E] text-2xl" />
                  <span className="text-white/80 text-sm tracking-[0.3em] uppercase font-light">
                    The Wedding Sedding
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-white text-4xl font-light tracking-[0.15em] leading-tight">
                  CLICK FOR
                  <br />
                  YOUR SHOOT
                </h2>
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-[#C9A96E]" />
                  <span className="text-white/70 text-xs tracking-widest uppercase">
                    Capture the moment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========== RIGHT SIDE – FORM ========== */}
          <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 bg-white">
            {step === "form" ? (
              <form onSubmit={handleSendOtp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      We'll send a verification OTP to this email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-28">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full h-10 pl-9 pr-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition appearance-none"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter phone number"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed shadow-sm">
                    <strong>Note:</strong> Your password will be automatically generated based on your name and sent to your registered email address once an administrator approves your account.
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C9A96E] rounded border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                        className="text-[#C9A96E] font-semibold hover:underline"
                      >
                        Terms & Conditions
                      </button>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setName("");
                        setUsername("");
                        setEmail("");
                        setCountryCode("+91");
                        setPhoneNumber("");
                        setPassword("");
                        setTermsAccepted(false);
                        toast.info("Form cleared");
                      }}
                      className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium text-sm tracking-wide"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11 rounded-xl bg-[#C9A96E] text-white font-medium text-sm tracking-wide shadow-sm hover:bg-[#B8975E] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <FaUserPlus />
                          Register
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-sm text-slate-500 mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#C9A96E] font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              // ---- OTP Verification Step ----
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <FaEnvelope className="text-4xl text-[#C9A96E] mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    We've sent a 6‑digit OTP to <br />
                    <strong className="text-slate-800">{email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Enter OTP
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
                    placeholder="Enter 6-digit OTP"
                    className={`w-full h-12 px-4 rounded-xl border ${
                      otpError ? "border-rose-400 ring-rose-100" : "border-slate-200"
                    } bg-slate-50/80 text-slate-700 text-center text-xl tracking-widest font-mono outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition`}
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-xs text-rose-500 mt-1">
                      Invalid OTP. Please try again.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBackToForm}
                    className="px-4 h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium"
                  >
                    <FaArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="px-6 h-11 rounded-xl bg-[#C9A96E] text-white font-semibold hover:bg-[#B8975E] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Verify & Create
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center text-xs text-slate-400 mt-2">
                  Didn't receive OTP?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      // Resend OTP
                      setLoading(true);
                      sendOTP(email)
                        .then(() => {
                          toast.success(`OTP resent to ${email}`);
                        })
                        .catch((err) => {
                          toast.error(err.response?.data?.message || "Failed to resend OTP");
                        })
                        .finally(() => setLoading(false));
                    }}
                    className="text-[#C9A96E] hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Registration;