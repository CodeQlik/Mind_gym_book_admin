import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import {
  Bell,
  Moon,
  Sun,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import ThemeToggle from "../Theme/ThemeToggle";

const Header = ({ toggleSidebar, isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[var(--header-height)] px-8 flex items-center justify-between sticky top-0 bg-surface/60 backdrop-blur-xl border-b border-white/20 dark:border-white/5 z-[1001] animate-fade-in shadow-sm">
      <div className="flex items-center gap-6">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-background text-text-secondary hover:text-primary transition-all border border-border"
          onClick={toggleSidebar}
        >
          <Menu size={20} className="lg:hidden" />
          <ChevronRight
            size={20}
            className={`hidden lg:block transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-border">
          <ThemeToggle />

          <div className="relative group">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-background text-text-secondary hover:text-primary transition-all border border-border relative overflow-hidden">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-background"></span>
            </button>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3.5 py-1.5 px-2 rounded-2xl cursor-pointer hover:bg-background transition-all group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm group-hover:border-primary transition-colors shrink-0">
              <img
                src={
                  user?.profile?.url ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Felix"}`
                }
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[14px] font-bold text-text-primary leading-none mb-1">
                {user?.name || "System Admin"}
              </span>
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60 leading-none">
                {user?.role || "SYSTEM ADMIN"}
              </span>
            </div>
            <ChevronRight
              size={14}
              className={`text-text-secondary transition-transform duration-500 ${isProfileOpen ? "rotate-90" : "rotate-0 sm:rotate-90"}`}
            />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-80 bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden z-[1100] animate-slide-up">
              <div className="p-6 border-b border-border bg-linear-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-4 mb-3 text-text-secondary/60">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    Security ID
                  </span>
                  <div className="h-[1px] flex-1 bg-border/50"></div>
                </div>
                <p className="text-sm font-black text-text-primary truncate font-['Outfit']">
                  {user?.email || "admin@mindgym.com"}
                </p>
              </div>

              <div className="p-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-background transition-all group/item"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover/item:bg-primary group-hover/item:text-white group-hover/item:border-primary transition-all shadow-sm">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[0.9rem] font-black text-text-primary group-hover/item:text-primary transition-colors">
                    Account Profile
                  </span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-background transition-all group/item"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover/item:bg-primary group-hover/item:text-white group-hover/item:border-primary transition-all shadow-sm">
                    <Settings size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[0.9rem] font-black text-text-primary group-hover/item:text-primary transition-colors">
                    Global Settings
                  </span>
                </Link>
              </div>

              <div className="p-3 bg-background">
                <button
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white text-[0.9rem] font-black transition-all group/btn shadow-xs hover:shadow-lg hover:shadow-rose-500/30"
                  onClick={() => dispatch(logout())}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 group-hover:btn:bg-white/20 flex items-center justify-center transition-all">
                    <LogOut size={18} strokeWidth={2.5} />
                  </div>
                  System Logout
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
