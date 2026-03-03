import React from "react";
import { ChevronDown } from "lucide-react";

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = name?.toLowerCase().includes("description") ? "textarea" : "text",
  placeholder = "",
  required = false,
  error = "",
  options = [],
  className = "",
  rows = 4,
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const baseInputStyles = `input-field ${error ? "border-error focus:border-error" : ""} ${className}`;

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
          className={`${baseInputStyles} resize-none min-h-[100px] leading-relaxed`}
          {...props}
        />
      );
    }

    if (type === "select") {
      return (
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`select-field ${error ? "border-error focus:border-error" : ""} ${className}`}
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
      );
    }

    return (
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-text-secondary">
            <Icon size={16} />
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
          className={`${baseInputStyles} ${Icon ? "pl-10" : ""}`}
          {...props}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-bold text-text-primary ml-0.5 uppercase tracking-wider opacity-70"
        >
          {label}
          {required && (
            <span className="text-primary/70 ml-1 font-bold text-xs">*</span>
          )}
        </label>
      )}

      {renderInput()}

      {error && (
        <span className="text-[12px] font-bold text-error ml-0.5 uppercase tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
