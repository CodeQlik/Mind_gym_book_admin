import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  MessageSquare,
  User,
  Phone,
  Trash2,
} from "lucide-react";
import {
  getAllContactQueries,
  updateQueryStatus,
  deleteContactQuery,
} from "../../api/contactApi";

import Table from "../../components/Table/Table";
import Button from "../../components/UI/Button";
import SearchInput from "../../components/Search/SearchInput";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const STATUS_TABS = [
  { label: "All Messages", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Responded", value: "responded" },
  { label: "Closed", value: "closed" },
];

const PAGE_LIMIT = 10;

const ContactMessages = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadQueries = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await getAllContactQueries(page, PAGE_LIMIT);
        if (data.status === "success") {
          setQueries(data.queries);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadQueries(currentPage);
  }, [loadQueries, currentPage]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateQueryStatus(id, newStatus);
      if (res.status === "success") {
        toast.success("Status updated successfully");
        setQueries((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const res = await deleteContactQuery(id);
        if (res.status === "success") {
          toast.success("Message deleted successfully");
          setQueries((prev) => prev.filter((q) => q.id !== id));
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete message");
      }
    }
  };


  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "responded":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "closed":
        return "bg-success-surface text-success border-success/20";
      default:
        return "bg-slate-500/10 text-text-secondary border-slate-500/20";
    }
  };

  const columns = [
    {
      header: "Sender",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-[11px] border border-primary/10">
            {row.name ? row.name[0].toUpperCase() : "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-xs uppercase tracking-tight">
              {row.name}
            </span>
            <span className="text-text-secondary text-[10px] opacity-60">
              {row.email}
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
            {row.message}
          </span>
        </div>
      ),
    },
    {
      header: "Contact Info",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold">
            <Mail size={10} className="opacity-40" />
            {row.email}
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold">
              <Phone size={10} className="opacity-40" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Received At",
      render: (row) => {
        const date = row.created_at || row.createdAt;
        return (
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-bold">
            <Clock size={12} className="opacity-40" />
            {date ? new Date(date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) : "N/A"}
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(
            row.status,
          )} shadow-sm inline-block cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-center min-w-[110px]`}
        >
          <option value="pending">Pending</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/messages/view/${row.id}`)}
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all group"
            title="View Details"
          >
            <Eye size={14} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-all group"
            title="Delete Message"
          >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  const filteredQueries = activeTab === "all" 
    ? queries 
    : queries.filter(q => q.status === activeTab);

  return (
    <div className="flex flex-col min-h-full gap-4 animate-fade-in font-['Outfit'] pb-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">
            Contact Messages
          </h1>
          <p className="text-text-secondary text-sm font-medium opacity-60">
            Manage inquiries and messages from website users.
          </p>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-8 bg-surface/30 px-4 pt-2 -mx-2 mb-2">
        {STATUS_TABS.map((tab) => {
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

      <div className="flex flex-col gap-4">
        <Table
          columns={columns}
          data={filteredQueries}
          loading={loading}
          emptyMessage={`No ${activeTab === "all" ? "" : activeTab} messages found.`}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest opacity-40">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-primary px-3">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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

export default ContactMessages;
