// ==========================
// FILE: ProtectedRoute.jsx
// ==========================

import {
  Navigate,
  Outlet,
} from "react-router-dom";

function ProtectedRoute() {

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
  // LOGIN HAI TO DASHBOARD
  // ==========================

  return user
    ? <Outlet />
    : (
      <Navigate
        to="/login"
        replace
      />
    );
}

export default ProtectedRoute;