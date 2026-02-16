import React from "react";
import { Loader2 } from "lucide-react";

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
    "inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

  const variants = {
    primary:
      "bg-[#6366f1] hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5",
    secondary:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-0.5",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5",
    success:
      "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5",
    outline:
      "bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary",
    ghost:
      "bg-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:-translate-x-1",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-lg gap-1.5",
    md: "px-6 py-3 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-2xl gap-2.5",
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
        <Icon
          size={size === "sm" ? 14 : size === "lg" ? 20 : 18}
          strokeWidth={size === "sm" ? 3 : 2.5}
        />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
