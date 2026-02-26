import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Download,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateStatus } from "../../store/slices/orderSlice";
import { toast } from "react-hot-toast";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(updateStatus({ id, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (o) =>
          o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.delivery_status?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const columns = [
    {
      header: "Order ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <Package size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm tracking-tight capitalize">
              #{row.order_id?.slice(-8) || row.id}
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-black uppercase tracking-widest">
              Digital/Physical
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
            {(row.user?.name || "C").charAt(0)}
          </div>
          <span className="text-sm font-bold text-text-primary italic">
            {row.user?.name || "Guest Customer"}
          </span>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <div className="flex items-center gap-2 text-text-secondary font-bold text-[13px]">
          <Calendar size={14} className="opacity-40" />
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      header: "Items",
      render: (row) => (
        <span className="text-sm font-bold text-text-primary italic">
          {row.books?.length || 1} Books
        </span>
      ),
    },
    {
      header: "Total",
      render: (row) => (
        <span className="font-black text-text-primary text-[15px]">
          ₹{parseFloat(row.total_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.delivery_status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer transition-all ${getStatusStyle(row.delivery_status)}`}
        >
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit'] text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight leading-tight">
            Order <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Monitor physical shipments and digital purchase fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-text-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-primary/10">
            <Download size={16} />
            Export Order Manifest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Pending",
            value: orders.filter((o) => o.delivery_status === "processing")
              .length,
            color: "text-amber-500",
            icon: Clock,
          },
          {
            label: "Shipped",
            value: orders.filter((o) => o.delivery_status === "shipped").length,
            color: "text-blue-500",
            icon: Truck,
          },
          {
            label: "Delivered",
            value: orders.filter((o) => o.delivery_status === "delivered")
              .length,
            color: "text-emerald-500",
            icon: CheckCircle2,
          },
          {
            label: "Refunds",
            value: 0,
            color: "text-rose-500",
            icon: AlertCircle,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                {stat.label}
              </span>
              <stat.icon size={18} className={stat.color} />
            </div>
            <h3 className="text-2xl font-black text-text-primary italic">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by Order ID, Customer, or Status..."
          onReset={() => setSearchQuery("")}
        />

        <Table
          columns={columns}
          data={filteredOrders}
          loading={loading}
          emptyMessage="No orders found."
        />
      </div>
    </div>
  );
};

export default Orders;
