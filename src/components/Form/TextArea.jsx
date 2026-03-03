import React from "react";

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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-bold text-text-primary ml-0.5 uppercase tracking-wider opacity-70"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`input-field resize-none min-h-[100px] leading-relaxed ${error ? "border-error focus:border-error" : ""} ${className}`}
        {...props}
      />

      {error && (
        <span className="text-[10px] font-bold text-error ml-0.5 uppercase tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextArea;
