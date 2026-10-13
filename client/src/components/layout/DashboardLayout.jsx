// Layout.jsx - Premium SaaS-Grade Dashboard Layout (Responsive, Collapsible & Theme-aware)
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutUser } from "../../config/api";
import ProjectTimer from "../common/ProjectTimer";

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
  UserCheck,
  UserPlus,
  Menu,
  X,
  Bell,
  History,
  User as UserIcon,
  Briefcase,
  Sun,
  Moon,
} from "lucide-react";

function Layout({ roleType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Theme state: default to 'dark' as requested for that premium dark look
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Initialize and track theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1024) {
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

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
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
      localStorage.removeItem("token");
      toast.success("Logout Successfully");
      navigate("/");
    }
  };

  const adminNav = [
    { to: "/dashboard/admin-overview", label: "Overview", icon: Home },
    { to: "/dashboard/admin-hero", label: "Hero Banner", icon: LayoutTemplate },
    { to: "/dashboard/admin-stories", label: "Stories", icon: ScrollText },
    // { to: "/dashboard/photobooks-admin", label: "Photo Books", icon: BookImage },
    { to: "/dashboard/images-admin", label: "Image", icon: ImagePlus },
    { to: "/dashboard/admin-Films", label: "Films", icon: Clapperboard },
    // { to: "/dashboard/admin-PreWedding", label: "Pre-Wedding", icon: HeartHandshake },
    { to: "/dashboard/assign-work", label: "Assign Work", icon: Briefcase },
    { to: "/dashboard/admin-users", label: "Create Users", icon: UserPlus },
    { to: "/dashboard/admin-all-users", label: "Directory", icon: UserCheck },
  ];

  const editorNav = [
    { to: "/dashboard/editor-overview", label: "Overview", icon: Home },
    { to: "/dashboard/posts", label: "Posts", icon: FileText },
    { to: "/dashboard/editor-settings", label: "Settings", icon: Settings },
  ];

  const userNav = [
    { to: "/dashboard/user-overview", label: "Overview", icon: Home },
    { to: "/dashboard/my-projects", label: "My Projects", icon: FileText },
    { to: "/dashboard/gallery", label: "Gallery", icon: ImagePlus },
    { to: "/dashboard/corrections", label: "Corrections", icon: ScrollText },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { to: "/dashboard/timeline", label: "Timeline", icon: History },
    { to: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { to: "/dashboard/family-access", label: "Family Requests", icon: Users },
  ];

  const navItems =
    roleType === "ADMIN"
      ? adminNav
      : roleType === "EDITOR"
      ? editorNav
      : userNav;

  const isActive = (path) => location.pathname === path;

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((x) => x);
    return paths.map((path, idx) => {
      const label = path
        .replace(/-/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const to = `/${paths.slice(0, idx + 1).join("/")}`;
      const isLast = idx === paths.length - 1;
      return { label, to, isLast };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className={`${theme} dark-dashboard-container flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200 text-xs sm:text-sm`}>
      
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40
          bg-white dark:bg-[#0F172A] border-r border-slate-200/80 dark:border-slate-800
          transition-all duration-300 ease-in-out shadow-xs
          ${isSidebarOpen ? "w-56" : "w-16"}
        `}
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          navItems={navItems}
          isActive={isActive}
          handleLogout={handleLogout}
          onLinkClick={handleLinkClick}
        />
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      <div
        className={`
          lg:hidden fixed inset-0 z-50 transition-all duration-300
          ${isMobileOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}
        `}
      >
        {/* Backdrop overlay */}
        <div
          className={`
            fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300
            ${isMobileOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Sidebar container */}
        <aside
          className={`
            fixed left-0 top-0 h-screen w-56 bg-white dark:bg-[#0F172A] 
            border-r border-slate-200/80 dark:border-slate-800 shadow-2xl
            transition-transform duration-300 ease-in-out flex flex-col
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <SidebarContent
            isSidebarOpen={true}
            toggleSidebar={toggleSidebar}
            navItems={navItems}
            isActive={isActive}
            handleLogout={handleLogout}
            onLinkClick={handleLinkClick}
            isMobile
            closeMobile={() => setIsMobileOpen(false)}
          />
        </aside>
      </div>

      {/* Main Content Pane */}
      <div
        className={`
          flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300
          ${isSidebarOpen ? "lg:pl-56" : "lg:pl-16"}
        `}
      >
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 flex-shrink-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 h-14">
            
            {/* Left Section: Mobile Menu toggle & breadcrumbs */}
            <div className="flex items-center gap-3">
              {/* Phone only: hamburger menu button (laptop m hidden) */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Open mobile menu"
                title="Open menu"
              >
                <Menu size={18} />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {breadcrumbs.map((bc, idx) => (
                  <div key={bc.to} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                    {bc.isLast ? (
                      <span className="text-blue-700 dark:text-blue-300 font-semibold">{bc.label}</span>
                    ) : (
                      <Link to={bc.to} className="hover:text-slate-700 dark:hover:text-slate-300 transition">
                        {bc.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Section: Theme switch, notifications & user badge */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Project Timer Alert Button */}
              <ProjectTimer />

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Mock Notification Bell */}
              <div className="relative">
                <button
                  className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  onClick={() => navigate(roleType === "ADMIN" ? "/dashboard/admin-all-users" : "/dashboard/notifications")}
                >
                  <Bell size={15} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#0F172A]" />
                </button>
              </div>

              {/* User Avatar Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-bold truncate max-w-[95px] text-slate-800 dark:text-slate-200">{user.name || "User"}</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">{roleType}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-slate-50/70 dark:bg-[#0B0F19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------------------
function SidebarContent({
  isSidebarOpen,
  toggleSidebar,
  navItems,
  isActive,
  handleLogout,
  onLinkClick,
  isMobile = false,
  closeMobile,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand logo container */}
      <div className={`flex items-center ${isSidebarOpen ? "justify-between px-3.5" : "justify-center px-2"} h-14 border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0`}>
        {isSidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black tracking-widest text-slate-800 dark:text-slate-100 uppercase truncate">
                SHUTTER<span className="text-blue-600 dark:text-blue-400">STUDIO</span>
              </span>
            </div>

            {/* Collapse button on Desktop or Close button on Mobile */}
            {isMobile ? (
              <button
                onClick={closeMobile || toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </>
        ) : (
          /* When collapsed on desktop: prominent Open/Expand button */
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition-all duration-200 border border-blue-200 dark:border-blue-900/60 shadow-xs group mx-auto"
            title="Open Sidebar"
            aria-label="Open Sidebar"
          >
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Navigation menu items */}
      <nav className={`flex-1 ${isSidebarOpen ? "px-2" : "px-1.5"} py-3 space-y-1 overflow-y-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          if (!isSidebarOpen) {
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onLinkClick}
                className={`
                  flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-150 group relative
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800"
                  }
                `}
                title={item.label}
              >
                <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 group text-xs
                ${
                  active
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border-l-[3px] border-blue-600 dark:border-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 font-medium"
                }
              `}
            >
              <Icon
                className={`
                  w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-105
                  ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"}
                `}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer (Logout action) */}
      <div className="p-2 border-t border-slate-200/80 dark:border-slate-800 flex-shrink-0">
        {isSidebarOpen ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150 font-semibold text-xs"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150"
            title="Logout"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Layout;