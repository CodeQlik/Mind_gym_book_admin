import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Download,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Tag,
} from "lucide-react";
import Table from "../../components/Table/Table";
import Button from "../../components/UI/Button";
import SearchInput from "../../components/Search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOrders,
  fetchOrderStats,
  searchOrders,
  updateStatus,
  deleteOrder,
  setCurrentPage,
} from "../../store/slices/orderSlice";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const TABS = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
];

const PAGE_LIMIT = 10;

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // order id

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, stats, statsLoading, totalPages, currentPage } =
    useSelector((state) => state.orders);

  // ─── Load stats once ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchOrderStats());
  }, [dispatch]);

  // ─── Load orders whenever tab or page changes ─────────────────
  const loadOrders = useCallback(
    (page = 1) => {
      const params = { page, limit: PAGE_LIMIT };
      if (activeTab !== "all") params.delivery_status = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      dispatch(fetchOrders(params));
    },
    [dispatch, activeTab, searchQuery],
  );

  useEffect(() => {
    // Reset to page 1 when tab changes
    dispatch(setCurrentPage(1));
    loadOrders(1);
  }, [activeTab, dispatch]); // eslint-disable-line

  // ─── Search — debounced via useEffect ────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        dispatch(
          searchOrders({ q: searchQuery.trim(), page: 1, limit: PAGE_LIMIT }),
        );
      } else if (searchQuery.trim() === "") {
        loadOrders(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line

  // ─── Handlers ────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setSearchQuery("");
    setActiveTab(tab);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    loadOrders(page);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(
        updateStatus({ id, updates: { delivery_status: newStatus } }),
      ).unwrap();
      toast.success(`Status updated to ${newStatus}`);
      dispatch(fetchOrderStats());
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteOrder(deleteConfirm)).unwrap();
      toast.success("Order deleted");
      setDeleteConfirm(null);
      dispatch(fetchOrderStats());
    } catch (err) {
      toast.error(err || "Failed to delete order");
    }
  };

  // ─── Styling helpers ─────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-success-surface text-success border-success/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-error-surface text-error border-error/20";
      case "returned":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
    }
  };

  // ─── Table columns ────────────────────────────────────────────
  const columns = [
    {
      header: "Order NO",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <Package size={16} />
          </div>
          <span className="font-bold text-text-primary text-sm whitespace-nowrap">
            {row.order_no || `#${row.id}`}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
            {(row.user?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm">
              {row.user?.name || "Guest"}
            </span>
            <span className="text-text-secondary text-[11px]">
              {row.user?.email || ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => {
        const dateValue = row.createdAt || row.created_at;
        return (
          <div className="flex items-center gap-2 text-text-secondary text-[13px] font-semibold">
            <Calendar size={13} className="opacity-40" />
            {dateValue
              ? new Date(dateValue).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </div>
        );
      },
    },
    {
      header: "Books",
      render: (row) => {
        const count =
          row.items?.length || row.books?.length || row.items_count || 0;
        return (
          <span className="font-bold text-text-primary text-sm">
            {count} book(s)
          </span>
        );
      },
    },
    {
      header: "Amount",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-sm whitespace-nowrap">
            ₹{parseFloat(row.total_amount || 0).toLocaleString("en-IN")}
          </span>
          {row.coupon && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="bg-success-surface text-success text-[8px] font-black px-1.5 py-0.5 rounded border border-success/20 uppercase tracking-widest flex items-center gap-1">
                <Tag size={8} /> {row.coupon.code}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Payment",
      render: (row) => {
        const method = row.payment_method || row.payment_type || "—";
        const status = row.payment_status?.toLowerCase();

        const getStatusColor = (s) => {
          if (s === "paid")
            return "text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded";
          if (s === "pending")
            return "text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded";
          if (s === "failed" || s === "unpaid")
            return "text-rose-500 bg-rose-500/5 px-1.5 py-0.5 rounded";
          return "text-text-secondary";
        };

        const isCod = method.toLowerCase() === "cod";
        const displayStatus =
          isCod && status === "pending"
            ? "DUE ON DELIVERY"
            : status || "PENDING";

        return (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-text-primary text-[13px] leading-tight capitalize">
              {method}
            </span>
            <span
              className={`text-[9px] font-black uppercase tracking-wider w-fit ${getStatusColor(status || "pending")}`}
            >
              {displayStatus}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(row.delivery_status)} shadow-sm inline-block`}
        >
          {row.delivery_status || "Pending"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* View */}
          <button
            onClick={() => navigate(`/orders/view/${row.id}`)}
            title="View Order"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all"
          >
            <Eye size={14} />
          </button>
          {/* Delete */}
          <button
            onClick={() => setDeleteConfirm(row.id)}
            title="Delete Order"
            className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // ─── Stat card config ─────────────────────────────────────────
  const statCards = [
    {
      label: "Processing",
      key: "processing",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      icon: Clock,
    },
    {
      label: "Shipped",
      key: "shipped",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      icon: Truck,
    },
    {
      label: "Delivered",
      key: "delivered",
      color: "text-success",
      bg: "bg-success/10",
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      key: "cancelled",
      color: "text-error",
      bg: "bg-error/10",
      icon: AlertCircle,
    },
    {
      label: "Returned",
      key: "returned",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      icon: RotateCcw,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Order Management
          </h1>
          <p className="text-text-secondary text-sm">
            Monitor and fulfill customer orders.
          </p>
        </div>
        <Button onClick={() => toast.success("Manifest generated")}>
          <Download size={14} className="mr-2" />
          Export Manifest
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            onClick={() =>
              handleTabChange(activeTab === stat.key ? "all" : stat.key)
            }
            className={`bg-surface p-3 rounded-xl border shadow-sm flex flex-col gap-1.5 cursor-pointer transition-all hover:shadow-md select-none ${
              activeTab === stat.key
                ? "border-primary ring-2 ring-primary/10"
                : "border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] opacity-40">
                {stat.label}
              </span>
              <div
                className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon size={12} className={stat.color} />
              </div>
            </div>
            <h3
              className={`text-xl font-black tracking-tight ${
                activeTab === stat.key ? "text-primary" : "text-text-primary"
              }`}
            >
              {statsLoading ? "—" : (stats[stat.key] ?? 0)}
            </h3>
          </div>
        ))}
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-8 bg-surface/30 px-4 pt-2 -mx-2 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${
              activeTab === tab.value
                ? "text-primary"
                : "text-text-secondary opacity-40 hover:opacity-100"
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full shadow-[0_-1px_10px_rgba(41,98,255,0.4)] animate-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order ID, customer name or phone..."
          className="max-w-md w-full"
          onReset={() => {
            setSearchQuery("");
            setActiveTab("all");
            loadOrders(1);
          }}
        />

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2">
            <Package size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              {orders.length} Orders Showing
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-4">
        <Table
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage={
            activeTab === "all"
              ? "No orders found."
              : `No ${activeTab} orders found.`
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-text-secondary font-medium">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="text-text-secondary text-sm px-1"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                        currentPage === p
                          ? "bg-primary text-white shadow-sm"
                          : "border border-border text-text-secondary hover:text-primary hover:border-primary/30"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="This action is permanent and cannot be undone. Are you sure you want to delete this order?"
        confirmText="Yes, Delete"
        variant="danger"
        icon={Trash2}
        warningText="WARNING: This action cannot be reversed"
      />
    </div>
  );
};

export default Orders;
