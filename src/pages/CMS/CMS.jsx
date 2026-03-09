import React, { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  FileText,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cmsApi from "../../api/cmsApi";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import toast from "react-hot-toast";

const CMS = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getAllPages();
      if (data.success) {
        setPages(data.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDeletePage = (id) => {
    setPageToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pageToDelete) return;
    setIsDeleting(true);
    try {
      const data = await cmsApi.deletePage(pageToDelete);
      if (data.success) {
        toast.success("Page deleted successfully");
        setPages(pages.filter((p) => p.id !== pageToDelete));
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPageToDelete(null);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const currentData = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "Page Title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center p-2 border border-primary/10">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-[16px] leading-tight">
              {row.title}
            </span>
            <span className="text-[13px] text-text-secondary flex items-center gap-1 opacity-70 italic font-mono lowercase">
              <Globe size={11} />/{row.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Last Updated",
      width: "180px",
      render: (row) => (
        <div className="flex items-center gap-2 text-text-secondary text-[14px] font-semibold">
          <Clock size={14} className="opacity-40" />
          <span>
            {new Date(row.updatedAt || row.updated_at).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      width: "150px",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.is_active ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[12px] font-bold uppercase tracking-wider border border-success/20 shadow-sm">
              <CheckCircle2 size={12} />
              Published
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-[12px] font-bold uppercase tracking-wider border border-error/20 shadow-sm">
              <XCircle size={12} />
              Draft
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      width: "150px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-success/10 text-text-secondary hover:text-success transition-all border border-border group"
            title="Edit Content"
            onClick={() => navigate(`/cms/edit/${row.slug}`)}
          >
            <Pencil
              size={15}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-error/10 text-text-secondary hover:text-error transition-all border border-border group"
            title="Delete Page"
            onClick={() => handleDeletePage(row.id)}
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              CMS Management
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80">
              Update legal pages, company info, and helpful FAQ content.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter pages by title or slug..."
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
            emptyMessage="No CMS pages found. Please ensure they are seeded in the backend."
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredPages.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete CMS Page"
        message={`Are you sure you want to permanently delete this page? This action cannot be undone.`}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default CMS;
