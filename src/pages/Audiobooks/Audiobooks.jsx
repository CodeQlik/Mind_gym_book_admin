import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, Headphones, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";
import {
  fetchAudiobooks,
  deleteAudiobook,
  toggleBookAudiobooksStatus,
  clearAudiobookError,
} from "../../store/slices/audiobookSlice";
import { toast } from "react-hot-toast";

const Audiobooks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { audiobooks, loading, error, totalPages, totalItems, currentPage } = useSelector(
    (state) => state.audiobooks
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [audiobookToDelete, setAudiobookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchAudiobooks({ page, limit }));
  }, [dispatch, page]);

  const handleDeleteClick = (id) => {
    setAudiobookToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!audiobookToDelete) return;
    setIsDeleting(true);
    try {
      const resultAction = await dispatch(deleteAudiobook(audiobookToDelete));
      if (deleteAudiobook.fulfilled.match(resultAction)) {
        toast.success("Audiobook deleted successfully");
        setIsDeleteModalOpen(false);
      } else {
        toast.error(resultAction.payload || "Failed to delete");
      }
    } catch (err) {
      toast.error("Internal Server Error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBookStatusToggle = async (bookId) => {
    try {
      const resultAction = await dispatch(toggleBookAudiobooksStatus(bookId));
      if (toggleBookAudiobooksStatus.fulfilled.match(resultAction)) {
        toast.success("Book audiobooks status updated");
      } else {
        toast.error(resultAction.payload || "Failed to update status");
      }
    } catch (err) {
      toast.error("Internal Server Error");
    }
  };

  const columns = [
    {
      header: "Book",
      width: "350px",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center shrink-0">
              <img 
                src={row.thumbnail?.url || row.cover_image?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.title || "A")}&background=6366f1&color=fff&bold=true&format=svg`} 
               alt="" 
               className="w-full h-full object-cover" 
             />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-[16px] line-clamp-1">
              {row.title || "Unknown Book"}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                 {row.chapters?.length || 0} {row.chapters?.length === 1 ? "Chapter" : "Chapters"}
               </span>
               <span className="text-[11px] text-text-secondary font-medium italic">
                 Narrated by {row.chapters?.[0]?.narrator || "N/A"}
               </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Last Update",
      render: (row) => (
        <span className="text-sm text-text-secondary font-medium">
          {row.chapters?.[0]?.updatedAt ? new Date(row.chapters[0].updatedAt).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      header: "Language",
      render: (row) => (
        <span className="text-sm text-text-secondary font-medium uppercase tracking-wider">
          {row.chapters?.[0]?.language || "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const chapters = row.chapters || [];
        if (chapters.length === 0) return <span className="text-text-secondary text-xs italic">No Chapters</span>;
        
        const activeChapters = chapters.filter(c => c.status).length;
        const isActive = activeChapters > 0;

        return (
          <button
            onClick={() => handleBookStatusToggle(row.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 ${
              isActive
                ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                : "bg-error/10 text-error border-error/20 hover:bg-error/20"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
            {chapters.length > 1 && ` (${activeChapters}/${chapters.length})`}
          </button>
        );
      },
    },
    {
      header: "Actions",
      width: "150px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-border"
            title="View Chapters"
            onClick={() => navigate(`/audiobooks/book/${row.id}`)}
          >
            <Eye size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
            title="Delete Entire Audiobook"
            onClick={() => handleDeleteClick(row.chapters?.[0]?.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 font-['Inter']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Headphones size={24} className="text-primary" />
            Audiobooks Management
          </h1>
          <p className="text-text-secondary text-sm">
            Manage your audio content for various books.
          </p>
        </div>
        <Button onClick={() => navigate("/audiobooks/add")}>
          <Plus size={16} className="mr-2" />
          Add Audiobook
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search books..."
          onReset={() => setSearchQuery("")}
        />
      </div>

      {error && (
        <div className="p-4 bg-error-surface text-error rounded-lg border border-error/20 text-sm font-semibold">
          {error}
        </div>
      )}

      <div>
        <Table
          columns={columns}
          data={audiobooks}
          loading={loading}
          emptyMessage="No audiobooks found."
        />
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        itemsPerPage={limit}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Audiobook"
        message="Are you sure you want to delete this audiobook? This action cannot be undone."
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Audiobooks;
