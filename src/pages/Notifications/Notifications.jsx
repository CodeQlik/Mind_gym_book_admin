import React, { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  deleteNotification,
  sendNotification,
} from "../../store/slices/notificationSlice";
import CreateNotificationModal, {
  TARGETING_OPTIONS,
} from "../../components/Modal/CreateNotificationModal";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/UI/Button";
import {
  BellRing,
  Plus,
  Trash2,
  BookOpen,
  Send,
  Clock,
  Users,
  RefreshCw,
  Settings,
  X,
  Zap,
  Megaphone,
  Bot,
  Sliders,
  Filter,
  AlertCircle,
  CheckCircle2,
  Timer,
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
  Sent: "bg-success-surface text-success border-success/20",
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Recurring: "bg-primary/10 text-primary border-primary/20",
  Draft: "bg-background text-text-secondary border-border",
  Failed: "bg-error-surface text-error border-error/20",
};

const TYPE_STYLES = {
  "New Release": {
    icon: <BookOpen size={12} />,
    color: "text-primary bg-primary/10",
  },
  Subscription: {
    icon: <RefreshCw size={12} />,
    color: "text-violet-500 bg-violet-500/10",
  },
  Sale: {
    icon: <TrendingUp size={12} />,
    color: "text-amber-500 bg-amber-500/10",
  },
  Approval: {
    icon: <CheckCircle2 size={12} />,
    color: "text-success bg-success-surface",
  },
  "Price Drop": {
    icon: <Zap size={12} />,
    color: "text-pink-500 bg-pink-500/10",
  },
  General: {
    icon: <Megaphone size={12} />,
    color: "text-cyan-500 bg-cyan-500/10",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ label, value, icon, color }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface shadow-sm`}
  >
    <div
      className={`w-9 h-9 rounded-md flex items-center justify-center ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-text-primary leading-tight">
        {value}
      </p>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
        {label}
      </p>
    </div>
  </div>
);

