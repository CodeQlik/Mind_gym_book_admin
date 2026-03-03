import React, { useState, useEffect } from "react";
import {
  Package,
  Download,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";
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
        return "bg-success-surface text-success border-success/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-error-surface text-error border-error/20";
      default:
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
    }
  };

  const columns = [
    {
      header: "Order ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <Package size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm capitalize">
              #{row.order_id?.slice(-8) || row.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-2 text-[15px]">
          <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
            {(row.user?.name || "C").charAt(0)}
          </div>
          <span className="font-bold text-text-primary">
            {row.user?.name || "Guest Customer"}
          </span>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => {
        const dateValue = row.createdAt || row.created_at;
        return (
          <div className="flex items-center gap-2 text-text-secondary text-[14px] font-semibold">
            <Calendar size={14} className="opacity-40" />
            {dateValue
              ? new Date(dateValue).toLocaleDateString("en-US", {
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
      render: (row) => (
        <span className="text-[15px] font-bold text-text-primary">
          {row.books?.length || 1} Items
        </span>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-bold text-text-primary text-[15px]">
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
          className={`px-3 py-1.5 rounded-md text-[12px] font-bold uppercase tracking-wider border outline-none cursor-pointer transition-all ${getStatusStyle(row.delivery_status)}`}
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
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Order Management
          </h1>
          <p className="text-text-secondary text-sm">
            Monitor physical and digital purchase fulfillment.
          </p>
        </div>

        <Button onClick={() => toast.success("Manifest generated")}>
          <Download size={14} className="mr-2" />
          Export Manifest
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            color: "text-success",
            icon: CheckCircle2,
          },
          {
            label: "Cancelled",
            value: orders.filter((o) => o.delivery_status === "cancelled")
              .length,
            color: "text-error",
            icon: AlertCircle,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-surface p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                {stat.label}
              </span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by Order ID or Customer..."
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
