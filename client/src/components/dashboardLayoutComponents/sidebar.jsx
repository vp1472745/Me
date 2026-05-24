import { Link } from "react-router-dom";

function Sidebar() {

  // ==========================
  // User
  // ==========================

  const user = JSON.parse(
    localStorage.getItem("user"),
  );

  // ==========================
  // Role
  // ==========================

  const roleType = user?.role;

  // ==========================
  // Permissions
  // ==========================

  const permissions =
    user?.permissions || [];

  return (
    <div className="w-64  text-white p-5 min-h-screen">

      {/* Logo */}

      <h1 className="text-2xl font-bold mb-10">
        Dashboard
      </h1>

      {/* Sidebar Menu */}

      <div className="flex flex-col gap-4">

        {/* ==========================
            ADMIN SIDEBAR
        ========================== */}

        {roleType === "ADMIN" && (
          <>

            <Link
              to="/admin-stories"
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
            >
              Create Stories
            </Link>

            <Link
              to="/photobooks-admin"
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
            >
              PhotoBooks
            </Link>

            <Link
              to="/access"
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
            >
              Access
            </Link>

            <Link
              to="/admin-Films"
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
            >
              Create Films
            </Link>

               <Link
              to="/admin-PreWedding"
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
            >
              Create PreWedding
            </Link>

          </>
        )}

        {/* ==========================
            EDITOR SIDEBAR
        ========================== */}

        {roleType === "EDITOR" && (
          <>

            {permissions.includes(
              "overview",
            ) && (
              <Link
                to="/editor-overview"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
              >
                Overview
              </Link>
            )}

            {permissions.includes(
              "posts",
            ) && (
              <Link
                to="/posts"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
              >
                Posts
              </Link>
            )}

            {permissions.includes(
              "settings",
            ) && (
              <Link
                to="/editor-settings"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg"
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