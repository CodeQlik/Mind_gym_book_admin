import React from "react";

const Toggle = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  description = "",
}) => {
  return (
    <label
      className={`flex items-center justify-between gap-4 cursor-pointer group ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="flex flex-col">
        {label && (
          <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
        {description && (
          <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider opacity-60">
            {description}
          </span>
        )}
      </div>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-sm"></div>
      </div>
    </label>
  );
};

export default Toggle;
