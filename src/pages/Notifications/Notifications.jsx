import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Table from "../../components/Table/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  deleteNotification,
  sendNotification,
} from "../../store/slices/notificationSlice";
import CreateNotificationModal, {
  TARGETING_OPTIONS,
} from "../../components/Modal/CreateNotificationModal";
import Pagination from "../../components/Pagination/Pagination";
import {
  Bell,
  BellOff,
  BellRing,
  Plus,
  CheckCheck,
  Trash2,
  BookOpen,
  Loader2,
  Send,
  Clock,
  Users,
  Tag,
  Heart,
  RefreshCw,
  Settings,
  ChevronDown,
  X,
  Zap,
  Megaphone,
  Bot,
  Sliders,
  Filter,
  AlertCircle,
  CheckCircle2,
  Timer,
  MoreVertical,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const STATUS_STYLES = {
  Sent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Recurring: "bg-primary/10 text-primary border-primary/20",
  Draft: "bg-secondary/10 text-text-secondary border-border",
  Failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const TYPE_STYLES = {
  "New Release": {
    icon: <BookOpen size={14} />,
    color: "text-primary bg-primary/10",
  },
  Subscription: {
    icon: <RefreshCw size={14} />,
    color: "text-violet-500 bg-violet-500/10",
  },
  Sale: {
    icon: <TrendingUp size={14} />,
    color: "text-amber-500 bg-amber-500/10",
  },
  Approval: {
    icon: <CheckCircle2 size={14} />,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  "Price Drop": {
    icon: <Zap size={14} />,
    color: "text-pink-500 bg-pink-500/10",
  },
  General: {
    icon: <Megaphone size={14} />,
    color: "text-cyan-500 bg-cyan-500/10",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ label, value, icon, color }) => (
  <div
    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border border-border bg-surface`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xl font-black text-text-primary leading-none font-['Outfit']">
        {value}
      </p>
      <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
        {label}
      </p>
    </div>
  </div>
);

const Badge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${STATUS_STYLES[status] || STATUS_STYLES.Draft}`}
  >
    {status === "Sent" && <CheckCircle2 size={10} />}
    {status === "Pending" && <Timer size={10} />}
    {status === "Recurring" && <RefreshCw size={10} />}
    {status === "Draft" && <AlertCircle size={10} />}
    {status === "Failed" && <X size={10} />}
    {status}
  </span>
);

const TypeBadge = ({ type }) => {
  const cfg = TYPE_STYLES[type] || TYPE_STYLES.General;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-transparent ${cfg.color}`}
    >
      {cfg.icon}
      {type}
    </span>
  );
};

// ─── Automation Settings Panel ─────────────────────────────────────────────────
const AutomationSettings = () => {
  const [subReminder, setSubReminder] = useState("7");
  const [priceDropPct, setPriceDropPct] = useState("15");
  const [approvalNotif, setApprovalNotif] = useState(true);
  const [rejectionNotif, setRejectionNotif] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Subscription Reminders */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <RefreshCw size={18} className="text-violet-500" />
          </div>
          <div>
            <h3 className="font-black text-text-primary text-base">
              Subscription Reminders
            </h3>
            <p className="text-xs text-text-secondary">
              Auto-send renewal alerts
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
            Send Reminder Before Expiry
          </label>
          <div className="flex gap-2">
            {["1", "3", "7", "14"].map((d) => (
              <button
                key={d}
                onClick={() => setSubReminder(d)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  subReminder === d
                    ? "bg-violet-500 text-white border-violet-500"
                    : "border-border text-text-secondary hover:border-violet-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Also remind on day of expiry
            </p>
            <p className="text-xs text-text-secondary">
              Final push notification
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-10 h-6 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      {/* Price Drop Alerts */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Zap size={18} className="text-pink-500" />
          </div>
          <div>
            <h3 className="font-black text-text-primary text-base">
              Price Drop Alerts
            </h3>
            <p className="text-xs text-text-secondary">
              Notify wishlisted users on drop
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
            Trigger When Price Drops By ≥
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={priceDropPct}
              onChange={(e) => setPriceDropPct(e.target.value)}
              className="flex-1 accent-pink-500"
            />
            <span className="text-2xl font-black text-pink-500 font-['Outfit'] w-14 text-center">
              {priceDropPct}%
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Users who bookmarked or wishlisted the book will be notified.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Include discount code
            </p>
            <p className="text-xs text-text-secondary">
              Attach a promo code in alert
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-10 h-6 bg-border rounded-full peer peer-checked:bg-pink-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      {/* Used Book Approval Notifications */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 lg:col-span-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-black text-text-primary text-base">
              Used Book Approval Notifications
            </h3>
            <p className="text-xs text-text-secondary">
              Auto-notify sellers on listing decisions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">On Approval</p>
              <p className="text-xs text-text-secondary">
                "Your book is now live!"
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={approvalNotif}
                onChange={() => setApprovalNotif((p) => !p)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-border rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">
                On Rejection
              </p>
              <p className="text-xs text-text-secondary">
                "Your submission was not approved."
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rejectionNotif}
                onChange={() => setRejectionNotif((p) => !p)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-border rounded-full peer peer-checked:bg-red-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="lg:col-span-2 flex justify-end">
        <button onClick={handleSave} className="btn-primary px-8">
          {saved ? (
            <>
              <CheckCheck size={16} /> Saved!
            </>
          ) : (
            <>
              <Settings size={16} /> Save Automation Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "automated", label: "Automated Logs", icon: <Bot size={15} /> },
  { id: "campaign", label: "Campaigns", icon: <Megaphone size={15} /> },
  { id: "settings", label: "Automation Settings", icon: <Sliders size={15} /> },
];

const Notifications = () => {
  const dispatch = useDispatch();
  const {
    items: reduxItems,
    unreadCount,
    loading,
    sending,
    sendError,
  } = useSelector((s) => s.notifications);

  const [activeTab, setActiveTab] = useState("automated");
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [toast, setToast] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Reset page when tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterStatus]);

  // Sync Redux items into local logs when API responds
  useEffect(() => {
    if (reduxItems && reduxItems.length > 0) {
      setLogs(
        reduxItems.map((n) => ({
          id: n.id,
          type: n.type || "General",
          message: n.body || n.message || n.title || "",
          target: n.targeting || n.target || "All Users",
          trigger: n.sendInstant
            ? "Instant"
            : n.scheduledAt
              ? `Scheduled: ${n.scheduledAt}`
              : "Instant",
          status: n.status || "Sent",
          created_at: n.created_at || n.createdAt || new Date().toISOString(),
          tab: n.tab || (n.is_automated ? "automated" : "campaign"),
        })),
      );
    }
  }, [reduxItems]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveNotification = async (form) => {
    // Helper to convert frontend types to backend enum types observed in Postman/Errors
    const typeMapping = {
      "New Release": "NEW_RELEASE",
      Sale: "SALE",
      Subscription: "RENEWAL",
      "Price Drop": "PRICE_DROP",
      Approval: "APPROVAL",
      General: "NEW_RELEASE",
    };

    // Build payload matching backend requirements
    const metadata = {};
    if (form.categoryName) metadata.category = form.categoryName;
    if (form.bookId) metadata.book_id = form.bookId;

    const payload = {
      title: form.title,
      message: form.body, // Backend expects "message"
      type: typeMapping[form.type] || "NEW_RELEASE",
      target: form.targeting.toUpperCase(), // "ALL", "CATEGORY", etc.
      ...(form.targeting === "category" &&
        form.category && { category_id: Number(form.category) }),
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };

    const result = await dispatch(sendNotification(payload));

    if (sendNotification.fulfilled.match(result)) {
      // Refetch from server to get the actual record created in DB
      dispatch(fetchNotifications());

      setShowModal(false);
      setActiveTab("campaign");
      showToast(
        form.sendInstant ? "Notification sent!" : "Notification scheduled!",
      );
    } else {
      showToast(result.payload || "Failed to send notification.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteNotification(id));
    if (deleteNotification.fulfilled.match(result)) {
      setLogs((p) => p.filter((l) => l.id !== id));
      showToast("Notification removed.");
    } else {
      showToast(result.payload || "Failed to delete notification.", "error");
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchTab = l.tab === activeTab;
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchTab && matchStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const statsSent = logs.filter((l) => l.status === "Sent").length;
  const statsPending = logs.filter((l) => l.status === "Pending").length;
  const statsRecurring = logs.filter((l) => l.status === "Recurring").length;
  const TARGETING_OPTIONS_LOCAL = TARGETING_OPTIONS;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all ${
            toast.type === "error"
              ? "bg-red-500 text-white border-red-400"
              : "bg-emerald-500 text-white border-emerald-400"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight font-['Outfit'] leading-[1.1]">
            Notification <span className="text-primary italic">Center</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm font-bold opacity-70 max-w-lg">
            Manage automated alerts, create campaigns, and configure automation
            rules — all in one place.
          </p>
        </div>
        {activeTab !== "settings" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-7 py-3.5 w-fit text-sm font-black tracking-tight whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Create Notification
          </button>
        )}
      </header>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatPill
          label="Total Sent"
          value={statsSent}
          icon={<Send size={16} />}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatPill
          label="Pending"
          value={statsPending}
          icon={<Timer size={16} />}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatPill
          label="Recurring"
          value={statsRecurring}
          icon={<RefreshCw size={16} />}
          color="bg-primary/10 text-primary"
        />
        <StatPill
          label="Unread (Users)"
          value={unreadCount}
          icon={<BellRing size={16} />}
          color="bg-pink-500/10 text-pink-500"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-black transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-background"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "automated" && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {logs.filter((l) => l.tab === "automated").length}
              </span>
            )}
            {tab.id === "campaign" && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {logs.filter((l) => l.tab === "campaign").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "settings" ? (
        <AutomationSettings />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Table toolbar */}
          <div className="card-premium flex items-center justify-between px-6 py-4 gap-4 flex-wrap !rounded-2xl">
            <div>
              <h3 className="font-black text-text-primary">
                {activeTab === "automated"
                  ? "System Activity Log"
                  : "Campaign History"}
              </h3>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">
                {filteredLogs.length} record
                {filteredLogs.length !== 1 ? "s" : ""}
                {filterStatus !== "All" ? ` · Filter: ${filterStatus}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-secondary" />
              <div className="flex gap-1.5">
                {["All", "Sent", "Pending", "Recurring", "Draft"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      filterStatus === s
                        ? "bg-primary text-white"
                        : "bg-background text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table via custom Table component */}
          <Table
            loading={false}
            emptyMessage="No notifications found — try a different filter or create one."
            data={paginatedLogs}
            columns={[
              {
                header: "Event Type",
                width: "14%",
                render: (row) => <TypeBadge type={row.type} />,
              },
              {
                header: "Message",
                width: "28%",
                render: (row) => (
                  <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug max-w-[220px]">
                    {row.message}
                  </p>
                ),
              },
              {
                header: "Target Segment",
                width: "18%",
                render: (row) => (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                    <Users size={12} /> {row.target}
                  </span>
                ),
              },
              {
                header: "Trigger",
                width: "15%",
                render: (row) => (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Clock size={12} /> {row.trigger}
                  </span>
                ),
              },
              {
                header: "Status",
                width: "12%",
                render: (row) => <Badge status={row.status} />,
              },
              {
                header: "Sent",
                width: "9%",
                render: (row) => (
                  <span className="text-xs text-text-secondary/60 font-semibold">
                    {timeAgo(row.created_at)}
                  </span>
                ),
              },
              {
                header: "Action",
                width: "6%",
                align: "center",
                render: (row) => (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all transform hover:-translate-y-1 shadow-sm border border-rose-100 dark:border-rose-500/20 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                ),
              },
            ]}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CreateNotificationModal
          onClose={() => !sending && setShowModal(false)}
          onSave={handleSaveNotification}
          isSending={sending}
          typeStyles={TYPE_STYLES}
          TypeBadge={TypeBadge}
        />
      )}
    </div>
  );
};

export default Notifications;
