import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import {
  fetchNotifications,
  fetchNotificationStats,
  markAllAdminNotificationsRead,
} from "../../store/slices/notificationSlice";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "../Theme/ThemeToggle";

const Header = ({ toggleSidebar, isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { stats } = useSelector((state) => state.notifications);
  const unreadCount = stats?.unreadCount || 0;

  useEffect(() => {
    if (user?.user_type === "admin") {
      dispatch(fetchNotifications());
      dispatch(fetchNotificationStats());
    } else {
      dispatch(fetchNotifications());
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const handleNotificationClick = () => {
    if (user?.user_type === "admin" && unreadCount > 0) {
      dispatch(markAllAdminNotificationsRead());
    }
    navigate("/notifications");
  };

  return (
    <header className="h-[var(--header-height)] px-6 flex items-center justify-between sticky top-0 bg-surface border-b border-border z-[1001]">
      <div className="flex items-center gap-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-background text-text-secondary hover:text-primary transition-all border border-border"
          onClick={toggleSidebar}
        >
          <Menu size={18} className="lg:hidden" />
          <ChevronRight
            size={18}
            className={`hidden lg:block transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-border">
          <ThemeToggle />
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-background text-text-secondary hover:text-primary transition-all border border-border relative"
            onClick={handleNotificationClick}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2962FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 p-1 rounded-lg cursor-pointer hover:bg-background transition-all group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-9 h-9 rounded bg-primary overflow-hidden border border-border shrink-0">
              <img
                src={
                  user?.profile?.url ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Felix"}`
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-sm font-bold text-text-primary leading-none">
                {user?.name || "System Admin"}
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase mt-1 opacity-60">
                {user?.role || "Admin"}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-text-secondary transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-[1100]">
              <div className="p-4 border-b border-border bg-background/50">
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">
                  Signed in as
                </p>
                <p className="text-sm font-bold text-text-primary truncate">
                  {user?.email || "admin@mindgym.com"}
                </p>
              </div>

              <div className="p-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-background transition-all"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User size={16} className="text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">
                    Profile
                  </span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-background transition-all"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings size={16} className="text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">
                    Settings
                  </span>
                </Link>
              </div>

              <div className="p-1 mt-1 border-t border-border">
                <button
                  className="w-full flex items-center gap-3 p-2.5 rounded-md text-error hover:bg-error-surface transition-all"
                  onClick={() => dispatch(logout())}
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
