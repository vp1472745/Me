import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../../assets/Logo.webp";

const Navbar = () => {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const menuItems = [
    {
      name: "Stories",
      path: "/storyList",
    },
    {
      name: "Photobooks",
      path: "/photobooks",
    },
    {
      name: "Images",
      path: "/images",
    },
    {
      name: "Films",
      path: "/films",
    },
    {
      name: "Pre-Weddings",
      path: "/preweddings",
    },
    {
      name: "Music",
      path: "/music",
    },
    {
      name: "FAQ",
      path: "/faq",
    },
    {
      name: "Contact",
      path: "/contact",
    },
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

  return (
    <nav className="w-full bg-[#f4f1eb] border-b border-gray-200 relative">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 lg:px-16 py-6">
        
        {/* LOGO */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
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
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className="cursor-pointer hover:opacity-70 transition duration-300"
            >
              {item.name}
            </li>
          ))}
        </ul>

        {/* MOBILE MENU ICON */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-3xl text-[#2f2f2f] focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* PANEL */}
          <div className="absolute right-0 top-0 h-full w-[280px] bg-[#f4f1eb] shadow-xl animate-slide-in">
            
            {/* CLOSE BUTTON */}
            <div className="flex justify-end p-6">
              <button
                onClick={closeMobileMenu}
                className="text-2xl text-[#2f2f2f]"
              >
                ✕
              </button>
            </div>

            {/* MENU ITEMS */}
            <ul className="flex flex-col items-start gap-6 px-8">
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="cursor-pointer text-[13px] font-semibold tracking-[3px] uppercase text-[#2f2f2f]"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ANIMATION */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
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