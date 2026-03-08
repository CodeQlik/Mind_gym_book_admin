import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../store/slices/couponSlice";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Tag,
  Eye,
} from "lucide-react";
import Table from "../../components/Table/Table";
import Button from "../../components/UI/Button";
import SearchInput from "../../components/Search/SearchInput";
import CouponModal from "../../components/Modal/CouponModal";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import { toast } from "react-hot-toast";

const Coupons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading, submitLoading } = useSelector(
    (state) => state.coupons,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleSave = async (formData) => {
    try {
      if (selectedCoupon) {
        await dispatch(
          updateCoupon({ id: selectedCoupon.id, data: formData }),
        ).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await dispatch(createCoupon(formData)).unwrap();
        toast.success("Coupon created successfully");
      }
      setIsModalOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Something went wrong");
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteModal.id) {
        await dispatch(deleteCoupon(deleteModal.id)).unwrap();
        toast.success("Coupon deleted successfully");
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to delete");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = [
    {
      label: "Active",
      value: items.filter((i) => i.is_active).length,
      icon: <CheckCircle className="text-success" />,
    },
    {
      label: "Total Used",
      value: items.reduce((acc, i) => acc + (i.used_count || 0), 0),
      icon: <Zap className="text-amber-500" />,
    },
    {
      label: "Total Coupons",
      value: items.length,
      icon: <Tag className="text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Coupon Management
          </h1>
          <p className="text-text-secondary text-sm">
            Manage discount codes and promotional campaigns.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCoupon(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" />
          Create New Coupon
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-0.5">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by code or description..."
            maxWidth="400px"
            onReset={() => setSearchQuery("")}
          />
          <button className="hidden md:flex items-center gap-2 px-4 h-[38px] border border-border rounded-lg text-sm font-bold text-text-secondary hover:bg-background transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        <Table
          loading={loading}
          data={filteredItems}
          columns={[
            {
              header: "Coupon Code",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center text-primary bg-primary/5 font-black text-xs">
                    {row.code.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-black text-sm text-text-primary group-hover:text-primary transition-colors">
                      {row.code}
                    </p>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider opacity-60">
                      {row.discount_type === "percentage"
                        ? `${row.discount_value}% OFF`
                        : `₹${row.discount_value} OFF`}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              header: "Min Order",
              render: (row) => (
                <span className="text-sm font-bold text-text-primary">
                  ₹{row.min_order_amount}
                </span>
              ),
            },
            {
              header: "Usage",
              render: (row) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    <span>
                      {row.used_count} / {row.usage_limit || "∞"}
                    </span>
                  </div>
                  <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: row.usage_limit
                          ? `${(row.used_count / row.usage_limit) * 100}%`
                          : "10%",
                      }}
                    />
                  </div>
                </div>
              ),
            },
            {
              header: "Validity",
              render: (row) => (
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">
                    {new Date(row.end_date).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60 flex items-center gap-1">
                    <Clock size={10} />{" "}
                    {Math.ceil(
                      (new Date(row.end_date) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    Days Left
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              render: (row) => (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${row.is_active ? "bg-success/10 text-success border-success/20" : "bg-text-secondary/10 text-text-secondary border-text-secondary/20"}`}
                >
                  {row.is_active ? (
                    <CheckCircle size={10} />
                  ) : (
                    <XCircle size={10} />
                  )}
                  {row.is_active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Actions",
              align: "right",
              render: (row) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/coupons/view/${row.id}`)}
                    className="p-2 border border-border rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCoupon(row);
                      setIsModalOpen(true);
                    }}
                    className="p-2 border border-border rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
                    className="p-2 border border-border rounded-lg text-text-secondary hover:text-error hover:bg-error/5 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        coupon={selectedCoupon}
        isSaving={submitLoading}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon code? This action cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
        isProcessing={submitLoading}
      />
    </div>
  );
};

export default Coupons;
