import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";

const SubscribeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const subscribedUsers = [
    {
      id: 1,
      name: "Harish Kumar",
      plan: "Pro Premium",
      status: "Active",
      date: "2026-02-01",
      amount: "₹999",
    },
    {
      id: 2,
      name: "Anita Sharma",
      plan: "Starter",
      status: "Active",
      date: "2026-01-15",
      amount: "₹499",
    },
    {
      id: 3,
      name: "Rahul Singh",
      plan: "Enterprise",
      status: "Expired",
      date: "2025-12-20",
      amount: "₹4999",
    },
    {
      id: 4,
      name: "Priya Verma",
      plan: "Pro Premium",
      status: "Active",
      date: "2026-02-10",
      amount: "₹999",
    },
  ];

  const filteredUsers = subscribedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.plan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Member Details",
      render: (row) => (
        <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-500">
          <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shadow-sm">
            {row.name.charAt(0)}
          </div>
          <span className="font-bold text-text-primary">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Plan Type",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" strokeWidth={2.5} />
          <span
            className={`font-black uppercase text-[11px] tracking-widest ${
              row.plan === "Pro Premium"
                ? "text-primary"
                : row.plan === "Enterprise"
                  ? "text-emerald-500"
                  : "text-text-primary"
            }`}
          >
            {row.plan}
          </span>
        </div>
      ),
    },
    {
      header: "Billing Cycles",
      render: (row) => (
        <span className="text-[13px] text-text-secondary font-bold">
          {new Date(row.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Subscription Cost",
      render: (row) => (
        <span className="font-black text-text-primary text-[15px]">
          {row.amount}
        </span>
      ),
    },
    {
      header: "Account State",
      render: (row) => (
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] min-w-[100px] text-center transition-all duration-300 shadow-sm border ${
            row.status === "Active"
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
    <div className="flex flex-col gap-4 animate-fade-in font-['Outfit']">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight leading-tight">
            Subscribed <span className="text-primary italic">Members</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Monitor and manage members with active subscription plans.
          </p>
        </div>
      </div>

      <div className="text-left">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or plan..."
          onReset={() => setSearchQuery("")}
        />
      </div>

      <div>
        <Table
          columns={columns}
          data={filteredUsers}
          loading={false}
          emptyMessage="No subscribed users found."
        />
      </div>
    </div>
  );
};

export default SubscribeUsers;
