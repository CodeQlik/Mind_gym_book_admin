import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Standard Accessible Button
 * Simple, clean, and professional.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  type = "button",
  className = "",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border";

  const variants = {
    primary: "bg-primary border-primary text-white hover:opacity-90 shadow-sm",
    secondary:
      "bg-surface border-border text-text-primary hover:bg-background shadow-sm",
    danger: "bg-error border-error text-white hover:opacity-90 shadow-sm",
    success: "bg-success border-success text-white hover:opacity-90 shadow-sm",
    outline:
      "bg-transparent border-border text-text-secondary hover:border-primary hover:text-primary",
    ghost:
      "bg-transparent border-transparent text-text-secondary hover:bg-background hover:text-primary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-4 py-2 text-sm rounded-md gap-2",
    lg: "px-6 py-3 text-base rounded-lg gap-2.5",
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2
          className="animate-spin"
          size={size === "sm" ? 14 : size === "lg" ? 20 : 18}
        />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 18} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
