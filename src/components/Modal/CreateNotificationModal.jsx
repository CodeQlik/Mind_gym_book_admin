import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Bell,
  Users,
  Tag,
  Heart,
  RefreshCw,
  Timer,
  Sparkles,
  Send,
  Clock,
  Loader2,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { fetchCategories } from "../../store/slices/categorySlice";

export const TARGETING_OPTIONS = [
  {
    value: "all",
    label: "All Users",
    icon: <Users size={15} />,
    desc: "Send to everyone on the platform",
  },
  {
    value: "category",
    label: "By Category Interest",
    icon: <Tag size={15} />,
    desc: "Users who follow a specific category",
  },
  {
    value: "wishlist",
    label: "By Wishlist / Interest",
    icon: <Heart size={15} />,
    desc: "Users who bookmarked or wishlisted items",
  },
  {
    value: "subscribed",
    label: "Subscribed Users Only",
    icon: <RefreshCw size={15} />,
    desc: "Only active subscribers",
  },
  {
    value: "expiring",
    label: "Expiring Subscriptions",
    icon: <Timer size={15} />,
    desc: "Users whose plan expires in 7 days",
  },
];

const CreateNotificationModal = ({
  onClose,
  onSave,
  isSending = false,
  typeStyles,
  TypeBadge,
}) => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const [form, setForm] = useState({
    type: "New Release",
    title: "",
    body: "",
    targeting: "all",
    category: "",
    bookId: "",
    scheduledAt: "",
    sendInstant: true,
  });
  const [step, setStep] = useState(1); // 1 = config, 2 = message, 3 = preview
  const backdropRef = useRef();

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const placeholders = {
    title:
      {
        "New Release": "e.g. {book_title} is now available!",
        Sale: "e.g. Flash Sale — {discount}% off today!",
        Subscription: "e.g. {user_name}, your plan expires soon",
        "Price Drop": "e.g. {book_title} just dropped in price 🎉",
        General: "e.g. Exciting news from Mind Gym...",
        Approval: "e.g. Your book listing is now live!",
      }[form.type] || "Notification title",
    body: "Write your message… use {user_name}, {book_title}, {discount} as placeholders",
  };

  return ReactDOM.createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-surface rounded-[2rem] border border-border shadow-2xl shadow-black/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-black text-text-primary text-lg font-['Outfit'] tracking-tight">
                Create Notification
              </h2>
              <p className="text-xs text-text-secondary font-semibold">
                Step {step} of 3 —{" "}
                {
                  ["", "Type & Targeting", "Message Builder", "Preview & Send"][
                    step
                  ]
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="overflow-y-auto flex-1 p-8 space-y-6">
          {/* ── Step 1: Type & Targeting ── */}
          {step === 1 && (
            <>
              {/* Type */}
              <div>
                <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                  Notification Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(typeStyles).map((t) => {
                    const cfg = typeStyles[t];
                    return (
                      <button
                        key={t}
                        onClick={() => set("type", t)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          form.type === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-text-secondary hover:border-primary/40 hover:text-text-primary"
                        }`}
                      >
                        <span className={cfg.color.split(" ")[1]}>
                          {cfg.icon}
                        </span>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Targeting */}
              <div>
                <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                  Target Audience
                </label>
                <div className="space-y-2">
                  {TARGETING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.targeting === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="targeting"
                        value={opt.value}
                        checked={form.targeting === opt.value}
                        onChange={() => set("targeting", opt.value)}
                        className="accent-primary"
                      />
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.targeting === opt.value ? "bg-primary/10 text-primary" : "bg-background text-text-secondary"}`}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${form.targeting === opt.value ? "text-primary" : "text-text-primary"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              {form.targeting === "category" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                    Select Target Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-bold text-text-primary appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                      disabled={categoriesLoading}
                    >
                      <option value="">Choose a category...</option>
                      {categories.map((c) => (
                        <option key={c.id || c._id} value={c.id || c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary/50">
                      {categoriesLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                  {categories.length === 0 && !categoriesLoading && (
                    <p className="mt-2 text-xs text-amber-500 font-bold flex items-center gap-1.5">
                      <AlertCircle size={12} /> No categories found in backend.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Step 2: Message Builder ── */}
          {/* ... (no changes here) ... */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                  Notification Title
                </label>
                <input
                  className="input-field"
                  placeholder={placeholders.title}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={80}
                />
                <p className="text-xs text-text-secondary/60 mt-1 text-right">
                  {form.title.length}/80
                </p>
              </div>

              <div>
                <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                  Message Body
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={5}
                  placeholder={placeholders.body}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  maxLength={300}
                />
                <p className="text-xs text-text-secondary/60 mt-1 text-right">
                  {form.body.length}/300
                </p>
              </div>

              {/* Placeholders hint */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles size={12} /> Available Placeholders
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "{user_name}",
                    "{book_title}",
                    "{category}",
                    "{discount}",
                    "{days_left}",
                  ].map((ph) => (
                    <button
                      key={ph}
                      onClick={() => set("body", form.body + ph)}
                      className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                      {ph}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-background rounded-xl border border-border p-4">
                <label className="block text-[10px] font-black text-text-secondary mb-2 uppercase tracking-widest">
                  Reference Book ID (Optional)
                </label>
                <input
                  className="input-field !h-10 text-xs"
                  placeholder="e.g. 36 (matches Postman test)"
                  value={form.bookId}
                  onChange={(e) => set("bookId", e.target.value)}
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-black text-text-primary mb-3 uppercase tracking-widest">
                  Send Time
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => set("sendInstant", true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                      form.sendInstant
                        ? "bg-primary text-white border-primary"
                        : "border-border text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <Send size={15} /> Send Now
                  </button>
                  <button
                    onClick={() => set("sendInstant", false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                      !form.sendInstant
                        ? "bg-primary text-white border-primary"
                        : "border-border text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <Clock size={15} /> Schedule
                  </button>
                </div>
                {!form.sendInstant && (
                  <input
                    type="datetime-local"
                    className="input-field mt-3"
                    value={form.scheduledAt}
                    onChange={(e) => set("scheduledAt", e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Preview ── */}
          {step === 3 && (
            <>
              <div className="bg-background rounded-2xl border border-border p-6 space-y-5">
                <p className="text-xs font-black text-text-secondary uppercase tracking-widest">
                  Preview
                </p>

                {/* Phone mock notification */}
                <div className="bg-surface rounded-2xl border border-border p-4 flex items-start gap-3 shadow-sm">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeStyles[form.type]?.color || "bg-primary/10 text-primary"}`}
                  >
                    {typeStyles[form.type]?.icon || <Bell size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-text-primary text-sm">
                      {form.title || "(No title)"}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {form.body || "(No message)"}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-secondary/50 shrink-0">
                    now
                  </span>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface rounded-xl border border-border p-3">
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">
                      Type
                    </p>
                    <TypeBadge type={form.type} />
                  </div>
                  <div className="bg-surface rounded-xl border border-border p-3">
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">
                      Targeting
                    </p>
                    <p className="font-bold text-text-primary capitalize leading-tight">
                      {
                        TARGETING_OPTIONS.find(
                          (o) => o.value === form.targeting,
                        )?.label
                      }
                      {form.targeting === "category" && form.category && (
                        <span className="block text-[10px] text-text-secondary mt-1">
                          ↳{" "}
                          {categories.find(
                            (c) => (c.id || c._id) === form.category,
                          )?.name || "Selected Category"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-8 py-5 border-t border-border flex justify-between gap-3">
          <button
            onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
            disabled={isSending}
            className="px-6 py-3 rounded-xl border border-border text-text-secondary font-bold hover:bg-background transition-all text-sm disabled:opacity-50"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 2 && !form.title.trim()}
              className="btn-primary px-8 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => {
                const selectedCat = categories.find(
                  (c) => String(c.id || c._id) === String(form.category),
                );
                onSave({
                  ...form,
                  categoryName: selectedCat?.name || "",
                });
              }}
              disabled={isSending}
              className="btn-primary px-8 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} />{" "}
                  {form.sendInstant ? "Send Now" : "Schedule"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreateNotificationModal;
