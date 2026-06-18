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
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200/50">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-800">SHUTTER</span>
            <span className="text-xl font-light text-indigo-600 tracking-tight">STUDIO</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 px-5 py-2 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-indigo-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;