const Badge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[status] || STATUS_STYLES.Draft}`}
  >
    {status}
  </span>
);

const TypeBadge = ({ type }) => {
  const cfg = TYPE_STYLES[type] || TYPE_STYLES.General;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border border-transparent ${cfg.color}`}
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
      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <RefreshCw size={18} className="text-violet-500" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">
              Subscription Reminders
            </h3>
            <p className="text-xs text-text-secondary">
              Auto-send renewal alerts
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Send Reminder Before Expiry
          </label>
          <div className="flex gap-2">
            {["1", "3", "7", "14"].map((d) => (
              <button
                key={d}
                onClick={() => setSubReminder(d)}
                className={`flex-1 py-1.5 rounded-md border text-xs font-bold transition-all ${
                  subReminder === d
                    ? "bg-violet-500 text-white border-violet-500 shadow-sm"
                    : "bg-background border-border text-text-secondary hover:border-violet-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Expiry Day Alert
            </p>
            <p className="text-[10px] text-text-secondary">
              Final push on the day
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Zap size={18} className="text-pink-500" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">
              Price Drop Alerts
            </h3>
            <p className="text-xs text-text-secondary">
              Notify wishlisted users
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            Threshold (≥ {priceDropPct}%)
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={priceDropPct}
            onChange={(e) => setPriceDropPct(e.target.value)}
            className="w-full accent-pink-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
          <div>
            <p className="text-sm font-bold text-text-primary">Promo Codes</p>
            <p className="text-[10px] text-text-secondary">
              Attach discount code
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-pink-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-success-surface flex items-center justify-center">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">
              Approval Notifications
            </h3>
            <p className="text-xs text-text-secondary">
              Seller activity alerts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
            <span className="text-sm font-bold text-text-primary">
              On Approval
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={approvalNotif}
                onChange={() => setApprovalNotif((p) => !p)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
            <span className="text-sm font-bold text-text-primary">
              On Rejection
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rejectionNotif}
                onChange={() => setRejectionNotif((p) => !p)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-red-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={handleSave}>
          {saved ? "Saved Successfully" : "Update Settings"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "automated", label: "Logs", icon: <Bot size={14} /> },
  { id: "campaign", label: "Campaigns", icon: <Megaphone size={14} /> },
  { id: "settings", label: "Settings", icon: <Sliders size={14} /> },
];

const Notifications = () => {
  const dispatch = useDispatch();
  const {
    items: reduxItems,
    unreadCount,
    loading,
    sending,
  } = useSelector((s) => s.notifications);

  const [activeTab, setActiveTab] = useState("automated");
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterStatus]);

  useEffect(() => {
    if (reduxItems && reduxItems.length > 0) {
      setLogs(
        reduxItems.map((n) => ({
          id: n.id,
          type: n.type || "General",
          message: n.body || n.message || n.title || "",
          target: n.targeting || n.target || "All Users",
          trigger: n.sendInstant ? "Instant" : "Scheduled",
          status: n.status || "Sent",
          created_at: n.created_at || n.createdAt || new Date().toISOString(),
          tab: n.tab || (n.is_automated ? "automated" : "campaign"),
        })),
      );
    }
  }, [reduxItems]);

  const handleSaveNotification = async (form) => {
    const typeMapping = {
      "New Release": "NEW_RELEASE",
      Sale: "SALE",
      Subscription: "RENEWAL",
      "Price Drop": "PRICE_DROP",
      Approval: "APPROVAL",
      General: "NEW_RELEASE",
    };

    const metadata = {};
    if (form.categoryName) metadata.category = form.categoryName;
    if (form.bookId) metadata.book_id = form.bookId;

    const payload = {
      title: form.title,
      message: form.body,
      type: typeMapping[form.type] || "NEW_RELEASE",
      target: form.targeting.toUpperCase(),
      ...(form.targeting === "category" &&
        form.category && { category_id: Number(form.category) }),
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };

    const result = await dispatch(sendNotification(payload));

    if (sendNotification.fulfilled.match(result)) {
      dispatch(fetchNotifications());
      setShowModal(false);
      setActiveTab("campaign");
      toast.success("Notification sent successfully");
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteNotification(id));
    if (deleteNotification.fulfilled.match(result)) {
      setLogs((p) => p.filter((l) => l.id !== id));
      toast.success("Notification deleted");
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

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Notification Center
          </h1>
          <p className="text-text-secondary text-sm">
            Configure automated alerts and manage campaigns.
          </p>
        </div>
        {activeTab !== "settings" && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-2" />
            Create New
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill
          label="Sent"
          value={statsSent}
          icon={<Send size={16} />}
          color="bg-success-surface text-success"
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
          label="Unread"
          value={unreadCount}
          icon={<BellRing size={16} />}
          color="bg-pink-500/10 text-pink-500"
        />
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "settings" ? (
        <AutomationSettings />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-surface border border-border p-3 rounded-lg gap-4 flex-wrap">
            <h3 className="text-sm font-bold text-text-primary">
              {activeTab === "automated" ? "System Logs" : "Campaign History"}
            </h3>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-secondary" />
              <div className="flex gap-1">
                {["All", "Sent", "Pending", "Recurring"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
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

          <Table
            loading={loading}
            emptyMessage="No notifications found."
            data={paginatedLogs}
            columns={[
              {
                header: "Type",
                width: "120px",
                render: (row) => <TypeBadge type={row.type} />,
              },
              {
                header: "Message",
                render: (row) => (
                  <p className="text-sm font-bold text-text-primary truncate max-w-[300px]">
                    {row.message}
                  </p>
                ),
              },
              {
                header: "Target",
                render: (row) => (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <Users size={12} /> {row.target}
                  </span>
                ),
              },
              {
                header: "Trigger",
                render: (row) => (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <Clock size={12} /> {row.trigger}
                  </span>
                ),
              },
              {
                header: "Status",
                render: (row) => <Badge status={row.status} />,
              },
              {
                header: "Time",
                width: "100px",
                render: (row) => (
                  <span className="text-xs text-text-secondary">
                    {timeAgo(row.created_at)}
                  </span>
                ),
              },
              {
                header: "Action",
                width: "80px",
                align: "right",
                render: (row) => (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                ),
              },
            ]}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {showModal && (
        <CreateNotificationModal
          onClose={() => setShowModal(false)}
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
