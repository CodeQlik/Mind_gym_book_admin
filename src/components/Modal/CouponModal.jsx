import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Ticket, Calendar, Percent, DollarSign, Clock } from "lucide-react";
import Button from "../UI/Button";

const CouponModal = ({
  isOpen,
  onClose,
  onSave,
  coupon = null,
  isSaving = false,
}) => {
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: 0,
    max_discount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    usage_limit: "",
    is_active: true,
  });

  const backdropRef = useRef();

  useEffect(() => {
    if (coupon) {
      setForm({
        ...coupon,
        start_date: coupon.start_date.split("T")[0],
        end_date: coupon.end_date.split("T")[0],
        usage_limit: coupon.usage_limit || "",
        max_discount: coupon.max_discount || "",
      });
    } else {
      setForm({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: 0,
        max_discount: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        usage_limit: "",
        is_active: true,
      });
    }
  }, [coupon, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
    >
      <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Ticket size={20} />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-lg tracking-tight">
                {coupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60">
                Configure discount rules and limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/30 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-6 flex-1 no-scrollbar text-left"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                Coupon Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="E.G. WELCOME20"
                  required
                  className="w-full h-11 pl-4 pr-4 bg-background border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase placeholder:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                Discount Type
              </label>
              <div className="flex p-1 bg-background border border-border rounded-xl h-11">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, discount_type: "percentage" }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${form.discount_type === "percentage" ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-text-primary"}`}
                >
                  <Percent size={14} /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, discount_type: "fixed" }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${form.discount_type === "fixed" ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-text-primary"}`}
                >
                  <DollarSign size={14} /> Fixed Amount
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Display text for this coupon..."
              className="w-full bg-background border border-border rounded-xl p-4 text-sm font-medium text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-20 placeholder:opacity-30"
            />
          </div>

          {/* Pricing Logic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                {form.discount_type === "percentage"
                  ? "Percentage (%)"
                  : "Fixed (₹)"}
              </label>
              <input
                type="number"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                required
                min="1"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                Min order (₹)
              </label>
              <input
                type="number"
                name="min_order_amount"
                value={form.min_order_amount}
                onChange={handleChange}
                min="0"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {form.discount_type === "percentage" && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                  Max Dis (₹)
                </label>
                <input
                  type="number"
                  name="max_discount"
                  value={form.max_discount}
                  onChange={handleChange}
                  placeholder="Limit"
                  className="w-full h-11 px-4 bg-background border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}
          </div>

          {/* Validity & Limits */}
          <div className="p-5 bg-background/50 border border-border rounded-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} className="text-primary" /> Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-error" /> End Date (Expiry)
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  name="usage_limit"
                  value={form.usage_limit}
                  onChange={handleChange}
                  placeholder="Unlimited if empty"
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
              </div>

              <div className="flex flex-col justify-center gap-2">
                <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-1">
                  Coupon Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success shadow-inner transition-all"></div>
                  </label>
                  <span
                    className={`text-xs font-black uppercase tracking-widest ${form.is_active ? "text-success" : "text-text-secondary opacity-50"}`}
                  >
                    {form.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border bg-background/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background transition-all"
          >
            Cancel
          </button>
          <Button
            type="submit"
            onClick={handleSubmit}
            isLoading={isSaving}
            className="h-11 px-10 shadow-lg shadow-primary/20"
          >
            {coupon ? "Update Changes" : "Create Coupon"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CouponModal;
