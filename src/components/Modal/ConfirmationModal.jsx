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
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      buttonBg: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
      accent: "rose",
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
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
      <div className="bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform-gpu">
        {/* Header Area */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl ${currentStyles.iconBg} flex items-center justify-center ${currentStyles.iconColor} shadow-inner`}
            >
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {title || "Confirm Action"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-300 hover:text-slate-900 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message / Body Area */}
        <div className="px-8 pb-6">
          <p className="text-slate-500 font-medium leading-relaxed">
            {message ||
              "Are you sure you want to proceed? This action may be irreversible."}
          </p>
        </div>

        {/* Action Buttons Area */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors"
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
          <div className="bg-[#FFF8E1] px-8 py-4 flex items-center gap-3 border-t border-amber-100/50">
            <AlertCircle size={16} className="text-[#F9A825] shrink-0" />
            <p className="text-[10px] font-black text-[#F9A825] uppercase tracking-[0.2em] leading-tight">
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
