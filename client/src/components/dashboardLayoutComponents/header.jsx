// Header.jsx - Nature-inspired palette with micro-animations
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutUser } from "../../config/api";
import { LogOut, Camera } from "lucide-react";

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const user = localStorage.getItem("user");
    try {
      if (user) {
        await logoutUser();
      }
    } catch (error) {
      // silent fallback
    } finally {
      localStorage.removeItem("user");
      toast.success("Logout Successfully");
      navigate("/login");
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-[#DDE7D8]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Brand with Logo Animation */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#90AB8B] to-[#5A7863] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Camera className="w-5 h-5 text-white transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-1.5 leading-none">
            <span className="text-xl font-extrabold tracking-tight text-[#3B4953]">SHUTTER</span>
            <span className="text-xl font-light text-[#5A7863] tracking-tight">STUDIO</span>
          </div>
        </div>

    
        
      </div>
    </header>
  );
}

export default Header;