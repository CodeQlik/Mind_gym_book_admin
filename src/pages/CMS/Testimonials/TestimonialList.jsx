import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Quote,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import testimonialApi from "../../../api/testimonialApi";
import Table from "../../../components/Table/Table";
import Pagination from "../../../components/Pagination/Pagination";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";
import SearchInput from "../../../components/Search/SearchInput";
import toast from "react-hot-toast";

const TestimonialList = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialApi.getAllTestimonials();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDeleteClick = (id) => {
    setTestimonialToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!testimonialToDelete) return;
    setIsDeleting(true);
    try {
      const data = await testimonialApi.deleteTestimonial(testimonialToDelete);
      if (data.success) {
        toast.success("Testimonial deleted successfully");
        setTestimonials(
          testimonials.filter((t) => t.id !== testimonialToDelete),
        );
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setTestimonialToDelete(null);
    }
  };

  const filteredData = testimonials.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-background border border-border overflow-hidden shrink-0">
            {row.image ? (
              <img
                src={row.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10 font-bold uppercase">
                {row.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-text-primary text-[15px] leading-snug truncate">
              {row.name}
            </span>
            <span className="text-[12px] text-text-secondary opacity-70 truncate font-medium">
              {row.designation || "Customer"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Content",
      render: (row) => (
        <p className="text-[14px] text-text-secondary line-clamp-2 max-w-[400px]">
          "{row.content}"
        </p>
      ),
    },
    {
      header: "Rating",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-0.5 text-warning">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < row.rating ? "currentColor" : "none"}
            />
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      width: "140px",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.is_active ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-bold uppercase tracking-wider border border-success/20">
              <CheckCircle2 size={12} />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-[11px] font-bold uppercase tracking-wider border border-error/20">
              <XCircle size={12} />
              Hidden
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      width: "130px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-border group"
            title="Edit Testimonial"
            onClick={() => navigate(`/cms/testimonials/edit/${row.id}`)}
          >
            <Pencil
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-error/10 text-text-secondary hover:text-error transition-all border border-border group"
            title="Delete Testimonial"
            onClick={() => handleDeleteClick(row.id)}
          >
            <Trash2
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Quote size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              Testimonials Management
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80">
              Manage what users are saying about Mind Gym Book.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/cms/testimonials/add")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-dark shadow-md shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or content..."
          onReset={() => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
        />

        <div>
          <Table
            columns={columns}
            data={currentData}
            loading={loading}
            emptyMessage="No testimonials found. Add your first review!"
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to permanently delete this testimonial? It will be removed from your website."
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default TestimonialList;
