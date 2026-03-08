import React from "react";
import { AlertCircle, X, Trash2, HelpCircle } from "lucide-react";
import Button from "../UI/Button";
import { createPortal } from "react-dom";

/**
 * Premium Confirmation Modal
 * Refined structure with Header (Icon + Title), Body, Actions, and optional Warning Banner.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger | warning | primary
  icon: Icon = AlertCircle,
  warningText,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-error-surface",
      iconColor: "text-error",
      buttonBg: "bg-error hover:opacity-90 shadow-error/20",
      accent: "rose",
    },
    warning: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-200/20",
      accent: "amber",
    },
    primary: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      buttonBg: "bg-primary hover:bg-primary-dark shadow-primary/20",
      accent: "primary",
    },
  };

  const currentStyles = variantStyles[variant] || variantStyles.danger;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform-gpu border border-border">
        {/* Header Area */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl ${currentStyles.iconBg} flex items-center justify-center ${currentStyles.iconColor} shadow-inner border border-border/10`}
            >
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-black text-text-primary tracking-tight">
              {title || "Confirm Action"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-text-secondary opacity-40 hover:opacity-100 transition-all p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message / Body Area */}
        <div className="px-8 pb-6">
          <p className="text-text-secondary font-medium leading-relaxed opacity-80">
            {message ||
              "Are you sure you want to proceed? This action may be irreversible."}
          </p>
        </div>

        {/* Action Buttons Area */}
        <div className="bg-background px-8 py-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 h-12 rounded-2xl border border-border bg-surface text-text-secondary font-bold hover:bg-background transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 h-12 rounded-2xl ${currentStyles.buttonBg} text-white font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>

        {/* Warning Banner at Bottom */}
        {warningText && (
          <div className="bg-amber-500/5 px-8 py-4 flex items-center gap-3 border-t border-amber-500/10">
            <AlertCircle size={16} className="text-amber-500 shrink-0" />
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] leading-tight">
              {warningText}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmationModal;
