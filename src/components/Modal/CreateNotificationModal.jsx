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
import Button from "../UI/Button";

export const TARGETING_OPTIONS = [
  {
    value: "all",
    label: "All Users",
    icon: <Users size={14} />,
    desc: "Broadcast to everyone",
  },
  {
    value: "category",
    label: "By Category Interest",
    icon: <Tag size={14} />,
    desc: "Users following a category",
  },
  {
    value: "wishlist",
    label: "By Wishlist / Interest",
    icon: <Heart size={14} />,
    desc: "Users with wishlisted items",
  },
  {
    value: "subscribed",
    label: "Subscribed Only",
    icon: <RefreshCw size={14} />,
    desc: "Only active subscribers",
  },
  {
    value: "expiring",
    label: "Expiring Subs",
    icon: <Timer size={14} />,
    desc: "Plan expires in 7 days",
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
  const [step, setStep] = useState(1);
  const totalSteps = 2;
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
        Subscription: "e.g. Your plan expires soon",
        "Price Drop": "e.g. {book_title} just dropped in price 🎉",
        General: "e.g. Exciting news from Mind Gym...",
        Approval: "e.g. Your book listing is now live!",
      }[form.type] || "Notification title",
    body: "Write your message...",
  };

  return ReactDOM.createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl bg-surface rounded-lg border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Bell size={16} />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-base tracking-tight">
                Create Notification
              </h2>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Step {step}/{totalSteps} — {["", "Targeting", "Content"][step]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5 text-left">
          {step === 1 && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
                  Notification Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(typeStyles).map((t) => (
                    <button
                      key={t}
                      onClick={() => set("type", t)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-bold transition-all ${
                        form.type === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-text-secondary hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
                  Target Audience
                </label>
                <div className="space-y-2">
                  {TARGETING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                        form.targeting === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={form.targeting === opt.value}
                        onChange={() => set("targeting", opt.value)}
                        className="accent-primary"
                      />
                      <div
                        className={`w-7 h-7 rounded bg-background flex items-center justify-center text-text-secondary ${form.targeting === opt.value ? "text-primary bg-primary/10" : ""}`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-bold ${form.targeting === opt.value ? "text-primary" : "text-text-primary"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-text-secondary">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {form.targeting === "category" && (
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                    Select Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-bold text-text-primary outline-none focus:border-primary transition-all"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">
                    Title
                  </label>
                  <input
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-bold text-text-primary focus:border-primary outline-none"
                    placeholder={placeholders.title}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-primary outline-none resize-none"
                    rows={4}
                    placeholder={placeholders.body}
                    value={form.body}
                    onChange={(e) => set("body", e.target.value)}
                  />
                </div>

                <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
                  <p className="text-[10px] font-bold text-primary uppercase mb-2">
                    Placeholders
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["{user_name}", "{book_title}", "{discount}"].map((ph) => (
                      <button
                        key={ph}
                        onClick={() => set("body", form.body + ph)}
                        className="px-2 py-0.5 bg-white border border-primary/20 text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-white transition-all"
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => set("sendInstant", true)}
                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      form.sendInstant
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-border text-text-secondary hover:border-primary/20"
                    }`}
                  >
                    <Send size={14} /> Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => set("sendInstant", false)}
                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      !form.sendInstant
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-border text-text-secondary hover:border-primary/20"
                    }`}
                  >
                    <Clock size={14} /> Schedule
                  </button>
                </div>

                {!form.sendInstant && (
                  <input
                    type="datetime-local"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-bold text-text-primary focus:border-primary outline-none"
                    value={form.scheduledAt}
                    onChange={(e) => set("scheduledAt", e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-background border border-border rounded-md shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {typeStyles[form.type]?.icon || <Bell size={14} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {form.title || "No Title"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1 leading-normal">
                      {form.body || "No message content entered"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 border border-border rounded-md">
                  <p className="uppercase font-bold text-text-secondary opacity-60 mb-1">
                    Target
                  </p>
                  <p className="font-bold text-text-primary">
                    {
                      TARGETING_OPTIONS.find((o) => o.value === form.targeting)
                        ?.label
                    }
                  </p>
                </div>
                <div className="p-3 border border-border rounded-md">
                  <p className="uppercase font-bold text-text-secondary opacity-60 mb-1">
                    Delivery
                  </p>
                  <p className="font-bold text-text-primary">
                    {form.sendInstant ? "Immediate" : "Scheduled"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-between gap-3 bg-background/50">
          <Button
            variant="secondary"
            onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                step === 1 && form.targeting === "category" && !form.category
              }
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={() => onSave(form)}
              loading={isSending}
              disabled={
                !form.title.trim() || (!form.sendInstant && !form.scheduledAt)
              }
            >
              {form.sendInstant ? "Send Notification" : "Schedule Notification"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreateNotificationModal;
