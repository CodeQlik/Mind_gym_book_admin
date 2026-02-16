import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";
import {
  fetchBooks,
  toggleBookStatus,
  deleteBookThunk,
  clearBookError,
  searchBooksThunk,
} from "../../store/slices/bookSlice";

const Books = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { books, loading, error, totalPages, totalItems } = useSelector(
    (state) => state.books,
  );

  const [togglingId, setTogglingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    await dispatch(toggleBookStatus(id));
    setTogglingId(null);
  };

  const handleDeleteClick = (id) => {
    setBookToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    await dispatch(deleteBookThunk(bookToDelete));
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cleanup error on unmount
  useEffect(() => {
    return () => dispatch(clearBookError());
  }, [dispatch]);

  // Handle Fetching (Search and Pagination) logic
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        dispatch(
          searchBooksThunk({
            query: searchQuery,
            status: statusFilter,
            page: currentPage,
            limit: itemsPerPage,
          }),
        );
      }, 500);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        fetchBooks({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter,
        }),
      );
    }
  }, [dispatch, searchQuery, currentPage, statusFilter]);

  // Reset to page 1 when filter change (searchQuery or statusFilter)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const currentData = books;

  const columns = [
    {
      header: "Profile",
      width: "100px",
      render: (row) => {
        if (!row) return null;
        let imageUrl = null;

        const parseImage = (imgData) => {
          if (!imgData) return null;
          let url = null;
          if (typeof imgData === "string") {
            try {
              if (imgData.startsWith("{")) {
                url = JSON.parse(imgData).url;
              } else {
                url = imgData;
              }
            } catch (e) {
              url = imgData;
            }
          } else {
            url = imgData.url;
          }

          if (url && !url.startsWith("http")) {
            return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
          }
          return url;
        };

        imageUrl =
          parseImage(row.thumbnail) ||
          parseImage(row.image) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(row.title || "B")}&background=6366f1&color=fff&bold=true&format=svg&rounded=false&length=2`;

        return (
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-border/50 bg-background flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
            <img
              src={imageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        );
      },
    },
    {
      header: "Book",
      width: "300px",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {row.title}
          </span>
          <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider opacity-60">
            {row.isbn || "ISBN N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Author",
      render: (row) => (
        <span className="text-[13px] text-text-secondary font-bold italic">
          {row.author || "Unknown Author"}
        </span>
      ),
    },
    {
      header: "Category",
      render: (row) => (
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          {row.category?.name || row.category || "General"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-black text-text-primary text-[15px]">
          ₹{row.price || "0"}
        </span>
      ),
    },
    {
      header: "Published",
      render: (row) => (
        <span className="text-[13px] text-text-secondary font-bold">
          {row.published_date
            ? new Date(row.published_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "180px",
      render: (row) => {
        const isActive = row.is_active !== false;
        const currentId = row.id || row._id;
        const isProcessing = togglingId === currentId;

        return (
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] min-w-[100px] text-center transition-all duration-300 shadow-sm border ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </div>

            <button
              onClick={() => handleToggleStatus(currentId)}
              disabled={isProcessing}
              className={`w-11 h-6 rounded-full relative transition-all duration-500 border-none cursor-pointer p-0 shadow-inner overflow-hidden ${
                isActive ? "bg-[#6366f1]" : "bg-slate-200 dark:bg-slate-800"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all duration-500 shadow-md ${
                  isActive ? "left-[22px]" : "left-[3px]"
                }`}
              />
            </button>
          </div>
        );
      },
    },
    {
      header: "ACTIONS",
      width: "160px",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-sm border border-indigo-100 dark:border-indigo-500/20 cursor-pointer"
            title="View Details"
            onClick={() =>
              navigate(`/books/view/${row.slug || row.id || row._id}`)
            }
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all transform hover:-translate-y-1 shadow-sm border border-emerald-100 dark:border-emerald-500/20 cursor-pointer"
            title="Edit Book"
            onClick={() =>
              navigate(`/books/edit/${row.slug || row.id || row._id}`)
            }
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all transform hover:-translate-y-1 shadow-sm border border-rose-100 dark:border-rose-500/20 cursor-pointer"
            title="Delete Book"
            onClick={() => handleDeleteClick(row.id || row._id)}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in font-['Outfit']">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight leading-tight">
            Book <span className="text-primary italic">Library</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Explore and manage your collection of digital wisdom.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/books/add")}>
          Add New Book
        </Button>
      </div>

      <div>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, author, or ISBN..."
            className="w-full md:w-auto flex-1"
            onReset={() => {
              setSearchQuery("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
          />

          <div className="relative min-w-[160px] w-full md:w-auto">
            <select
              className="w-full bg-surface border border-border rounded-xl py-2 px-5 outline-hidden focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-text-primary uppercase tracking-wide appearance-none cursor-pointer shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              size={16}
              strokeWidth={3}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 font-black text-sm tracking-wide animate-pulse">
          SYSTEM ALERT: {error}
        </div>
      )}

      <div>
        <Table
          columns={columns}
          data={currentData}
          loading={loading}
          emptyMessage="No books found in the library."
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Books;
