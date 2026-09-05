// src/components/Login/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEnvelope,
  FaKey,
  FaSpinner,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import Image from "../../assets/LoginRegisterImage.jpg";
import { loginUser } from "../../config/api";

// ============================================================
// LOGIN COMPONENT
// ============================================================
const Login = ({ isModal = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ email: email.trim().toLowerCase(), password });
      const user = response.data.user;
      const token = response.data.token;

      // Restrict to EDITOR and USER roles only on this client portal
      if (user?.role === "ADMIN") {
        toast.error("Admin login is not allowed on this page. Please use the Admin login page.");
        setLoading(false);
        return;
      }

      // Save user to localStorage
      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user", JSON.stringify({ ...user, token }));
      toast.success("Login successful!");

      // Role Based Redirect
      if (user.role === "EDITOR") {
        window.location.replace("/dashboard/editor-overview");
      } else if (user.role === "USER") {
        window.location.replace("/dashboard/user-overview");
      } else {
        window.location.replace("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loginContent = (
    <div className="w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* ========== LEFT SIDE – IMAGE WITH OVERLAY ========== */}
      <div className="hidden md:flex md:w-5/12 relative overflow-hidden bg-[#18231c] min-h-[480px]">
        <img
          src={Image}
          alt="Photography"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#121c16]/90 via-[#18231c]/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-8 h-full text-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
                <MdPhotoCamera className="text-[#C9A96E] text-lg" />
              </div>
              <span className="text-white/80 text-xs tracking-[0.25em] uppercase font-light">
                The Wedding Sedding
              </span>
            </div>
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/30 text-[#C9A96E] text-[10px] font-bold uppercase tracking-wider mb-3">
              Client Portal
            </div>
            <h2 className="text-white text-3xl font-light tracking-[0.1em] leading-tight">
              WELCOME
              <br />
              <span className="font-bold text-[#C9A96E]">BACK</span>
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-10 h-0.5 bg-[#C9A96E]" />
              <span className="text-white/70 text-xs tracking-widest uppercase">
                Sign in to your account
              </span>
            </div>
          </div>
          <div className="flex justify-between text-white/40 text-[11px] tracking-widest uppercase">
            <span>✦ High-Res Gallery</span>
            <span>✦ Photo Books</span>
          </div>
        </div>
      </div>

      {/* ========== RIGHT SIDE – FORM ========== */}
      <div className="w-full md:w-7/12 p-6 sm:p-8 bg-white flex flex-col justify-center">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email or Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863]/15 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#5A7863] rounded border-slate-300"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-[#5A7863] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Sign In
              </>
            )}
          </button>

          {!isModal && (
            <p className="text-center text-xs text-slate-500 mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#5A7863] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" />
      {isModal ? (
        loginContent
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl overflow-hidden shadow-2xl rounded-3xl">
            {loginContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Login;