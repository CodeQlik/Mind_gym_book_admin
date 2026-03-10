import React, { useState } from "react";
import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  fetchSubscriptions,
  forceUpdateStatus,
} from "../../store/slices/subscriptionSlice";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const SubscribeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { subscriptions, loading } = useSelector(
    (state) => state.subscriptions,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    id: null,
    status: "",
    title: "",
    message: "",
    variant: "primary",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const filteredUsers = (subscriptions || []).filter(
    (sub) =>
      (sub?.user?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (sub?.plan_type || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (sub?.status || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Member Details",
      render: (row) => (
        <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-500">
          <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shadow-sm dark:shadow-none">
            {(row.user?.name || "U").charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-[17px]">
              {row.user?.name || `User ID: ${row.user_id}`}
            </span>
            <span className="text-[13px] text-text-secondary opacity-60">
              {row.payment_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Plan / Type",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" strokeWidth={2.5} />
          <span
            className={`font-black uppercase text-[14px] tracking-widest text-text-primary`}
          >
            {row.plan?.name || row.plan_type || `Plan ID: ${row.plan_id}`}
          </span>
        </div>
      ),
    },
    {
      header: "Payment Date",
      render: (row) => (
        <span className="text-base text-text-secondary font-bold">
          {row.createdAt || row.created_at
            ? new Date(row.createdAt || row.created_at).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )
            : "N/A"}
        </span>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-black text-text-primary text-[17px]">
          ₹{row.amount}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[12px] font-black uppercase tracking-widest ${row.status === "active" ? "text-success" : "text-error"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== "active" ? (
            <button
              onClick={() => {
                setModalConfig({
                  id: row.id,
                  status: "active",
                  title: "Activate Subscription",
                  message: `Are you sure you want to force activate the subscription for ${row.user?.name || row.user_id}?`,
                  variant: "primary",
                });
                setModalOpen(true);
              }}
              className="p-2 rounded-lg bg-success-surface text-success hover:bg-emerald-500 hover:text-white transition-all border-none cursor-pointer"
              title="Force Activate"
            >
              <UserCheck size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                setModalConfig({
                  id: row.id,
                  status: "expired",
                  title: "Deactivate Subscription",
                  message: `Are you sure you want to force deactivate the subscription for ${row.user?.name || row.user_id}?`,
                  variant: "danger",
                });
                setModalOpen(true);
              }}
              className="p-2 rounded-lg bg-error-surface text-error hover:bg-rose-500 hover:text-white transition-all border-none cursor-pointer"
              title="Force Inactivate"
            >
              <UserX size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      const result = await dispatch(
        forceUpdateStatus({ id: modalConfig.id, status: modalConfig.status }),
      );
      if (forceUpdateStatus.fulfilled.match(result)) {
        toast.success(
          `Subscription ${modalConfig.status === "active" ? "activated" : "deactivated"}`,
        );
      } else {
        toast.error(
          `Failed to ${modalConfig.status === "active" ? "activate" : "deactivate"}`,
        );
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Subscribed Members
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Monitor and manage members with active subscription plans.
          </p>
        </div>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, plan or status..."
        onReset={() => setSearchQuery("")}
      />

      <div>
        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="No subscribed users found."
        />
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        isProcessing={isProcessing}
        confirmText={
          modalConfig.status === "active" ? "Activate Now" : "Deactivate Now"
        }
      />
    </div>
  );
};

export default SubscribeUsers;
