import React, { useState, useEffect } from "react";
import {
  Store,
  UserCheck,
  Package,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Table from "../../components/Table/Table";
import SearchInput from "../../components/Search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingSellers,
  approveSellerThunk,
} from "../../store/slices/marketSlice";
import { toast } from "react-hot-toast";

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("sellers");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { pendingSellers, loading } = useSelector((state) => state.marketplace);

  useEffect(() => {
    dispatch(fetchPendingSellers());
  }, [dispatch]);

  const handleApproveSeller = async (id) => {
    try {
      await dispatch(approveSellerThunk(id)).unwrap();
      toast.success("Seller approved successfully");
    } catch (error) {
      toast.error("Failed to approve seller");
    }
  };

  const sellerColumns = [
    {
      header: "Seller Profile",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <UserCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm tracking-tight">
              {row.user?.name || "Pending User"}
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-black uppercase tracking-widest">
              {row.user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Store Name",
      render: (row) => (
        <span className="text-sm font-bold text-text-primary italic">
          {row.store_name || "N/A"}
        </span>
      ),
    },
    {
      header: "Applied On",
      render: (row) => (
        <span className="text-sm font-bold text-text-secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleApproveSeller(row.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
            <XCircle size={14} />
            Reject
          </button>
        </div>
      ),
    },
  ];

  const listingColumns = [
    {
      header: "Book Listing",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Package size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm tracking-tight">
              Used Psychology Book
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-black uppercase tracking-widest">
              Seller: John Doe
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Condition",
      render: (row) => (
        <div className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest w-fit">
          Like New
        </div>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-black text-text-primary">₹499</span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
            <CheckCircle2 size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
            <XCircle size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit'] text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight leading-tight">
            Marketplace <span className="text-primary italic">Moderation</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Review seller applications and used book listings before they go
            live.
          </p>
        </div>

        <div className="flex items-center bg-surface border border-border p-1.5 rounded-2xl shadow-sm h-fit">
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "sellers"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Seller Requests
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "listings"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Active Listings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-8 rounded-[2.5rem] border border-border flex items-center justify-between group hover:border-primary/20 transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-60">
              Pending Sellers
            </p>
            <h3 className="text-3xl font-black text-text-primary italic">
              {pendingSellers.length}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Store size={28} />
          </div>
        </div>
        <div className="bg-surface p-8 rounded-[2.5rem] border border-border flex items-center justify-between group hover:border-primary/20 transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-60">
              Active Listings
            </p>
            <h3 className="text-3xl font-black text-text-primary italic">
              124
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package size={28} />
          </div>
        </div>
        <div className="bg-surface p-8 rounded-[2.5rem] border border-border flex items-center justify-between group hover:border-primary/20 transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-60">
              Escrow Locked
            </p>
            <h3 className="text-3xl font-black text-text-primary italic">
              ₹12,450
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck size={28} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          onReset={() => setSearchQuery("")}
        />

        <Table
          columns={activeTab === "sellers" ? sellerColumns : listingColumns}
          data={activeTab === "sellers" ? pendingSellers : [{}]} // Mock data for listings
          loading={loading}
          emptyMessage={`No ${activeTab} found.`}
        />
      </div>
    </div>
  );
};

export default Marketplace;
