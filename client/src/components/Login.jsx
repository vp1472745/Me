// Login.jsx - Premium SaaS-Grade Authentication Portal
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../config/api";
import { Camera, Lock, User, Loader2, ArrowRight } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await loginUser(formData);
      const userRole = response.data.user.role;

      // Save user session
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success(response.data.message || "Login successful!");

      // Role Based Redirect
      if (userRole === "ADMIN") {
        window.location.replace("/dashboard/admin-overview");
      } else if (userRole === "EDITOR") {
        window.location.replace("/dashboard/editor-overview");
      } else if (userRole === "USER") {
        window.location.replace("/dashboard/user-overview");
      } else {
        window.location.replace("/");
      }
    } catch (error) {
      console.error("ERROR:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Login Failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0A0A0C] text-zinc-100 font-sans">
      
      {/* LEFT PANEL: Premium Branding & Visual Showcase */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1613336026275-d6d473084e85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Soft dark radial vignette and blur */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090B] via-black/45 to-[#0A0A0C]/10 backdrop-blur-[2px]" />
        
        {/* Glowing visual effect in corner */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#5A7863]/20 dark:bg-[#A7D18C]/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#A7D18C]" />
            <span className="text-sm font-black tracking-widest uppercase">
              SHUTTER<span className="text-[#A7D18C]">STUDIO</span>
            </span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
              Capture the<br />Art of Moments
            </h1>
            <p className="text-sm text-zinc-300 font-medium leading-relaxed">
              Every photograph tells a unique story. Access our professional studio workspace to manage assignments, curate premium deliverables, and share high-resolution galleries.
            </p>
          </div>

          <div className="text-xs text-zinc-500 font-semibold">
            © {new Date().getFullYear()} Shutter Studio. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: SaaS-Grade Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-[#0A0A0C]">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo/Brand for Mobile view */}
          <div className="text-center lg:text-left space-y-2">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <Camera className="w-6 h-6 text-[#A7D18C]" />
              <span className="text-base font-black tracking-widest uppercase">
                SHUTTER<span className="text-[#A7D18C]">STUDIO</span>
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
            <p className="text-sm text-zinc-500 font-medium">
              Enter your credentials to access your console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Full Name / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. admin"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-zinc-800/80 rounded-xl text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-[#A7D18C]/20 focus:border-[#A7D18C] outline-none transition duration-150 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-zinc-800/80 rounded-xl text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-[#A7D18C]/20 focus:border-[#A7D18C] outline-none transition duration-150 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#A7D18C] to-[#86B66B] hover:shadow-lg hover:shadow-[#A7D18C]/15 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Verifying Access...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;