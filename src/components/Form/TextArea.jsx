import React from "react";

/**
 * A reusable, premium TextArea component.
 */
const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  className = "",
  rows = 4,
  disabled = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full animate-fade-in group">
      {label && (
        <label
          htmlFor={name}
          className="text-[0.85rem] font-bold text-text-primary ml-1 flex items-center gap-1.5 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-rose-500 font-black">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`
            w-full bg-background 
            border ${error ? "border-rose-500" : "border-border"}
            rounded-2xl py-4 px-5 
            outline-hidden 
            focus:border-primary/30 focus:ring-4 focus:ring-primary/5 
            transition-all text-sm font-medium 
            text-text-primary 
            placeholder:text-text-secondary/50 
            shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
            resize-none leading-relaxed
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs font-bold text-rose-500 ml-1 italic animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextArea;
