import React, { useState, useEffect } from "react";
import {
  Store,
  UserCheck,
  Package,
  ShieldCheck,
  CheckCircle2,
  XCircle,
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
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <UserCheck size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm">
              {row.user?.name || "Pending User"}
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-medium">
              {row.user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Store Name",
      render: (row) => (
        <span className="text-sm font-bold text-text-primary">
          {row.store_name || "N/A"}
        </span>
      ),
    },
    {
      header: "Applied On",
      render: (row) => (
        <span className="text-xs text-text-secondary font-medium">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Action",
      width: "200px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleApproveSeller(row.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success border border-success text-white text-[10px] font-bold uppercase tracking-wider hover:opacity-90"
          >
            <CheckCircle2 size={12} />
            Approve
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-transparent border border-error text-error text-[10px] font-bold uppercase tracking-wider hover:bg-error hover:text-white">
            <XCircle size={12} />
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
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Package size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-sm">
              Used Psychology Book
            </span>
            <span className="text-[10px] text-text-secondary opacity-60 font-medium uppercase tracking-wider">
              Seller: John Doe
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Condition",
      render: (row) => (
        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
          Like New
        </div>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-bold text-text-primary text-sm">₹499</span>
      ),
    },
    {
      header: "Action",
      width: "140px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success-surface text-text-secondary hover:text-success border border-border">
            <CheckCircle2 size={14} />
          </button>
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error border border-border">
            <XCircle size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Marketplace Moderation
          </h1>
          <p className="text-text-secondary text-sm">
            Review seller applications and used book listings.
          </p>
        </div>

        <div className="flex items-center bg-surface border border-border p-1 rounded-lg h-fit">
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === "sellers"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Sellers
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === "listings"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Listings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
              Pending Sellers
            </span>
            <h3 className="text-xl font-bold text-text-primary">
              {pendingSellers.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Store size={20} />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
              Active Listings
            </span>
            <h3 className="text-xl font-bold text-text-primary">124</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
              Escrow Locked
            </span>
            <h3 className="text-xl font-bold text-text-primary">₹12,450</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success-surface text-success flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          onReset={() => setSearchQuery("")}
        />

        <Table
          columns={activeTab === "sellers" ? sellerColumns : listingColumns}
          data={activeTab === "sellers" ? pendingSellers : [{}]}
          loading={loading}
          emptyMessage={`No ${activeTab} found.`}
        />
      </div>
    </div>
  );
};

export default Marketplace;
