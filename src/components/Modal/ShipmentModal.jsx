import React from "react";
import { createPortal } from "react-dom";
import { X, Truck, AlertCircle } from "lucide-react";

/**
 * Premium Shipment Details Modal
 * Specifically designed for entering tracking information with a clean, modern form.
 */
const ShipmentModal = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  setFormData,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform-gpu border border-border">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-text-primary tracking-tight">
            Enter Shipping Details
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary opacity-40 hover:opacity-100 transition-all p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body / Form */}
        <div className="px-8 pb-8 space-y-6">
          {/* Tracking ID */}
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-text-secondary opacity-50 ml-1 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">
              Tracking ID
            </label>
            <input
              type="text"
              value={formData.tracking_id}
              onChange={(e) =>
                setFormData((f) => ({ ...f, tracking_id: e.target.value }))
              }
              placeholder="e.g. AW123456789"
              className="w-full h-12 bg-background border border-border rounded-2xl px-5 text-sm font-semibold text-text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
            />
          </div>

          {/* Tracking URL / Courier */}
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-text-secondary opacity-50 ml-1 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">
              Tracking URL / Courier
            </label>
            <input
              type="text"
              value={formData.tracking_url}
              onChange={(e) =>
                setFormData((f) => ({ ...f, tracking_url: e.target.value }))
              }
              placeholder="https://courier.com/track/..."
              className="w-full h-12 bg-background border border-border rounded-2xl px-5 text-sm font-semibold text-text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
            />
          </div>

          {/* Courier Name (Optional) */}
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-text-secondary opacity-50 ml-1 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">
              Courier Name (Optional)
            </label>
            <input
              type="text"
              value={formData.courier_name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, courier_name: e.target.value }))
              }
              placeholder="e.g. DTDC, BlueDart"
              className="w-full h-12 bg-background border border-border rounded-2xl px-5 text-sm font-semibold text-text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
            />
          </div>

          {/* Automated Note */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <AlertCircle size={18} />
            </div>
            <p className="text-[11px] font-bold text-text-secondary leading-tight opacity-80">
              An email will be sent to the customer with these tracking details
              automatically.
            </p>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-8 pb-8">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-base shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Truck size={20} />
                Confirm Shipment
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ShipmentModal;
