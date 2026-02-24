import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
} from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments } from "../../store/slices/paymentSlice";

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  const filteredPayments = Array.isArray(payments)
    ? payments.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.razorpay_payment_id
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          p.status?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const columns = [
    {
      header: "Transaction ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${row.status === "captured" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
          >
            {row.amount > 0 ? (
              <ArrowUpRight size={18} />
            ) : (
              <ArrowDownLeft size={18} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm tracking-tight">
              {row.razorpay_payment_id || "N/A"}
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-medium">
              Order ID: {row.razorpay_order_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.user?.name || "U").charAt(0)}
          </div>
          <span className="text-sm font-bold text-text-primary italic">
            {row.user?.name || "Anonymous"}
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
      header: "Amount",
      render: (row) => (
        <span className="font-black text-text-primary text-[15px]">
          ₹{(row.amount / 100).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] min-w-[100px] text-center transition-all duration-300 shadow-sm border ${
            row.status === "captured" || row.status === "success"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5"
          }`}
        >
          {row.status}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit']">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight leading-tight">
            Transaction <span className="text-primary italic">History</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Track and monitor all successful and failed payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface border border-border text-text-primary font-bold text-sm hover:bg-surface/80 transition-all shadow-sm">
            <Download size={18} className="text-primary" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface/50 p-6 rounded-[2rem] border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary opacity-60 mb-1">
              Total Revenue
            </p>
            <h3 className="text-2xl font-black text-text-primary">
              ₹
              {(
                payments.reduce(
                  (acc, curr) =>
                    acc + (curr.status === "captured" ? curr.amount : 0),
                  0,
                ) / 100
              ).toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ArrowUpRight size={24} />
          </div>
        </div>
        <div className="bg-surface/50 p-6 rounded-[2rem] border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary opacity-60 mb-1">
              Transactions
            </p>
            <h3 className="text-2xl font-black text-text-primary">
              {payments.length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard size={24} />
          </div>
        </div>
        <div className="bg-surface/50 p-6 rounded-[2rem] border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary opacity-60 mb-1">
              Success Rate
            </p>
            <h3 className="text-2xl font-black text-text-primary">
              {payments.length > 0
                ? (
                    (payments.filter((p) => p.status === "captured").length /
                      payments.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap size={24} />
          </div>
        </div>
      </div>

      <div className="text-left space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID, User, or Status..."
          onReset={() => setSearchQuery("")}
        />

        <Table
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyMessage="No payment transactions found."
        />
      </div>
    </div>
  );
};

export default Payments;
