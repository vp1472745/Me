import { useState } from "react";
import { toast } from "react-toastify";
import { loginUser } from "../config/api";

function Login() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ==========================
  // Handle Input Change
  // ==========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Handle Login Submission
  // ==========================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await loginUser(formData);

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(response.data.message);

      // ==========================
      // Role-Based Redirect
      // ==========================
      const userRole = response.data.user.role;

      if (userRole === "ADMIN") {
        window.location.href = "/admin-overview";
      } else if (userRole === "EDITOR") {
        window.location.href = "/editor-overview";
      } else {
        // Default redirect for other roles (e.g., customer, viewer)
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* ==========================
          Left Section - Photography Branding
          ========================== */}
      <div
        className="hidden md:flex md:w-1/2 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1613336026275-d6d473084e85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-6">
            <span className="text-4xl font-black tracking-tighter">SHUTTER</span>
            <span className="text-4xl font-light tracking-tighter">STUDIO</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Capture the<br />Art of Moments
          </h1>
          <p className="text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed">
            Every photograph tells a unique story. Join our community of visual
            storytellers and showcase your perspective.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-amber-400">📸</span>
              </div>
              <span className="text-gray-100">Professional Portfolio Tools</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-amber-400">🏆</span>
              </div>
              <span className="text-gray-100">Award-Winning Photography Network</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-amber-400">✨</span>
              </div>
              <span className="text-gray-100">Exclusive Editing Resources</span>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm italic text-gray-300">
              “Photography is the story I fail to put into words.”
            </p>
            <p className="text-xs text-gray-400 mt-1">— Destin Sparks</p>
          </div>
        </div>
      </div>

      {/* ==========================
          Right Section - Login Form
          ========================== */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="md:hidden text-center mb-8">
            <span className="text-3xl font-black tracking-tighter text-gray-900">SHUTTER</span>
            <span className="text-3xl font-light tracking-tighter text-gray-700">STUDIO</span>
            <p className="text-sm text-gray-500 mt-2">Sign in to continue</p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-8 lg:p-10 transition-all duration-300 hover:shadow-xl"
          >
            <div className="text-center mb-8">
              <div className="hidden md:block mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">📷</span>
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
            </div>

            {/* Name Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">👤</span>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 outline-none transition-all duration-200 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔒</span>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 outline-none transition-all duration-200 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-amber-700 hover:to-amber-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-amber-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-gray-300/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                Contact Admin
              </a>
            </div>

            {/* Decorative Line */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400">Professional Photography Network</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;