// Layout.jsx - Custom Wedding Theme Dashboard Layout (Fully Responsive)
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
  LayoutTemplate,
  ScrollText,
  BookImage,
  ImagePlus,
  Clapperboard,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  UserCheck ,
  Shield,
  Menu,
  X,
} from "lucide-react";

function Layout({ roleType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user?.permissions || [];

  // Desktop sidebar state: expanded (true) or collapsed icons-only (false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Mobile overlay sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle screen resize – collapse sidebar on small screens, expand on large
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setIsSidebarOpen(false);
        setIsMobileOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar: for desktop → expand/collapse; for mobile → open/close overlay
  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  // Close mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

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
    { to: "/dashboard/admin-hero", label: "Hero Content", icon: LayoutTemplate },
    { to: "/dashboard/admin-stories", label: "Stories", icon: ScrollText },
    { to: "/dashboard/photobooks-admin", label: "Photo Books", icon: BookImage },
    { to: "/dashboard/images-admin", label: "Gallery", icon: ImagePlus },
    { to: "/dashboard/admin-Films", label: "Films", icon: Clapperboard },
    { to: "/dashboard/admin-PreWedding", label: "Pre-Wedding", icon: HeartHandshake },
    { to: "/dashboard/admin-users", label: "Create Users", icon: Users },
    { to: "/dashboard/assign-work", label: "Assign Work", icon: UserCheck },

    // { to: "/dashboard/family-access", label: "Family Access", icon: UserPlus },
    // { to: "/dashboard/admin-family-requests", label: "Family Requests (Admin)", icon: Shield },
  ];

  const editorNav = [
    { to: "/dashboard/editor-overview", label: "Overview", icon: Home, permission: "overview" },
    { to: "/dashboard/posts", label: "Posts", icon: FileText, permission: "posts" },
    { to: "/dashboard/editor-settings", label: "Settings", icon: Settings, permission: "settings" },
  ];

  const navItems = roleType === "ADMIN" ? adminNav : editorNav;

  const isDesktop = window.innerWidth > 768;
  const isDesktopOpen = isSidebarOpen && isDesktop;
  const sidebarWidth = isDesktopOpen ? "w-72" : isDesktop ? "w-20" : "w-0";
  const contentMargin = isDesktopOpen ? "ml-72" : isDesktop ? "ml-20" : "ml-0";

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F9F4] text-[#3B4953]">
      {/* Desktop Sidebar (visible on large screens) */}
      {isDesktop && (
        <aside
          className={`
            ${sidebarWidth}
            bg-white flex flex-col
            fixed left-0 top-0 h-screen 
            border-r border-[#DDE7D8]
            transition-all duration-300 ease-in-out z-50
            shadow-sm
          `}
        >
          <SidebarContent
            isSidebarOpen={isDesktopOpen}
            toggleSidebar={toggleSidebar}
            navItems={navItems}
            isActive={isActive}
            handleLogout={handleLogout}
            navigate={navigate}
            onLinkClick={handleLinkClick}
          />
        </aside>
      )}

      {/* Mobile Sidebar (overlay) */}
      {!isDesktop && (
        <>
          {/* Backdrop */}
          {isMobileOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
          <aside
            className={`
              fixed left-0 top-0 h-screen z-50
              bg-white flex flex-col
              border-r border-[#DDE7D8]
              transition-transform duration-300 ease-in-out
              w-72
              ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
              shadow-xl
            `}
          >
            <SidebarContent
              isSidebarOpen={true} // always expanded on mobile
              toggleSidebar={toggleSidebar}
              navItems={navItems}
              isActive={isActive}
              handleLogout={handleLogout}
              navigate={navigate}
              onLinkClick={handleLinkClick}
              isMobile
            />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F9F4]
          transition-all duration-300
          ${contentMargin}
        `}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 flex-shrink-0 border-b border-[#E8E8E8] bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-[22px]">
            {/* Left: hamburger (mobile) + title */}
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-[#F7F9F4] transition-colors text-[#5A7863]"
                  aria-label="Toggle menu"
                >
                  {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
              <h1 className="text-[18px] font-semibold tracking-tight">
                {roleType === "ADMIN" ? (
                  <>
                    <span className="text-[#B8894B]">Admin</span>{" "}
                    <span className="text-[#3F4A56]">Dashboard</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#B8894B]">Content</span>{" "}
                    <span className="text-[#3F4A56]">Management</span>
                  </>
                )}
              </h1>
            </div>

            {/* Right: role badge */}
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#EEF6EC] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A7863]">
                {roleType}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto  sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sidebar Content – reused for both desktop and mobile
// ---------------------------------------------------------------------
function SidebarContent({
  isSidebarOpen,
  toggleSidebar,
  navItems,
  isActive,
  handleLogout,
  navigate,
  onLinkClick,
  isMobile = false,
}) {
  return (
    <>
      {/* Brand & Toggle Button */}
      <div className="p-1 border-b border-[#DDE7D8] flex items-center justify-between min-h-[73px]">
        {isSidebarOpen ? (
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <Camera className="w-6 h-6 text-[#5A7863] transition-transform duration-500 group-hover:rotate-12" />
            <div>
              <h2 className="text-[14px] font-extrabold tracking-wide">
                <span className="text-[#3B4953]">THE</span>{" "}
                <span className="text-[#B8894D]">WEDDING</span>{" "}
                <span className="text-[#3B4953]">SEDDING</span>
              </h2>
            </div>
          </div>
        ) : (
          <Camera className="w-6 h-6 text-[#5A7863] mx-auto cursor-pointer hover:scale-110 transition-transform" />
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
          if (item.permission && !window.user?.permissions?.includes(item.permission))
            return null;
          const Icon = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
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
              {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer – Logout Button */}
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
    </>
  );
}

export default Layout;