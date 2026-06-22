// Sidebar.jsx - Custom Nature-inspired Wedding Dashboard Sidebar
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleType = user?.role;
  const permissions = user?.permissions || [];
  const location = useLocation();

  // Helper to check if a path is active (exact match)
  const isActive = (path) => location.pathname === path;

  // Base link classes – shared for all links
  const baseLinkClass =
    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border font-semibold text-sm";

  // Active & inactive variants
  const getLinkClass = (path) => {
    const active = isActive(path);
    return `
      ${baseLinkClass}
      ${
        active
          ? "bg-[#EBF4DD] text-[#5A7863] border-[#90AB8B]/40 shadow-sm"
          : "bg-[#F7F9F4] text-[#3B4953]/80 border-[#DDE7D8] hover:bg-[#EBF4DD]/50 hover:text-[#5A7863] hover:border-[#90AB8B]/20"
      }
    `;
  };

  return (
    <div className="w-64 bg-white p-5 min-h-screen border-r border-[#DDE7D8] text-[#3B4953]">
      {/* Logo Section */}
      <div className="mb-10 pl-1">
        <h1 className="text-xl font-extrabold tracking-tight text-[#3B4953]">
          SHUTTER
          <span className="font-light text-[#5A7863] ml-0.5">STUDIO</span>
        </h1>
        <p className="text-[10px] text-[#3B4953]/60 font-medium tracking-wide uppercase mt-0.5">
          Dashboard Panel
        </p>
      </div>

      {/* Sidebar Menu Links */}
      <div className="flex flex-col gap-3">
        {/* ADMIN SIDEBAR */}
        {roleType === "ADMIN" && (
          <>
            <Link
              to="/admin-Hero"
              className={getLinkClass("/admin-Hero")}
            >
              Create Hero Section
            </Link>
            <Link
              to="/admin-stories"
              className={getLinkClass("/admin-stories")}
            >
              Create Stories
            </Link>
            <Link
              to="/photobooks-admin"
              className={getLinkClass("/photobooks-admin")}
            >
              PhotoBooks
            </Link>
            <Link to="/access" className={getLinkClass("/access")}>
              Access Management
            </Link>
            <Link to="/admin-films" className={getLinkClass("/admin-films")}>
              Create Films
            </Link>
            <Link
              to="/admin-PreWedding"
              className={getLinkClass("/admin-PreWedding")}
            >
              Create PreWedding
            </Link>
          </>
        )}

        {/* EDITOR SIDEBAR */}
        {roleType === "EDITOR" && (
          <>
            {permissions.includes("overview") && (
              <Link
                to="/editor-overview"
                className={getLinkClass("/editor-overview")}
              >
                Overview
              </Link>
            )}
            {permissions.includes("posts") && (
              <Link to="/posts" className={getLinkClass("/posts")}>
                Posts
              </Link>
            )}
            {permissions.includes("settings") && (
              <Link
                to="/editor-settings"
                className={getLinkClass("/editor-settings")}
              >
                Settings
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
