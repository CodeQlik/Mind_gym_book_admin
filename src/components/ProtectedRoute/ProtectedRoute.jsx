import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // If loading, show a premium loader instead of redirecting
  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-primary/10 blur-xl animate-pulse rounded-full"></div>
        </div>
        <p className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] animate-pulse">
          Authenticating <span className="text-primary italic">Session</span>
        </p>
      </div>
    );
  }

  const userRole = user?.role || user?.user_type;
  const isAdmin =
    userRole === "Admin" ||
    userRole === "admin" ||
    userRole === "System Admin" ||
    userRole === "Master Admin";

  // If token exists but user is missing, don't redirect yet!
  // App.jsx will trigger fetchProfile, so just wait or show loading.
  if (isAuthenticated && !user) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-black text-text-secondary uppercase tracking-[0.2em]">
          Restoring <span className="text-primary italic">User Data</span>
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.warn("[PROTECTED] User is not an admin. Role:", userRole);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
