import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import Button from "../UI/Button";

import { createPortal } from "react-dom";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger", // danger | warning | primary
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center font-['Outfit']"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-[90%] max-w-[22rem] bg-surface  border border-border  p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-5 text-center z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-full text-text-secondary opacity-60 hover:text-text-secondary dark:hover:text-slate-200 hover:bg-background/50 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Icon */}
        <div className="mx-auto relative group mt-2">
          <div className="w-20 h-20 rounded-full bg-error-surface dark:bg-error-surface flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-500 ease-out">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center animate-pulse-slow">
              <AlertTriangle
                size={28}
                className="text-error fill-rose-500/20"
                strokeWidth={2.5}
              />
            </div>
          </div>
          {/* Decorative Elements around icon */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-rose-400 rounded-full opacity-20 animate-bounce-slow" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-rose-400 rounded-full opacity-30 animate-ping" />
        </div>

        {/* Content */}
        <div className="space-y-2 px-2">
          <h3 className="text-xl font-black text-text-primary  tracking-tight">
            {title || "Confirm Deletion"}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary opacity-60 font-medium leading-relaxed">
            {message ||
              "Are you sure you want to proceed? This action cannot be undone."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            size="md"
            className="flex-1 rounded-xl border-2 border-border  hover:border-border dark:hover:border-slate-700 hover:bg-background dark:hover:bg-slate-800/50"
          >
            {cancelText}
          </Button>

          <Button
            variant="primary" // We'll override specific styles for danger
            onClick={onConfirm}
            loading={isProcessing}
            size="md"
            icon={!isProcessing ? Trash2 : null}
            className={`flex-1 rounded-xl shadow-lg shadow-rose-500/25 ${
              variant === "danger"
                ? "bg-rose-500 hover:bg-rose-600 border-rose-600 text-white"
                : ""
            }`}
          >
            {isProcessing ? "Deleting..." : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
export default ConfirmationModal;
