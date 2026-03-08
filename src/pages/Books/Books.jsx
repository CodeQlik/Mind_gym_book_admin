import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, ChevronDown, Package } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";
import UpdateInventoryModal from "../../components/Modal/UpdateInventoryModal";
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
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedBookForStock, setSelectedBookForStock] = useState(null);

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
    try {
      await dispatch(deleteBookThunk(bookToDelete));
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  }, [dispatch, searchQuery, currentPage, statusFilter, itemsPerPage]);

  // Reset to page 1 when filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const currentData = books;

  const columns = [
    {
      header: "Cover",
      width: "80px",
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
          return url;
        };

        imageUrl =
          parseImage(row.thumbnail) ||
          parseImage(row.image) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(row.title || "B")}&background=6366f1&color=fff&bold=true&format=svg`;

        return (
          <div className="w-10 h-10 rounded-md overflow-hidden border border-border bg-background flex items-center justify-center shadow-sm">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        );
      },
    },
    {
      header: "Book Details",
      width: "250px",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-[17px] line-clamp-1">
            {row.title}
          </span>
          <span className="text-[13px] text-text-secondary font-bold uppercase tracking-wider opacity-60">
            {row.isbn || "ISBN N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Author",
      render: (row) => (
        <span className="text-base text-text-secondary font-medium">
          {row.author || "Unknown"}
        </span>
      ),
    },
    {
      header: "Stock",
      render: (row) => (
        <span className="font-bold text-text-primary text-[17px]">
          {row.stock || "0"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-bold text-text-primary text-[17px]">
          ₹{row.price || "0"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "150px",
      render: (row) => {
        const isActive = !!row.is_active;
        const currentId = row.id || row._id;
        const isProcessing = togglingId === currentId;

        return (
          <div className="flex items-center gap-3">
            <span
              className={`w-[90px] text-center px-2 py-0.5 rounded-md text-[12px] font-bold uppercase tracking-wider border ${
                isActive
                  ? "bg-success-surface text-success border-success/20"
                  : "bg-error-surface text-error border-error/20"
              }`}
            >
              {isActive ? "Published" : "Draft"}
            </span>
            <button
              onClick={() => handleToggleStatus(currentId)}
              disabled={isProcessing}
              className={`w-9 h-5 rounded-full relative transition-all cursor-pointer p-0 ${
                isActive ? "bg-primary" : "bg-border"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-surface absolute top-1 transition-all ${
                  isActive ? "left-[20px]" : "left-[4px]"
                }`}
              />
            </button>
          </div>
        );
      },
    },
    {
      header: "Actions",
      width: "140px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-border"
            title="View"
            onClick={() =>
              navigate(`/books/view/${row.slug || row.id || row._id}`)
            }
          >
            <Eye size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success-surface text-text-secondary hover:text-success transition-all border border-border"
            title="Update Stock"
            onClick={() => {
              setSelectedBookForStock(row);
              setIsStockModalOpen(true);
            }}
          >
            <Package size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success-surface text-text-secondary hover:text-success transition-all border border-border"
            title="Edit"
            onClick={() =>
              navigate(`/books/edit/${row.slug || row.id || row._id}`)
            }
          >
            <Pencil size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
            title="Delete"
            onClick={() => handleDeleteClick(row.id || row._id)}
          >
            <Trash2 size={14} />
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
            Book Library
          </h1>
          <p className="text-text-secondary text-sm">
            Manage your digital book collection and metadata.
          </p>
        </div>
        <Button onClick={() => navigate("/books/add")}>
          <Plus size={16} className="mr-2" />
          Add New Book
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, author, or ISBN..."
          onReset={() => {
            setSearchQuery("");
            setStatusFilter("");
            setCurrentPage(1);
          }}
        />

        <div className="relative min-w-[140px] w-full md:w-auto">
          <select
            className="w-full bg-surface border border-border rounded-md py-2 px-3 outline-none focus:border-primary transition-all text-[15px] font-bold text-text-primary appearance-none cursor-pointer shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-surface text-error rounded-lg border border-error/20 text-sm font-semibold">
          {error}
        </div>
      )}

      <div>
        <Table
          columns={columns}
          data={currentData}
          loading={loading}
          emptyMessage="No books found."
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {isStockModalOpen && (
        <UpdateInventoryModal
          onClose={() => setIsStockModalOpen(false)}
          initialProduct={selectedBookForStock}
          refreshAction={() =>
            dispatch(
              fetchBooks({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter,
              }),
            )
          }
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book?"
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Books;
