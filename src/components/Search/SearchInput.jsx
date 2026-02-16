import React from "react";
import { Search, RotateCcw } from "lucide-react";

/**
 * Reusable Premium Search Input Component
 * Features a slim design, built-in reset functionality, and SaaS aesthetics.
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  onReset,
  className = "",
  maxWidth = "400px",
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ maxWidth }}
    >
      <div className="relative flex-1 group">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-4 outline-hidden focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-text-primary placeholder:text-text-secondary/60 shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {onReset && (
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-text-secondary hover:bg-background hover:text-text-primary transition-all cursor-pointer group shadow-sm flex-shrink-0"
          title="Reset Filters"
          onClick={onReset}
        >
          <RotateCcw
            size={16}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
