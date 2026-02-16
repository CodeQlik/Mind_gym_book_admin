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
import Analytics from "./pages/Analytics/Analytics";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import Categories from "./pages/Categories/Categories";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";
import ViewCategory from "./pages/Categories/ViewCategory";

import Subscribe from "./pages/Subscribe/Subscribe";
import SubscribeUsers from "./pages/Subscribe/SubscribeUsers";
import AddPlan from "./pages/Subscribe/AddPlan";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.app.isDarkMode);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);

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
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

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
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscribe" element={<Subscribe />} />
            <Route path="subscribe/add" element={<AddPlan />} />
            <Route path="subscribe/users" element={<SubscribeUsers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
