

import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutUser } from "../../config/api";
import { 
  Home, 
  Settings, 
  FileText, 
  LogOut,
  Camera,
  Image as ImageIcon
} from "lucide-react";

function Layout({ roleType }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const permissions = user?.permissions || [];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("user");
      toast.success("Logout Successfully");
      navigate("/login");
    }
  };

  // Navigation items mapping
const adminNav = [
  {
    to: "/dashboard/admin-overview",
    label: "Overview",
    icon: Home,
    permission: null,
  },
  {
    to: "/dashboard/photobooks-admin",
    label: "PhotoBooks",
    icon: Camera,
    permission: null,
  },
  {
    to: "/dashboard/images-admin",
    label: "Images",
    icon: ImageIcon,
    permission: null,
  },
  {
    to: "/dashboard/admin-settings",
    label: "Settings",
    icon: Settings,
    permission: null,
  },
];

const editorNav = [
  {
    to: "/dashboard/editor-overview",
    label: "Overview",
    icon: Home,
    permission: "overview",
  },
  {
    to: "/dashboard/posts",
    label: "Posts",
    icon: FileText,
    permission: "posts",
  },
  {
    to: "/dashboard/editor-settings",
    label: "Settings",
    icon: Settings,
    permission: "settings",
  },
];

  const navItems = roleType === "ADMIN" ? adminNav : editorNav;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-stone-50 to-gray-100">
      {/* ==========================
          Sidebar - Photography Brand
      ========================== */}
      <aside className="w-72 bg-linear-to-b from-gray-900 to-gray-800 text-white shadow-2xl flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-xl font-black tracking-tighter">SHUTTER</span>
              <span className="text-xl font-light tracking-tighter">STUDIO</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Photography Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            if (item.permission && !permissions.includes(item.permission)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-amber-500/10 transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 group-hover:text-amber-400" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button (Mobile/Tablet friendly) */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================
          Main Content Area
      ========================== */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Header Bar */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-200">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {roleType === "ADMIN" ? "Administrator" : "Content Editor"}
                <span className="text-sm font-normal text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {roleType}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, {user?.name || "Photographer"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-gray-900 hover:bg-amber-700 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;