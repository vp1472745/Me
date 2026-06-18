import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutUser } from "../../config/api";
import {
  Home,
  Settings,
  FileText,
  LogOut,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Layout({ roleType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user?.permissions || [];

  // Sidebar state: open = expanded, false = collapsed (icons only)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // On mount, set initial state based on screen width
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  // Navigation items
  const adminNav = [
    { to: "/dashboard/admin-stories", label: "Create Stories", icon: Home },
    { to: "/dashboard/photobooks-admin", label: "Create PhotoBooks", icon: Camera },
    { to: "/dashboard/images-admin", label: "Create Images", icon: ImageIcon },
    { to: "/dashboard/admin-Films", label: "Create Films", icon: Settings },
    { to: "/dashboard/admin-PreWedding", label: "Create PreWedding", icon: Camera },
  ];

  const editorNav = [
    { to: "/dashboard/editor-overview", label: "Overview", icon: Home, permission: "overview" },
    { to: "/dashboard/posts", label: "Posts", icon: FileText, permission: "posts" },
    { to: "/dashboard/editor-settings", label: "Settings", icon: Settings, permission: "settings" },
  ];

  const navItems = roleType === "ADMIN" ? adminNav : editorNav;

  // Sidebar width classes
  const sidebarWidth = isSidebarOpen ? "w-72" : "w-20";
  const contentMargin = isSidebarOpen ? "ml-72" : "ml-20";

  // Helper to check if a path is active (exact match)
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarWidth}
          bg-white  flex flex-col
          fixed left-0 top-0 h-screen 
          border-r border-gray-200
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Brand & Toggle Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <Camera className="w-7 h-7 text-indigo-600" />
              <div>
                <span className="text-lg font-black text-gray-800">SHUTTER</span>
                <span className="text-lg font-light text-indigo-600">STUDIO</span>
                <p className="text-[10px] text-gray-400">Photography Mgmt</p>
              </div>
            </div>
          ) : (
            <Camera className="w-7 h-7 text-indigo-600 mx-auto" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.permission && !permissions.includes(item.permission)) return null;
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${!isSidebarOpen && "justify-center"}
                  ${
                    active
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                  }
                `}
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon
                  className={`
                    w-5 h-5 flex-shrink-0
                    ${active ? "text-indigo-600" : "group-hover:text-indigo-600"}
                  `}
                />
                {isSidebarOpen && (
                  <span className={`font-medium text-sm ${active ? "text-indigo-700" : ""}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-gray-600 hover:text-red-700 hover:bg-red-50
              transition-all duration-200
              ${!isSidebarOpen && "justify-center"}
            `}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 transition-all duration-300 ${contentMargin}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
          <div className="flex justify-between items-center px-6 py-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {roleType === "ADMIN" ? "Administrator" : "Content Editor"}
                <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                  {roleType}
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Welcome back, {user?.name || "Photographer"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-xl transition  text-sm border border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ✅ Scrollable Outlet – only this part scrolls */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;