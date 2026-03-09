import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProfile } from "./store/slices/authSlice";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Books from "./pages/Books/Books";
import AddBook from "./pages/Books/AddBook";
import EditBook from "./pages/Books/EditBook";
import ViewBook from "./pages/Books/ViewBook";
import Users from "./pages/Users/Users";
import ViewUser from "./pages/Users/ViewUser";
import EditUser from "./pages/Users/EditUser";
import Settings from "./pages/Settings/Settings";
import Payments from "./pages/Payments/Payments";

import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import VerifyOtp from "./pages/Login/VerifyOtp";
import ResetPasswordOtp from "./pages/Login/ResetPasswordOtp";
import Profile from "./pages/Profile/Profile";
import Categories from "./pages/Categories/Categories";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";
import ViewCategory from "./pages/Categories/ViewCategory";

import Subscribe from "./pages/Subscribe/Subscribe";
import SubscribeUsers from "./pages/Subscribe/SubscribeUsers";
import AddPlan from "./pages/Subscribe/AddPlan";
import EditPlan from "./pages/Subscribe/EditPlan";
import Notifications from "./pages/Notifications/Notifications";
import Orders from "./pages/Orders/Orders";
import ViewOrder from "./pages/Orders/ViewOrder";
import Marketplace from "./pages/Marketplace/Marketplace";
import Inventory from "./pages/Inventory/Inventory";
import Coupons from "./pages/Coupons/Coupons";
import ViewCoupon from "./pages/Coupons/ViewCoupon";
import Support from "./pages/Support/Support";
import ChatSupport from "./pages/Support/ChatSupport";
import CMS from "./pages/CMS/CMS";
import EditCMS from "./pages/CMS/EditCMS";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import {
  connectSocket,
  disconnectSocket,
  default as socket,
} from "./utils/socket";
import { receivedRealTimeNotification } from "./store/slices/notificationSlice";

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.app.isDarkMode);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
      // Connect to real-time notification server
      connectSocket(user?.id, user?.user_type === "admin");

      // Listen for real-time notifications to update Redux count/list
      socket.on("notification", (data) => {
        dispatch(receivedRealTimeNotification(data));

        // Display a clean success toast on the right side
        // Deduplicate to avoid multiple toasts for the same message
        const message = data.message || data.body || data.title;
        if (message) {
          toast.success(message, {
            id: `notif-${data.id || Date.now()}`, // ID deduplication
            duration: 4000,
          });
        }
      });
    } else {
      disconnectSocket();
    }

    return () => {
      socket.off("notification");
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch, user?.id]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
    }
  }, [isDarkMode]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="categories/edit/:slug" element={<EditCategory />} />
            <Route path="categories/view/:slug" element={<ViewCategory />} />

            <Route path="books" element={<Books />} />
            <Route path="books/add" element={<AddBook />} />
            <Route path="books/view/:slug" element={<ViewBook />} />
            <Route path="books/edit/:slug" element={<EditBook />} />
            <Route path="users" element={<Users />} />
            <Route path="users/view/:id" element={<ViewUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />

            <Route path="payments" element={<Payments />} />
            <Route path="subscribe" element={<Subscribe />} />
            <Route path="subscribe/add" element={<AddPlan />} />
            <Route path="subscribe/edit/:id" element={<EditPlan />} />
            <Route path="subscribe/users" element={<SubscribeUsers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/view/:id" element={<ViewOrder />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="coupons/view/:id" element={<ViewCoupon />} />
            <Route path="support" element={<Support />} />
            <Route path="support/chat/:id" element={<ChatSupport />} />
            <Route path="cms" element={<CMS />} />
            <Route path="cms/edit/:slug" element={<EditCMS />} />
          </Route>
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
