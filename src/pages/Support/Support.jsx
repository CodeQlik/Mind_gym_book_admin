import React, { useState, useEffect, useCallback } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  TrendingUp,
  Inbox,
  Package,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchTickets,
  fetchSupportStats,
  setCurrentPage,
  updateStatus,
} from "../../store/slices/supportSlice";
import Table from "../../components/Table/Table";
import Button from "../../components/UI/Button";
import SearchInput from "../../components/Search/SearchInput";
import { toast } from "react-hot-toast";

const TABS = [
  { label: "All Tickets", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const PAGE_LIMIT = 10;

const Support = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { tickets, loading, stats, statsLoading, totalPages, currentPage } =
    useSelector((state) => state.support);

  const loadTickets = useCallback(
    (page = 1, search = "") => {
      const params = { page, limit: PAGE_LIMIT };
      if (activeTab !== "all") params.status = activeTab;
      if (search.trim()) params.search = search.trim();
      dispatch(fetchTickets(params));
    },
    [dispatch, activeTab],
  );

  useEffect(() => {
    dispatch(fetchSupportStats());
  }, [dispatch]);

  // Handle tab changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
    loadTickets(1, searchQuery);
  }, [activeTab, dispatch, loadTickets]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setCurrentPage(1));
      loadTickets(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, loadTickets, dispatch]);

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    loadTickets(page, searchQuery);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-success-surface text-success border-success/20";
      case "closed":
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
      default:
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20 font-black";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20 font-bold";
      case "medium":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20 font-semibold";
      default:
        return "text-text-secondary bg-surface border-border";
    }
  };

  const columns = [
    {
      header: "Ticket ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <LifeBuoy size={16} />
          </div>
          <span className="font-black text-text-primary text-[13px] tracking-tight uppercase">
            {row.ticket_no}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-text-secondary font-bold text-[11px] border border-border">
            {(row.user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-xs uppercase tracking-tight">
              {row.user?.name || "Guest"}
            </span>
            <span className="text-text-secondary text-[10px] opacity-60">
              {row.user?.email || "No Email"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Subject",
      render: (row) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-black text-text-primary text-[12px] uppercase tracking-tight truncate">
            {row.subject}
          </span>
          <span className="text-[10px] text-text-secondary truncate opacity-60">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      header: "Priority",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getPriorityStyle(row.priority)}`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: "Created",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-bold">
          <Clock size={12} className="opacity-40" />
          {new Date(row.createdAt || row.created_at).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
            },
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={async (e) => {
            const newStatus = e.target.value;
            try {
              const res = await dispatch(
                updateStatus({ id: row.id, status: newStatus }),
              ).unwrap();
              if (res.success) {
                toast.success(
                  `Ticket #${row.ticket_no} marked as ${newStatus}`,
                );
                dispatch(fetchSupportStats()); // Refresh stats
                loadTickets(currentPage, searchQuery); // Refresh list
              }
            } catch (err) {
              toast.error("Failed to update status");
            }
          }}
          className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(
            row.status,
          )} shadow-sm inline-block cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-center min-w-[110px]`}
        >
          {TABS.filter((t) => t.value !== "all").map((tab) => (
            <option
              key={tab.value}
              value={tab.value}
              className="bg-surface text-text-primary font-bold uppercase py-2"
            >
              {tab.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/support/chat/${row.id}`)}
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all group"
            title="Respond to Ticket"
          >
            <MessageSquare
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            onClick={() => {
              if (row.order_id) {
                navigate(`/orders/view/${row.order_id}`);
              } else {
                navigate(`/users/view/${row.user_id}`);
              }
            }}
            className="w-8 h-8 rounded-lg bg-surface hover:bg-background text-text-secondary flex items-center justify-center transition-all group border border-border"
            title={row.order_id ? "View Linked Order" : "View User Profile"}
          >
            {row.order_id ? (
              <Package
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
            ) : (
              <User
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
            )}
          </button>
        </div>
      ),
    },
  ];

  const statCards = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: Inbox,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "Open",
      value: stats.open,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="flex flex-col min-h-full gap-4 animate-fade-in font-['Outfit'] pb-4 pt-2">
      {/* Premium Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">
            Customer Support
          </h1>
          <p className="text-text-secondary text-sm font-medium opacity-60">
            Monitor and resolve user queries efficiently.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
            <BarChart3 size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              {stats.open} Critical Tickets
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-surface p-4 rounded-3xl border border-border shadow-sm flex flex-col gap-2 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}
              >
                <stat.icon size={18} />
              </div>
              <span className="text-xl font-black text-text-primary tracking-tighter">
                {statsLoading ? "â€”" : stat.value}
              </span>
            </div>
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Refined Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-8 bg-surface/30 px-4 pt-2 -mx-2 mb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${
                isActive
                  ? "text-primary"
                  : "text-text-secondary opacity-40 hover:opacity-100"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full shadow-[0_-1px_10px_rgba(41,98,255,0.4)] animate-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ticket ID or customer..."
          className="max-w-md w-full"
        />
        <Button
          variant="outline"
          size="sm"
          icon={Filter}
          className="rounded-xl font-black text-[10px] uppercase tracking-widest"
        >
          Advanced Filters
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-4">
        <Table
          columns={columns}
          data={tickets}
          loading={loading}
          emptyMessage={`No ${activeTab === "all" ? "" : activeTab} tickets found.`}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest opacity-40">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-primary px-3">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
