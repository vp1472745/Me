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
const Login = () => {
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
      const response = await loginUser({ email, password });
      const user = response.data.user;
      const token = response.data.token;

      // Restrict to EDITOR and USER roles only
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

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="flex items-center justify-center bg-[#1a1a1a]  ">
        <div className="w-full max-w-5xl overflow-hidden shadow-2xl bg-white flex flex-col md:flex-row">
          
          {/* ========== LEFT SIDE – IMAGE WITH OVERLAY ========== */}
          <div className="hidden md:flex md:w-2/5 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Image})` }}>
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
                    Photography
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-white text-4xl font-light tracking-[0.15em] leading-tight">
                  WELCOME
                  <br />
                  BACK
                </h2>
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-[#C9A96E]" />
                  <span className="text-white/70 text-xs tracking-widest uppercase">
                    Log in to continue
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-white/40 text-xs tracking-widest uppercase">
                <span>✦ Fine art</span>
                <span>✦ Wedding</span>
                <span>✦ Portrait</span>
              </div>
            </div>
          </div>

          {/* ========== RIGHT SIDE – FORM ========== */}
          <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 overflow-y-auto  flex flex-col justify-center bg-white">
       

   

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#C9A96E] rounded border-slate-300"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#C9A96E] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#C9A96E] text-white font-semibold hover:bg-[#B8975E] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Login
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#C9A96E] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;