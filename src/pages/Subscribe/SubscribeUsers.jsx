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

const SubscribeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { subscriptions, loading } = useSelector(
    (state) => state.subscriptions,
  );

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
                if (window.confirm("Force activate this subscription?")) {
                  dispatch(
                    forceUpdateStatus({ id: row.id, status: "active" }),
                  ).then((res) => {
                    if (forceUpdateStatus.fulfilled.match(res)) {
                      toast.success("Subscription activated");
                    } else {
                      toast.error("Failed to activate");
                    }
                  });
                }
              }}
              className="p-2 rounded-lg bg-success-surface text-success hover:bg-emerald-500 hover:text-white transition-all border-none cursor-pointer"
              title="Force Activate"
            >
              <UserCheck size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm("Force inactivate this subscription?")) {
                  dispatch(
                    forceUpdateStatus({ id: row.id, status: "inactive" }),
                  ).then((res) => {
                    if (forceUpdateStatus.fulfilled.match(res)) {
                      toast.success("Subscription inactivated");
                    } else {
                      toast.error("Failed to inactivate");
                    }
                  });
                }
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
    </div>
  );
};

export default SubscribeUsers;
