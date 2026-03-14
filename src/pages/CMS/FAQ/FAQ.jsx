import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import faqApi from "../../../api/faqApi";
import Table from "../../../components/Table/Table";
import Pagination from "../../../components/Pagination/Pagination";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";
import SearchInput from "../../../components/Search/SearchInput";
import toast from "react-hot-toast";

const FAQ = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqApi.getAllFaqs();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDeleteFaq = (id) => {
    setFaqToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    try {
      const data = await faqApi.deleteFaq(faqToDelete);
      if (data.success) {
        toast.success("FAQ deleted successfully");
        setFaqs(faqs.filter((f) => f.id !== faqToDelete));
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setFaqToDelete(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const data = await faqApi.toggleFaqStatus(id);
      if (data.success) {
        toast.success(`FAQ marked as ${!currentStatus ? "Active" : "Inactive"}`);
        setFaqs(faqs.map((f) => (f.id === id ? { ...f, is_active: !currentStatus } : f)));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const currentData = filteredFaqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "Question & Answer",
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-[500px]">
          <span className="font-bold text-text-primary text-[15px] leading-snug">
            {row.question}
          </span>
          <span className="text-[13px] text-text-secondary line-clamp-2">
            {row.answer}
          </span>
        </div>
      ),
    },
    {
      header: "Order",
      width: "100px",
      render: (row) => (
        <div className="text-[14px] font-semibold text-text-primary">
          {row.order}
        </div>
      ),
    },
    {
      header: "Status",
      width: "150px",
      render: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row.id, row.is_active);
          }}
          className="flex items-center gap-2 group cursor-pointer"
          title={`Click to mark as ${row.is_active ? "Inactive" : "Active"}`}
        >
          {row.is_active ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[12px] font-bold uppercase tracking-wider border border-success/20 shadow-sm group-hover:bg-success/20 transition-all">
              <CheckCircle2 size={12} />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-[12px] font-bold uppercase tracking-wider border border-error/20 shadow-sm group-hover:bg-error/20 transition-all">
              <XCircle size={12} />
              Inactive
            </span>
          )}
        </button>
      ),
    },
    {
      header: "Actions",
      width: "120px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-success/10 text-text-secondary hover:text-success transition-all border border-border group"
            title="Edit FAQ"
            onClick={() => navigate(`/cms/faqs/edit/${row.id}`)}
          >
            <Pencil
              size={15}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-error/10 text-text-secondary hover:text-error transition-all border border-border group"
            title="Delete FAQ"
            onClick={() => handleDeleteFaq(row.id)}
          >
            <Trash2
              size={15}
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
            <HelpCircle size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              FAQ Management
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80">
              Manage frequently asked questions for your users.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/cms/faqs/add")}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={20} />
          Add FAQ
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search FAQs..."
          onReset={() => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
        />

        <Table
          columns={columns}
          data={currentData}
          loading={loading}
          emptyMessage="No FAQs found."
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredFaqs.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete FAQ"
        message={`Are you sure you want to permanently delete this FAQ? This action cannot be undone.`}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default FAQ;
