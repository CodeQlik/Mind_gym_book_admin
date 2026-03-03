import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
} from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments } from "../../store/slices/paymentSlice";
import { fetchDashboardStats } from "../../store/slices/analyticsSlice";
import { toast } from "react-hot-toast";

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dispatch = useDispatch();
  const { payments, totalItems, totalPages, loading } = useSelector(
    (state) => state.payments,
  );
  const { revenue } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAllPayments({ page: currentPage, limit: itemsPerPage }));
    dispatch(fetchDashboardStats());
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalRevenue =
    (revenue?.subscriptionIncome || 0) + (revenue?.ecommerceIncome || 0);

  const filteredPayments = Array.isArray(payments)
    ? payments.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.status?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const columns = [
    {
      header: "Payment ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 flex items-center justify-center rounded-lg ${row.status === "captured" || row.status === "success" ? "bg-success-surface text-success" : "bg-amber-500/10 text-amber-500"}`}
          >
            {row.amount > 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownLeft size={16} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm">
              {row.payment_id || "N/A"}
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              Order: {row.order_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            {(row.user?.name || "U").charAt(0)}
          </div>
          <span className="text-sm font-bold text-text-primary">
            {row.user?.name || "Anonymous"}
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
      header: "Type",
      render: (row) => (
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${row.payment_type === "subscription" ? "text-violet-500" : "text-blue-500"}`}
          >
            {row.payment_type?.replace("_", " ") || "Payment"}
          </span>
          {row.plan_name && (
            <span className="text-[10px] font-bold text-text-primary">
              {row.plan_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-bold text-text-primary text-sm">
          ₹
          {parseFloat(row.amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <div
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-block ${
            row.status === "captured" || row.status === "success"
              ? "bg-success-surface text-success border-success/20"
              : "bg-error-surface text-error border-error/20"
          }`}
        >
          {row.status}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Transaction History
          </h1>
          <p className="text-text-secondary text-sm">
            Track all financial activities on your platform.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => toast.success("CSV export started")}
        >
          <Download size={14} className="mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary opacity-60">
              Total Revenue
            </span>
            <h3 className="text-xl font-bold text-text-primary">
              ₹{totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success-surface flex items-center justify-center text-success">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary opacity-60">
              Transactions
            </span>
            <h3 className="text-xl font-bold text-text-primary">
              {totalItems || payments.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary opacity-60">
              Success Rate
            </span>
            <h3 className="text-xl font-bold text-text-primary">
              {payments.length > 0
                ? (
                    (payments.filter(
                      (p) => p.status === "captured" || p.status === "success",
                    ).length /
                      payments.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap size={20} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by Payment ID, User, or Status..."
          onReset={() => setSearchQuery("")}
        />

        <Table
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyMessage="No transactions found."
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default Payments;
