import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const userRole = user?.role || user?.user_type;
  const isAdmin = userRole === "Admin" || userRole === "admin";

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
