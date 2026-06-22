// Layout.jsx - Custom Wedding Theme Dashboard Layout
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
    { to: "/dashboard/admin-hero", label: "Create Hero Section", icon: Home },
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
    <div className="flex h-screen overflow-hidden bg-[#F7F9F4] text-[#3B4953]">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarWidth}
          bg-white flex flex-col
          fixed left-0 top-0 h-screen 
          border-r border-[#DDE7D8]
          transition-all duration-300 ease-in-out z-50
        `}
      >
        {/* Brand & Toggle Button */}
        <div className="p-4 border-b border-[#DDE7D8] flex items-center justify-between min-h-[73px]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate("/")}>
              <Camera className="w-6 h-6 text-[#5A7863] transition-transform duration-500 group-hover:rotate-12" />
              <div>
                <div className="flex items-center leading-none">
                  <span className="text-md font-extrabold tracking-tight text-[#3B4953]">SHUTTER</span>
                  <span className="text-md font-light text-[#5A7863] tracking-tight ml-0.5">STUDIO</span>
                </div>
                <p className="text-[10px] text-[#3B4953]/60 font-medium mt-0.5">Photography Mgmt</p>
              </div>
            </div>
          ) : (
            <Camera className="w-6 h-6 text-[#5A7863] mx-auto cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate("/")} />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-[#F7F9F4] hover:bg-[#EBF4DD] transition text-[#5A7863] border border-[#DDE7D8]"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
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
                      ? "bg-[#EBF4DD] text-[#5A7863] shadow-sm font-bold"
                      : "text-[#3B4953]/80 hover:text-[#5A7863] hover:bg-[#F7F9F4] font-medium"
                  }
                `}
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon
                  className={`
                    w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105
                    ${active ? "text-[#5A7863]" : "text-[#3B4953]/60 group-hover:text-[#5A7863]"}
                  `}
                />
                {isSidebarOpen && (
                  <span className="text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3 border-t border-[#DDE7D8]">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-[#3B4953]/80 hover:text-red-700 hover:bg-red-50
              transition-all duration-200 font-semibold text-sm
              ${!isSidebarOpen && "justify-center"}
            `}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport Wrapper */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F9F4] transition-all duration-300 ${contentMargin}`}>
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#DDE7D8] sticky top-0 z-40 flex-shrink-0">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-[#3B4953] flex items-center gap-2">
                {roleType === "ADMIN" ? "Administrator" : "Content Editor"}
                <span className="text-xs font-bold text-[#5A7863] bg-[#EBF4DD] px-2.5 py-0.5 rounded-full border border-[#90AB8B]/30 tracking-wide">
                  {roleType}
                </span>
              </h1>
              <p className="text-xs text-[#3B4953]/70 font-medium mt-0.5">
                Welcome back, {user?.name || "Photographer"}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-[#F7F9F4] hover:bg-[#EBF4DD] text-[#3B4953] hover:text-[#5A7863] px-4 py-1.5 rounded-xl transition border border-[#DDE7D8] font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ✅ Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;