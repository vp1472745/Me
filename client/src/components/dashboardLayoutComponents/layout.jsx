// Layout.jsx - Premium SaaS-Grade Dashboard Layout (Responsive, Collapsible & Theme-aware)
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutUser } from "../../config/api";
import ProjectTimer from "../commonComponents/ProjectTimer";

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
      if (width <= 1024) {
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
    if (window.innerWidth <= 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
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
    <div className={`${theme} dark-dashboard-container flex h-screen overflow-hidden bg-[#F7F9F4] dark:bg-[#09090B] text-zinc-800 dark:text-zinc-100 transition-colors duration-200`}>
      
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40
          bg-white dark:bg-[#121214] border-r border-[#DDE7D8] dark:border-[#1E1E22]
          transition-all duration-300 ease-in-out shadow-sm
          ${isSidebarOpen ? "w-64" : "w-20"}
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
            fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300
            ${isMobileOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Sidebar container */}
        <aside
          className={`
            fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#121214] 
            border-r border-[#DDE7D8] dark:border-[#1E1E22] shadow-2xl
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
          />
        </aside>
      </div>

      {/* Main Content Pane */}
      <div
        className={`
          flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300
          ${isSidebarOpen ? "lg:pl-64" : "lg:pl-20"}
        `}
      >
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 flex-shrink-0 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-[#DDE7D8] dark:border-[#1E1E22] transition-colors duration-200">
          <div className="flex items-center justify-between px-6 py-4">
            
            {/* Left Section: Sidebar toggle & breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-zinc-500 hover:text-[#5A7863] dark:hover:text-[#A7D18C] hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                {breadcrumbs.map((bc, idx) => (
                  <div key={bc.to} className="flex items-center gap-2">
                    {idx > 0 && <span>/</span>}
                    {bc.isLast ? (
                      <span className="text-zinc-700 dark:text-zinc-200">{bc.label}</span>
                    ) : (
                      <Link to={bc.to} className="hover:text-zinc-600 dark:hover:text-zinc-400">
                        {bc.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Section: Theme switch, notifications & user badge */}
            <div className="flex items-center gap-3">
              {/* Project Timer Alert Button */}
              <ProjectTimer />

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 transition"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Mock Notification Bell */}
              <div className="relative">
                <button
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 transition"
                  onClick={() => navigate(roleType === "ADMIN" ? "/dashboard/admin-all-users" : "/dashboard/notifications")}
                >
                  <Bell size={16} />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#121214]" />
                </button>
              </div>

              {/* User Avatar Badge */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800/80">
                <div className="w-8 h-8 rounded-full bg-[#EBF4DD] dark:bg-[#20271E] text-[#5A7863] dark:text-[#A7D18C] flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold truncate max-w-[100px] text-zinc-800 dark:text-zinc-200">{user.name || "User"}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">{roleType}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F7F9F4]/40 dark:bg-[#09090B]">
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
}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex flex-col h-full">
      {/* Brand logo container */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#DDE7D8] dark:border-[#1E1E22]">
        {isSidebarOpen ? (
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#5A7863] dark:text-[#A7D18C]" />
            <span className="text-[12px] font-extrabold tracking-widest text-zinc-800 dark:text-zinc-100 uppercase">
              SHUTTER<span className="text-[#5A7863] dark:text-[#A7D18C]">STUDIO</span>
            </span>
          </div>
        ) : (
          <Camera className="w-5 h-5 text-[#5A7863] dark:text-[#A7D18C] mx-auto" />
        )}

        {/* Collapse icon (Desktop only) */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      {/* Navigation menu items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${!isSidebarOpen && "justify-center"}
                ${
                  active
                    ? "bg-[#EBF4DD] dark:bg-[#1E2519] text-[#5A7863] dark:text-[#A7D18C] font-extrabold shadow-sm border-l-4 border-[#5A7863] dark:border-[#A7D18C]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-[#5A7863] dark:hover:text-[#A7D18C] hover:bg-[#EBF4DD]/30 dark:hover:bg-[#1E2519]/25 font-semibold text-sm"
                }
              `}
              title={!isSidebarOpen ? item.label : ""}
            >
              <Icon
                className={`
                  w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                  ${active ? "text-[#5A7863] dark:text-[#A7D18C]" : "text-zinc-400 dark:text-zinc-500 group-hover:text-[#5A7863] dark:group-hover:text-[#A7D18C]"}
                `}
              />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer (Logout action) */}
      <div className="p-3 border-t border-[#DDE7D8] dark:border-[#1E1E22]">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-3 rounded-xl
            text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 
            hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150 font-bold text-sm
            ${!isSidebarOpen && "justify-center"}
          `}
          title={!isSidebarOpen ? "Logout" : ""}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Layout;