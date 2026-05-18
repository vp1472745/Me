// import { useNavigate } from "react-router-dom";

// import { toast } from "react-toastify";

// import { logoutUser } from "../../config/api";

// function Header() {

//   const navigate = useNavigate();

//   // ==========================
//   // Logout
//   // ==========================

//   const handleLogout = async () => {
//     const user = localStorage.getItem("user");
//     try {
//       // Only call backend if user exists
//       if (user) {
//         await logoutUser();
//       }
//     } catch (error) {
//       // Optionally log error, but proceed to clear localStorage
//       // console.error("Logout error:", error);
//     } finally {
//       // Always clear localStorage and redirect
//       localStorage.removeItem("user");
//       toast.success("Logout Successfully");
//       navigate("/login");
//     }
//   };

//   return (
//     <div className="bg-white shadow-md p-4 flex justify-between items-center">

//       <h1 className="text-2xl font-bold">
//         Common Header
//       </h1>

//       {/* Logout Button */}

//       <button
//         onClick={handleLogout}
//         className="bg-black text-white px-4 py-2 rounded-lg"
//       >
//         Logout
//       </button>

//     </div>
//   );
// }

// export default Header;


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
    <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-amber-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Camera className="w-7 h-7 text-amber-600" />
          <div>
            <span className="text-xl font-black tracking-tighter text-gray-800">SHUTTER</span>
            <span className="text-xl font-light tracking-tighter text-gray-600">STUDIO</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gray-900 hover:bg-amber-700 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;