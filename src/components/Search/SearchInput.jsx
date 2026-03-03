import React from "react";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * Standard Search Component for Admin Panel
 * This is the central file for all search inputs.
 * Controlled width (default 300px) and integrated Reset button.
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  onReset,
  className = "",
  // Default to 300px as per latest design preference
  maxWidth = "400px",
}) => {
  return (
    <div
      className={`flex items-center gap-2 w-full ${className}`}
      style={{ maxWidth }}
    >
      <div className="relative flex-1 flex items-center group">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="input-field !pl-10 !pr-10 !py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded hover:bg-background text-text-secondary transition-all cursor-pointer border-none bg-transparent"
            title="Clear text"
            onClick={() => onChange("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="btn-secondary !px-3 h-[38px] flex items-center justify-center gap-2 text-[12px] uppercase font-bold tracking-wider shrink-0"
          title="Reset Filters"
        >
          <RotateCcw size={14} className="opacity-70" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
