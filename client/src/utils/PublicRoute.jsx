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

  if (user) {

    if (user?.role === "ADMIN") {

      return (
        <Navigate
          to="/dashboard/admin-overview"
          replace
        />
      );
    }

    if (user?.role === "EDITOR") {

      return (
        <Navigate
          to="/dashboard/editor-overview"
          replace
        />
      );
    }
  }

  return <Outlet />;
}

export default PublicRoute;