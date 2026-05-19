import { useState, useEffect } from 'react';
import Logo from "../../assets/Logo.webp";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    "Stories",
    "Photobooks",
    "Images",
    "Films",
    "Pre-Weddings",
    "Music",
    "FAQ",
    "Contact"
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-[#f4f1eb] border-b border-gray-200 relative">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 lg:px-16 py-6">
        {/* LOGO */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="logo"
            className="w-[125px] lg:w-[150px] object-contain"
          />
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden lg:flex items-center gap-5 text-[10px] font-bold tracking-[3px] uppercase text-[#2f2f2f]">
          {menuItems.map((item) => (
            <li
              key={item}
              className="cursor-pointer hover:opacity-70 transition duration-300"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* MOBILE MENU ICON */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-3xl text-[#2f2f2f] focus:outline-none"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-[280px] bg-[#f4f1eb] shadow-xl animate-slide-in">
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <button
                onClick={closeMobileMenu}
                className="text-2xl text-[#2f2f2f] hover:opacity-70 transition"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            
            {/* Mobile Menu Items */}
            <ul className="flex flex-col items-start gap-6 px-8">
              {menuItems.map((item) => (
                <li
                  key={item}
                  onClick={closeMobileMenu}
                  className="cursor-pointer text-[13px] font-semibold tracking-[3px] uppercase text-[#2f2f2f] hover:opacity-70 transition duration-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;