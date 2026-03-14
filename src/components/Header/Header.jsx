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
  CheckCircle2,
  Clock as ClockIcon,
  RefreshCw,
  TrendingUp,
  Zap,
  Megaphone,
  BookOpen,
  BellRing,
  RotateCcw,
} from "lucide-react";
import ThemeToggle from "../Theme/ThemeToggle";

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const TYPE_STYLES = {
  "New Release": {
    icon: <BookOpen size={14} />,
    color: "text-primary bg-primary/10",
  },
  Subscription: {
    icon: <RefreshCw size={14} />,
    color: "text-violet-500 bg-violet-500/10",
  },
  Sale: {
    icon: <TrendingUp size={14} />,
    color: "text-amber-500 bg-amber-500/10",
  },
  Approval: {
    icon: <CheckCircle2 size={14} />,
    color: "text-success bg-success-surface",
  },
  "Price Drop": {
    icon: <Zap size={14} />,
    color: "text-pink-500 bg-pink-500/10",
  },
  General: {
    icon: <Megaphone size={14} />,
    color: "text-cyan-500 bg-cyan-500/10",
  },
  REFUND_REQUEST: {
    icon: <RotateCcw size={14} />,
    color: "text-rose-500 bg-rose-500/10",
  },
};

const Header = ({ toggleSidebar, isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const { items, stats, loading } = useSelector((state) => state.notifications);
  const unreadCount = stats?.unreadCount || 0;
  const recentNotifications = items.slice(0, 3);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user?.user_type === "admin") {
        dispatch(fetchNotifications());
        dispatch(fetchNotificationStats());
      } else {
        dispatch(fetchNotifications());
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch, isAuthenticated, user]);


  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && user?.user_type === "admin" && unreadCount > 0) {
      dispatch(markAllAdminNotificationsRead());
    }
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
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all border relative ${
              isNotificationOpen
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-background text-text-secondary hover:text-primary border-border"
            }`}
            onClick={handleNotificationClick}
            ref={notificationRef}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center border-2 animate-pulse ${
                  isNotificationOpen
                    ? "bg-white text-primary border-primary"
                    : "bg-[#2962FF] text-white border-surface"
                }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

            {isNotificationOpen && (
              <div
                className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-[1100] cursor-default animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <BellRing size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">
                      Notifications
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-background px-2 py-0.5 rounded-full border border-border">
                    {unreadCount} Unread
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {loading && items.length === 0 ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                      <RefreshCw
                        size={24}
                        className="text-primary/40 animate-spin mb-3"
                      />
                      <p className="text-xs font-bold text-text-secondary">
                        Syncing updates...
                      </p>
                    </div>
                  ) : recentNotifications.length > 0 ? (
                    <div className="flex flex-col">
                      {recentNotifications.map((notif) => {
                        const style =
                          TYPE_STYLES[notif.type] || TYPE_STYLES.General;
                        return (
                          <div
                            key={notif.id}
                            className={`p-4 hover:bg-background transition-all border-b border-border last:border-0 cursor-pointer group relative ${!notif.is_read ? "bg-primary/[0.02]" : ""}`}
                            onClick={() => {
                              setIsNotificationOpen(false);
                              navigate("/notifications");
                            }}
                          >
                            {!notif.is_read && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                            )}
                            <div className="flex gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent group-hover:border-current/10 transition-colors ${style.color}`}
                              >
                                {style.icon}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-1">
                                    {notif.type || "Update"}
                                  </span>
                                  <span className="text-[10px] font-bold text-text-secondary opacity-60 flex items-center gap-1 shrink-0">
                                    <ClockIcon size={10} />
                                    {timeAgo(
                                      notif.createdAt || notif.created_at,
                                    )}
                                  </span>
                                </div>
                                <h4
                                  className={`text-sm leading-snug break-words ${!notif.is_read ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}
                                >
                                  {notif.message ||
                                    notif.title ||
                                    notif.body ||
                                    "No message content"}
                                </h4>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                        <Bell size={24} className="text-text-secondary/20" />
                      </div>
                      <p className="text-sm font-bold text-text-primary mb-1">
                        All caught up!
                      </p>
                      <p className="text-xs font-medium text-text-secondary max-w-[200px]">
                        No new notifications at the moment.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-background/50 border-t border-border">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/notifications");
                    }}
                    className="w-full py-3 rounded-xl bg-background border border-border text-center text-[13px] font-bold text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98]"
                  >
                    See All Notifications
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
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
