import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  Zap,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Trash2,
  Info,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { couponApi } from "../../api/couponApi";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const ViewCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCoupon = async () => {
    try {
      const res = await couponApi.getCouponById(id);
      if (res.success) {
        setCoupon(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch coupon:", err);
      toast.error("Failed to load coupon details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="mt-4 text-text-secondary font-medium">
          Fetching coupon data...
        </p>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-2xl border border-border shadow-sm">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
          <Ticket size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Coupon Not Found
        </h2>
        <p className="text-sm text-text-secondary mb-6 text-center max-w-xs">
          The coupon you are looking for does not exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/coupons")}>Back to Coupons</Button>
      </div>
    );
  }

  const isExpired = new Date(coupon.end_date) < new Date();
  const daysRemaining = Math.ceil(
    (new Date(coupon.end_date) - new Date()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 text-left">
      {/* Header Area */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/coupons")}
          className="flex items-center gap-2 text-xs font-black text-text-secondary hover:text-primary transition-all uppercase tracking-widest w-fit"
        >
          <ArrowLeft size={14} /> Back to Coupons
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center text-primary bg-primary/5 shadow-inner">
              <Ticket size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">
                  {coupon.code}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${coupon.is_active ? "bg-success/10 text-success border border-success/20" : "bg-text-secondary/10 text-text-secondary border border-text-secondary/20"}`}
                >
                  {coupon.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-text-secondary font-medium mt-1">
                {coupon.description ||
                  "No description provided for this coupon campaign."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Edit Button can be added here if needed */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                  Discount Value
                </p>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {coupon.discount_type === "percentage" ? (
                    <Percent size={16} />
                  ) : (
                    <span className="font-bold text-lg">{"\u20B9"}</span>
                  )}
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary">
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}%`
                  : `\u20B9${parseFloat(coupon.discount_value || 0).toLocaleString("en-IN")}`}
                <span className="text-xs text-text-secondary font-bold uppercase tracking-widest ml-2 opacity-40">
                  reduction
                </span>
              </h3>
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
                {coupon.discount_type === "percentage" &&
                  coupon.max_discount && (
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-secondary">Capped At</span>
                      <span className="text-text-primary">
                        {"\u20B9"}
                        {parseFloat(coupon.max_discount).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-secondary">Minimum Spend</span>
                  <span className="text-text-primary">
                    {"\u20B9"}
                    {parseFloat(coupon.min_order_amount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                  Performance
                </p>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Zap size={16} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary">
                {coupon.used_count || 0}
                <span className="text-xs text-text-secondary font-bold uppercase tracking-widest ml-2 opacity-40">
                  Orders
                </span>
              </h3>
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase">
                  <span className="text-text-secondary">Usage Progress</span>
                  <span className="text-primary">
                    {coupon.used_count} / {coupon.usage_limit || "âˆž"}
                  </span>
                </div>
                <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark shadow-[0_0_10px_rgba(41,98,255,0.3)] transition-all duration-1000"
                    style={{
                      width: coupon.usage_limit
                        ? `${(coupon.used_count / coupon.usage_limit) * 100}%`
                        : "15%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-border bg-background/50 flex items-center gap-3">
              <Info size={18} className="text-text-secondary opacity-40" />
              <h3 className="font-black text-text-primary text-[10px] uppercase tracking-[0.2em]">
                Full Specifications
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <DetailRow
                  label="Promotion Type"
                  value={
                    coupon.discount_type === "percentage"
                      ? "Percentage Based Discount"
                      : "Fixed Amount Deduction"
                  }
                  icon={Layers}
                />
                <DetailRow
                  label="Eligibility"
                  value={`Minimum purchase of \u20B9${parseFloat(coupon.min_order_amount).toLocaleString("en-IN")} required.`}
                  icon={ShoppingBag}
                />
                <DetailRow
                  label="Benefit Cap"
                  value={
                    coupon.max_discount
                      ? `Maximum discount of \u20B9${parseFloat(coupon.max_discount).toLocaleString("en-IN")}.`
                      : "No upper limit applied."
                  }
                  icon={DollarSign}
                />
              </div>
              <div className="space-y-6">
                <DetailRow
                  label="Created On"
                  value={new Date(
                    coupon.createdAt || coupon.created_at,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  icon={Calendar}
                />
                <DetailRow
                  label="Visibility Status"
                  value={
                    coupon.is_active
                      ? "Visible and valid for use"
                      : "Hidden and ignored by checkout"
                  }
                  icon={CheckCircle}
                  color={
                    coupon.is_active ? "text-success" : "text-text-secondary"
                  }
                />
                <DetailRow
                  label="Database Reference"
                  value={coupon.id || coupon._id}
                  icon={Tag}
                  mono
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div
            className={`p-8 rounded-3xl border shadow-sm transition-all ${isExpired ? "bg-error/5 border-error/20" : "bg-primary/5 border-primary/20 shadow-md shadow-primary/5"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${isExpired ? "text-error" : "text-primary"}`}
              >
                Temporal Validity
              </h3>
              <div
                className={`p-2 rounded-xl ${isExpired ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}
              >
                <Clock size={16} />
              </div>
            </div>

            <div className="space-y-6 relative ml-2">
              {/* Timeline dashed line */}
              <div className="absolute top-0 bottom-0 left-0 w-px border-l-2 border-dashed border-border/60 -ml-2" />

              <div className="relative pl-6">
                <div className="absolute top-1 left-0 w-2.5 h-2.5 rounded-full bg-primary -ml-[13px] border-2 border-background shadow-sm" />
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-50">
                  Valid From
                </p>
                <p className="text-sm font-black text-text-primary mt-0.5">
                  {new Date(coupon.start_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="relative pl-6">
                <div
                  className={`absolute top-1 left-0 w-2.5 h-2.5 rounded-full -ml-[13px] border-2 border-background shadow-sm ${isExpired ? "bg-error" : "bg-success"}`}
                />
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-50">
                  Expiration
                </p>
                <p className="text-sm font-black text-text-primary mt-0.5">
                  {new Date(coupon.end_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div
              className={`mt-8 p-4 rounded-2xl border flex flex-col items-center gap-1 text-center ${isExpired ? "bg-error/10 border-error/20" : "bg-success/10 border-success/20"}`}
            >
              {isExpired ? (
                <>
                  <XCircle size={18} className="text-error" />
                  <span className="text-[11px] font-black text-error uppercase tracking-widest">
                    Expired campaign
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-success tracking-tighter">
                    {daysRemaining}
                  </span>
                  <span className="text-[9px] font-black text-success/60 uppercase tracking-widest">
                    Days remaining
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions Box */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm text-center">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-4 opacity-40">
              System Actions
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 transition-all h-12 rounded-2xl font-black text-xs uppercase tracking-widest"
                icon={Edit2}
                onClick={() => navigate("/coupons")}
              >
                Modify
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
  icon: Icon,
  color = "text-text-primary",
  mono = false,
}) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-text-secondary opacity-40 group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20 transition-all shrink-0">
      <Icon size={18} />
    </div>
    <div className="flex flex-col min-w-0">
      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
        {label}
      </p>
      <p
        className={`text-sm font-bold truncate mt-0.5 ${color} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default ViewCoupon;
