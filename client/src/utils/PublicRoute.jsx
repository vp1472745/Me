import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  return !user ? <Outlet /> : <Navigate to="/overview" replace />;
}

export default PublicRoute;