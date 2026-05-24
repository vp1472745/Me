// ==========================
// FILE: PublicRoute.jsx
// ==========================

import {
  Navigate,
  Outlet,
} from "react-router-dom";

function PublicRoute() {

  const userStr =
    localStorage.getItem("user");

  let user = null;

  try {

    user = userStr
      ? JSON.parse(userStr)
      : null;

  } catch (e) {

    user = null;
  }

  // ==========================
  // USER LOGIN HAI
  // ==========================

  if (user) {

    // ADMIN
    if (user?.role === "ADMIN") {

      return (
        <Navigate
          to="/dashboard/admin-stories"
          replace
        />
      );
    }

    // EDITOR
    if (user?.role === "EDITOR") {

      return (
        <Navigate
          to="/dashboard/editor-overview"
          replace
        />
      );
    }
  }

  // ==========================
  // LOGIN PAGE SHOW
  // ==========================

  return <Outlet />;
}

export default PublicRoute;