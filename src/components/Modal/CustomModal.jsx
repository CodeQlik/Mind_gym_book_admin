import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Bell } from "lucide-react";

/**
 * CustomModal - Styled to match the Notification Modal design language.
 */
const CustomModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
  icon: Icon = Bell,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0 invisible"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-surface rounded-lg border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Icon size={16} />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-base tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar bg-surface text-left">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CustomModal;
