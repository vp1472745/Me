import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Registeration from "../auth/registeration";
import Login from "../auth/login";
import {
  FaTimes,
  FaUserPlus,
  FaSignInAlt,
  FaUserCircle,
} from "react-icons/fa";
import Logo from "../../assets/Logo.webp";

// ============================================================
// NAVBAR COMPONENT
// ============================================================
const Navbar = ({
  textColor = "text-white",
  mobileMenuBg = "bg-[#f4f1eb]",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // --- Auth Modal state ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // "signup" | "login"

  // --- Scroll effect ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Resize handler for mobile menu ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Body scroll lock for mobile menu ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // --- Body scroll lock for auth modal ---
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAuthModalOpen]);

  const menuItems = [
    { name: "Stories", path: "/storyList" },
    { name: "Images", path: "/images" },
    { name: "Films", path: "/films" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const isActive = (path) => location.pathname === path;

  // --- Open Auth Modal with mode ---
  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    closeMobileMenu();
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // --- Switch between signup and login tabs ---
  const switchAuthMode = (mode) => {
    setAuthMode(mode);
  };

  return (
    <>
      <ToastContainer position="top-right" />

      {/* ========== NAVBAR ========== */}
      <nav
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${scrolled
            ? "bg-[#f4f1eb]/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 lg:py-4">
          {/* LOGO */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={Logo}
              alt="Logo"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* DESKTOP MENU */}
          <ul
            className={`
              hidden lg:flex items-center gap-1 xl:gap-2
              ${scrolled ? "text-[#2f2f2f]" : textColor}
            `}
          >
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    relative px-4 py-2 text-[11px] font-medium tracking-[2.5px] uppercase
                    transition-all duration-300 hover:opacity-70
                    ${isActive(item.path) ? "opacity-100" : "opacity-80"}
                    group
                  `}
                >
                  {item.name}
                  <span
                    className={`
                      absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5
                      ${scrolled ? "bg-[#2f2f2f]" : "bg-white"}
                      transition-all duration-300 group-hover:w-full
                      ${isActive(item.path) ? "w-full" : ""}
                    `}
                  />
                </button>
              </li>
            ))}

            {/* Single "Account" button */}
            <li>
              <button
                onClick={() => openAuthModal("login")}
                className={`
                  flex items-center gap-2 px-5 py-2 text-[11px] font-medium tracking-[2.5px] uppercase
                  transition-all duration-300 rounded-full
                  ${scrolled
                    ? "bg-[#2f2f2f] text-white hover:bg-[#2f2f2f]/80"
                    : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
                  }
                `}
              >
                <FaUserCircle className="text-base" />
                Account
              </button>
            </li>
          </ul>

          {/* MOBILE MENU ICON */}
          <button
            onClick={toggleMobileMenu}
            className={`
              lg:hidden flex flex-col items-center justify-center gap-1.5 w-8 h-8
              transition-all duration-300 focus:outline-none
              ${scrolled ? "text-[#2f2f2f]" : textColor}
            `}
            aria-label="Toggle menu"
          >
            <span
              className={`
                block w-6 h-0.5 rounded-full transition-all duration-300
                ${scrolled ? "bg-[#2f2f2f]" : "bg-white"}
                ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}
              `}
            />
            <span
              className={`
                block w-6 h-0.5 rounded-full transition-all duration-300
                ${scrolled ? "bg-[#2f2f2f]" : "bg-white"}
                ${isMobileMenuOpen ? "opacity-0" : ""}
              `}
            />
            <span
              className={`
                block w-6 h-0.5 rounded-full transition-all duration-300
                ${scrolled ? "bg-[#2f2f2f]" : "bg-white"}
                ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}
              `}
            />
          </button>
        </div>
      </nav>

      {/* ========== MOBILE MENU OVERLAY ========== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div
            className={`
              absolute right-0 top-0 z-50 h-full w-[280px] sm:w-[320px]
              ${mobileMenuBg}
              shadow-2xl animate-slide-in pointer-events-auto
              flex flex-col
            `}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#2f2f2f]/5">
              <span className="text-[13px] font-semibold tracking-[3px] uppercase text-[#2f2f2f]/50">
                Menu
              </span>
              <button
                onClick={closeMobileMenu}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2f2f2f]/5 transition-colors duration-200 text-[#2f2f2f]"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4">
              <ul className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center justify-between px-4 py-3.5 rounded-xl
                        text-[14px] font-medium tracking-[2px] uppercase text-[#2f2f2f]
                        transition-all duration-200
                        ${isActive(item.path) ? "bg-[#2f2f2f]/5" : "hover:bg-[#2f2f2f]/5"}
                      `}
                    >
                      <span>{item.name}</span>
                      <svg className="w-4 h-4 text-[#2f2f2f]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}

                <li className="my-3 px-4">
                  <div className="h-px bg-[#2f2f2f]/10" />
                </li>

                {/* Single "Account" button in mobile menu */}
                <li>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#2f2f2f] text-white text-[14px] font-medium tracking-[2px] uppercase hover:bg-[#2f2f2f]/90 transition-all duration-200"
                  >
                    <FaUserCircle className="text-lg" />
                    Account
                  </button>
                </li>
              </ul>
            </div>

            <div className="p-6 border-t border-[#2f2f2f]/5">
              <p className="text-[10px] tracking-[2px] uppercase text-[#2f2f2f]/30 text-center">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AUTH MODAL – backdrop click does NOT close */}
      {/* ============================================================ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop – no onClick */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal Panel */}
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center text-slate-400 hover:text-slate-600 z-20"
            >
              <FaTimes />
            </button>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 flex-shrink-0">
              <button
                onClick={() => switchAuthMode("signup")}
                className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                  authMode === "signup"
                    ? "text-[#5A7863] border-b-2 border-[#5A7863]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaUserPlus className="inline mr-2" /> Sign Up
              </button>
              <button
                onClick={() => switchAuthMode("login")}
                className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                  authMode === "login"
                    ? "text-[#5A7863] border-b-2 border-[#5A7863]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaSignInAlt className="inline mr-2" /> Login
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              {authMode === "signup" ? <Registeration /> : <Login />}
            </div>
          </div>
        </div>
      )}

      {/* ========== ANIMATION STYLES ========== */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0%);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-in li {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .animate-slide-in li:nth-child(1) { animation-delay: 0.05s; }
        .animate-slide-in li:nth-child(2) { animation-delay: 0.10s; }
        .animate-slide-in li:nth-child(3) { animation-delay: 0.15s; }
        .animate-slide-in li:nth-child(4) { animation-delay: 0.20s; }
        .animate-slide-in li:nth-child(5) { animation-delay: 0.25s; }
        .animate-slide-in li:nth-child(6) { animation-delay: 0.30s; }
        .animate-slide-in li:nth-child(7) { animation-delay: 0.35s; }
        .animate-slide-in li:nth-child(8) { animation-delay: 0.40s; }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

export default Navbar;