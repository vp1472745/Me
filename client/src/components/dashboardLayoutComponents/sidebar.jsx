import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const roleType = user?.role;
  const permissions = user?.permissions || [];
  const location = useLocation();

  // Helper to check if a path is active (exact match)
  const isActive = (path) => location.pathname === path;

  // Base link classes – shared for all links
  const baseLinkClass =
    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border";

  // Active & inactive variants
  const getLinkClass = (path) => {
    const active = isActive(path);
    return `
      ${baseLinkClass}
      ${
        active
          ? "bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm"
          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
      }
    `;
  };

  return (
    <div className="w-64 bg-white p-5 min-h-screen border-r border-gray-200">
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-10 text-gray-800">Dashboard</h1>

      {/* Sidebar Menu */}
      <div className="flex flex-col gap-4">
        {/* ADMIN SIDEBAR */}
        {roleType === "ADMIN" && (
          <>
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
            <Link
              to="/access"
              className={getLinkClass("/access")}
            >
              Access
            </Link>
            <Link
              to="/admin-Films"
              className={getLinkClass("/admin-Films")}
            >
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
              <Link
                to="/posts"
                className={getLinkClass("/posts")}
              >
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