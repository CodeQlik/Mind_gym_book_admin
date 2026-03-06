import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Truck,
  Hash,
  CreditCard,
  ClipboardList,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ChevronDown,
  X,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { orderApi } from "../../api/orderApi";
import Button from "../../components/UI/Button";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import ShipmentModal from "../../components/Modal/ShipmentModal";
import { useDispatch } from "react-redux";
import {
  updateStatus,
  fetchOrderStats,
  dispatchOrder,
} from "../../store/slices/orderSlice";
import toast from "react-hot-toast";

const STATUS_ORDER = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    pendingStatus: "",
  });
  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    tracking_id: "",
    courier_name: "",
    tracking_url: "",
  });

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getOrderById(id);
      if (res.success) {
        setOrder(res.data || res);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = (newStatus) => {
    if (newStatus === order.delivery_status) return;

    if (newStatus === "shipped") {
      setDispatchModal(true);
    } else {
      setStatusModal({ isOpen: true, pendingStatus: newStatus });
    }
  };

  const handleConfirmShipment = async () => {
    if (!dispatchForm.tracking_id.trim()) {
      return toast.error("Please enter a tracking ID");
    }

    try {
      await dispatch(
        dispatchOrder({
          id,
          ...dispatchForm,
        }),
      ).unwrap();

      toast.success("Order dispatched successfully!");
      setDispatchModal(false);
      fetchOrder();
      dispatch(fetchOrderStats());
    } catch (err) {
      toast.error(err || "Failed to dispatch order");
    }
  };

  const confirmStatusChange = async () => {
    const newStatus = statusModal.pendingStatus;
    try {
      await dispatch(
        updateStatus({ id, updates: { delivery_status: newStatus } }),
      ).unwrap();
      toast.success(`Status updated to ${newStatus}`);
      fetchOrder();
      dispatch(fetchOrderStats());
    } catch (err) {
      toast.error(err || "Failed to update status");
    } finally {
      setStatusModal({ isOpen: false, pendingStatus: "" });
    }
  };

  const isStatusDisabled = (optionValue) => {
    if (!order?.delivery_status) return false;
    const currentStatus = order.delivery_status.toLowerCase();
    const optionStatus = optionValue.toLowerCase();

    const currentIdx = STATUS_ORDER.indexOf(currentStatus);
    const optionIdx = STATUS_ORDER.indexOf(optionStatus);

    if (currentIdx === -1 || optionIdx === -1) return false;

    // Final states
    if (["delivered", "cancelled", "returned"].includes(currentStatus)) {
      return optionStatus !== currentStatus;
    }

    return optionIdx < currentIdx;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return {
          cls: "bg-success-surface text-success border-success/20",
          icon: CheckCircle2,
        };
      case "shipped":
        return {
          cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: Truck,
        };
      case "processing":
        return {
          cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: Clock,
        };
      case "cancelled":
        return {
          cls: "bg-error-surface text-error border-error/20",
          icon: AlertCircle,
        };
      case "returned":
        return {
          cls: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          icon: Clock,
        };
      default:
        return {
          cls: "bg-slate-500/10 text-text-secondary border-slate-500/20",
          icon: Package,
        };
    }
  };

  const getPaymentStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-success-surface text-success border-success/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "failed":
        return "bg-error-surface text-error border-error/20";
      case "refunded":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="mt-4 text-text-secondary font-medium">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-10 animate-fade-in">
        <div className="bg-surface border border-error/20 p-8 rounded-2xl shadow-xl text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-16 h-16 bg-error-surface text-error rounded-full flex items-center justify-center border border-error/20">
            <Package size={32} />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">
              Order Not Found
            </p>
            <p className="text-sm text-text-secondary mt-1">
              This order doesn't exist or has been deleted.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full"
            icon={ArrowLeft}
            onClick={() => navigate("/orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const deliveryStatus = getStatusStyle(order.delivery_status);
  const StatusIcon = deliveryStatus.icon;
  const address = order.shipping_address || order.address || null;
  const isAddressString = typeof address === "string";
  const books = order.books || order.items || order.order_items || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 font-['Outfit']">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {order.order_no ? order.order_no : `Order #${order.id}`}
              </h1>
              <p className="text-text-secondary text-sm font-medium">
                Placed on{" "}
                {order.createdAt || order.created_at
                  ? new Date(
                      order.createdAt || order.created_at,
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2 group bg-surface/50 border border-border p-1.5 pl-3 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">
                Action:
              </span>
              <div className="relative min-w-[140px]">
                <select
                  value={order.delivery_status || "processing"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl py-1.5 pl-3 pr-9 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:border-primary/40"
                >
                  <option
                    value="processing"
                    disabled={isStatusDisabled("processing")}
                  >
                    Processing
                  </option>
                  <option
                    value="shipped"
                    disabled={isStatusDisabled("shipped")}
                  >
                    Shipped
                  </option>
                  <option
                    value="delivered"
                    disabled={isStatusDisabled("delivered")}
                  >
                    Delivered
                  </option>

                  {/* Show Cancelled/Returned only if they are the current status to avoid blank dropdown */}
                  {order.delivery_status === "cancelled" && (
                    <option value="cancelled">Cancelled</option>
                  )}
                  {order.delivery_status === "returned" && (
                    <option value="returned">Returned</option>
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Badges Container */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Delivery Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider shadow-sm transition-all ${deliveryStatus.cls}`}
              >
                <StatusIcon size={12} />
                {order.delivery_status || "Unknown"}
              </div>

              {/* Payment Status Badge */}
              {order.payment_status && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider shadow-sm transition-all ${getPaymentStyle(order.payment_status)}`}
                >
                  <CreditCard size={12} />
                  {order.payment_status}
                </div>
              )}

              {/* Refund Request Alert */}
              {order.refund_requested && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                  <RotateCcw size={12} />
                  Refund Requested
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ── Main Content Area ────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Purchased Items */}
          <div className="bg-surface border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList size={18} />
                </div>
                <h3 className="font-black text-text-primary text-[10px] uppercase tracking-[0.2em]">
                  Purchased Items ({books.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-border/60 overflow-hidden">
              {books.map((item, idx) => {
                const book = item.book || item.Book || item;
                const cover = book.thumbnail?.url || book.thumbnail || null;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-primary/5 border border-border shrink-0 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={16} className="text-primary/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-text-primary text-[13px] truncate uppercase tracking-tight">
                        {book.title || "Book Title"}
                      </p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">
                        by {book.author || "Expert Author"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-text-primary text-sm tracking-tight px-3 py-1 bg-background rounded-lg border border-border">
                        ₹{item.price || book.price || 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund Request Section */}
          {order.refund_requested && (
            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] shadow-xl shadow-rose-100/30 overflow-hidden animate-in slide-in-from-top-4 duration-500">
              <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-rose-600 text-xs uppercase tracking-widest">
                      Return Request
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                  Action Required
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest ml-1">
                      Reason for Return
                    </label>
                    <div className="bg-white p-4 rounded-xl border border-rose-100 text-xs font-semibold italic text-slate-700 leading-relaxed shadow-sm">
                      "
                      {order.refund_reason ||
                        "No reason provided by the customer."}
                      "
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <div className="bg-white px-4 py-4 rounded-xl border border-rose-100 text-[11px] font-black text-slate-800 flex items-center justify-center shadow-sm whitespace-nowrap">
                      {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-rose-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 border-none shadow-lg shadow-purple-100 h-10 px-6 rounded-xl font-bold text-[11px]"
                    icon={RotateCcw}
                    disabled={order.delivery_status === "returned"}
                    onClick={() => handleStatusChange("returned")}
                  >
                    Approve & Restock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-success text-success hover:bg-success/5 h-10 px-6 rounded-xl font-bold border-2 text-[11px]"
                    icon={CheckCircle2}
                    disabled={order.payment_status === "refunded"}
                    onClick={async () => {
                      try {
                        await dispatch(
                          updateStatus({
                            id,
                            updates: { payment_status: "refunded" },
                          }),
                        ).unwrap();
                        toast.success("Refunded");
                        fetchOrder();
                      } catch (err) {
                        toast.error("Failed");
                      }
                    }}
                  >
                    Mark Refunded
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Dispatch Details */}
          {(order.tracking_id || order.courier_name || order.tracking_url) && (
            <div className="bg-white border border-border rounded-[2rem] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-blue-50/50">
                <Truck size={16} className="text-blue-500" />
                <h3 className="font-black text-text-primary text-[10px] uppercase tracking-widest">
                  Dispatch Info
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoField
                  label="Tracking ID"
                  value={order.tracking_id}
                  icon={Hash}
                  mono
                />
                <InfoField
                  label="Courier"
                  value={order.courier_name}
                  icon={Truck}
                />
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 opacity-50">
                    Track URL
                  </label>
                  <div className="bg-white px-4 py-3 rounded-2xl text-sm border border-border flex items-center gap-3 shadow-sm h-[40px]">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500/40">
                      <Truck size={12} />
                    </div>
                    {order.tracking_url ? (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-black text-[11px] uppercase tracking-tight hover:underline truncate"
                      >
                        Open Tracker
                      </a>
                    ) : (
                      <span className="text-text-secondary font-bold text-[11px]">
                        N/A
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar: Order Info & Stats ─────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-6">
          {/* Customer & Address Card */}
          <div className="bg-surface border border-border rounded-[2rem] shadow-sm p-6 flex flex-col gap-5 relative overflow-hidden bg-white">
            <h3 className="font-black text-text-primary text-[9px] uppercase tracking-[0.2em] opacity-40">
              Customer Info
            </h3>

            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20 shrink-0">
                {(order.user?.name || "G")[0]}
              </div>
              <div className="min-w-0">
                <p className="font-black text-text-primary text-sm uppercase tracking-tight truncate">
                  {order.user?.name || "Guest User"}
                </p>
                <span className="text-[9px] text-primary font-black uppercase tracking-widest">
                  #{order.user_id}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <InfoField label="Email" value={order.user?.email} icon={Mail} />
              <InfoField
                label="Phone"
                value={order.user?.phone || order.phone}
                icon={Phone}
              />
              <div className="pt-2">
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 opacity-40">
                  Shipping Destination
                </label>
                <div className="mt-1 p-3 bg-background rounded-xl border border-border/50 italic text-[11px] font-medium text-text-secondary leading-relaxed">
                  <MapPin size={10} className="inline mr-1 text-primary/40" />
                  {isAddressString ? address : "Address Data Model"}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary card */}
          <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6">
            <h3 className="font-black text-primary text-[9px] uppercase tracking-[0.2em] mb-4">
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-primary/10">
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  Status
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${getPaymentStyle(order.payment_status).split(" ").slice(0, 2).join(" ")}`}
                >
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/20">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  Total
                </span>
                <span className="text-xl font-black tracking-tighter">
                  ₹{order.total_amount}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/50 rounded-xl border border-primary/10 text-[10px] font-bold text-text-secondary">
                <Calendar size={12} className="text-primary/40" />
                Placed: {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Update Confirmation Modal ────────────────────────── */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, pendingStatus: "" })}
        onConfirm={confirmStatusChange}
        title="Update Order Status"
        message={
          <>
            Are you sure you want to change the status to{" "}
            <span className="font-bold uppercase text-slate-800">
              {statusModal.pendingStatus}
            </span>
            ?
          </>
        }
        confirmText="Yes, Change Status"
        variant="danger"
        icon={Trash2}
        warningText="WARNING: THIS ACTION IS PERMANENT"
      />

      {/* ── Shipment Details Modal ─────────────────────────────── */}
      <ShipmentModal
        isOpen={dispatchModal}
        onClose={() => setDispatchModal(false)}
        onConfirm={handleConfirmShipment}
        formData={dispatchForm}
        setFormData={setDispatchForm}
        isProcessing={false} // You can link this to a loading state if available
      />
    </div>
  );
};

const InfoField = ({ label, value, icon: Icon, mono = false }) => (
  <div className="space-y-1 group/info">
    <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 opacity-50 group-hover/info:opacity-100 transition-opacity">
      {label}
    </label>
    <div className="bg-white px-4 py-2.5 rounded-2xl text-[12px] border border-border flex items-center gap-2.5 shadow-sm group-hover/info:border-primary/30 transition-all">
      <div className="w-7 h-7 rounded-lg bg-primary/[0.03] flex items-center justify-center text-primary/40 group-hover/info:text-primary transition-colors shrink-0">
        {Icon && <Icon size={12} />}
      </div>
      <span
        className={`${mono ? "font-mono" : "font-black"} text-text-primary break-all leading-snug tracking-tight uppercase truncate`}
      >
        {value || "Not Provided"}
      </span>
    </div>
  </div>
);

export default ViewOrder;
