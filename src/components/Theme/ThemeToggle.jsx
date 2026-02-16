import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../store/slices/appSlice";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.app.isDarkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[#64748b] hover:text-[#6366f1] transition-all border border-slate-200 dark:border-slate-800 relative overflow-hidden group cursor-pointer"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      <div className="relative z-10">
        {isDarkMode ? (
          <Sun size={20} className="animate-in spin-in-180 duration-500" />
        ) : (
          <Moon size={20} className="animate-in spin-in-180 duration-500" />
        )}
      </div>

      {/* Background Hover Effect */}
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
    </button>
  );
};

export default ThemeToggle;
