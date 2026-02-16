import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * A reusable, premium Form Input component.
 * Supports: text, number, date, select, textarea, email, password.
 */
const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = name?.toLowerCase().includes("description") ? "textarea" : "text",
  placeholder = "",
  required = false,
  error = "",
  options = [], // For select type: [{ value, label }]
  className = "",
  rows = 4, // For textarea
  icon: Icon, // Optional icon on the left
  disabled = false,
  ...props
}) => {
  const baseInputStyles = `
    w-full bg-background 
    border ${error ? "border-rose-500" : "border-border"}
    rounded-xl py-3 px-5 
    outline-hidden 
    focus:border-primary/30 focus:ring-4 focus:ring-primary/5 
    transition-all text-sm font-medium 
    text-text-primary 
    placeholder:text-text-secondary/50 
    shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseInputStyles} resize-none min-h-[100px] leading-relaxed ${className}`}
          {...props}
        />
      );
    }

    if (type === "select") {
      return (
        <div className="relative group/select">
          <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputStyles} appearance-none cursor-pointer pr-10 ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover/select:text-primary transition-colors">
            <ChevronDown size={18} strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-text-secondary group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputStyles} ${Icon ? "pl-11" : ""} ${className}`}
          {...props}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full animate-fade-in">
      {label && (
        <label
          htmlFor={name}
          className="text-[0.85rem] font-bold text-text-primary ml-1 flex items-center gap-1.5 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-rose-500 font-black">*</span>}
        </label>
      )}

      {renderInput()}

      {error && (
        <span className="text-xs font-bold text-rose-500 ml-1 italic animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
