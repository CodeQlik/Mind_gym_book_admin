import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories,
  toggleCategoryStatus,
  deleteCategory,
  searchCategoriesThunk,
} from "../../store/slices/categorySlice";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(
    (state) => state.categories,
  );

  const [togglingId, setTogglingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleCategoryStatus = async (id) => {
    setTogglingId(id);
    await dispatch(toggleCategoryStatus(id));
    setTogglingId(null);
  };

  const handleDeleteCategory = (id) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCategory(categoryToDelete));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle Search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchCategoriesThunk(searchQuery));
      } else {
        dispatch(fetchCategories());
      }
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const currentData = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "Profile",
      width: "80px",
      render: (row) => {
        let imageUrl = null;
        try {
          if (row.image) {
            if (typeof row.image === "string") {
              const parsed = JSON.parse(row.image);
              imageUrl = parsed.url;
            } else {
              imageUrl = row.image.url;
            }
          }
        } catch (e) {
          imageUrl = row.image;
        }

        if (!imageUrl && row.profile?.url) {
          imageUrl = row.profile.url;
        }

        return (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                {row.name?.charAt(0) || "C"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Category Name",
      render: (row) => (
        <span className="font-bold text-text-primary text-[17px] capitalize">
          {row.name}
        </span>
      ),
    },
    {
      header: "Created At",
      width: "180px",
      render: (row) => {
        const dateValue = row.createdAt || row.created_at;
        return (
          <div className="flex items-center gap-2 text-text-secondary text-[15px] font-semibold">
            <span className="opacity-40 tracking-tight">
              {dateValue
                ? new Date(dateValue).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      width: "200px",
      render: (row) => {
        const isActive = !!row.is_active;
        const isProcessing = togglingId === (row.id || row._id);
        return (
          <div className="flex items-center gap-3">
            <span
              className={`w-[75px] text-center px-2 py-0.5 rounded-md text-[12px] font-bold uppercase tracking-wider border ${
                isActive
                  ? "bg-success-surface text-success border-success/20"
                  : "bg-error-surface text-error border-error/20"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>

            <button
              onClick={() => handleToggleCategoryStatus(row.id || row._id)}
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
      width: "150px",
      align: "right",
      render: (row) => {
        if (!row) return null;
        return (
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-border"
              title="View"
              onClick={() => navigate(`/categories/view/${row.id || row._id}`)}
            >
              <Eye size={14} />
            </button>
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success-surface text-text-secondary hover:text-success transition-all border border-border"
              title="Edit"
              onClick={() => navigate(`/categories/edit/${row.id || row._id}`)}
            >
              <Pencil size={14} />
            </button>
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
              title="Delete"
              onClick={() => handleDeleteCategory(row.id || row._id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Categories
          </h1>
          <p className="text-text-secondary text-base">
            Manage your book categorization system.
          </p>
        </div>
        <Button onClick={() => navigate("/categories/add")}>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search categories..."
        onReset={() => {
          setSearchQuery("");
          setCurrentPage(1);
        }}
      />

      {error && (
        <div className="p-4 bg-error-surface text-error rounded-lg border border-error/20 text-sm font-semibold flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-error" />
          {error}
        </div>
      )}

      <div>
        <Table
          columns={columns}
          data={currentData}
          loading={loading}
          emptyMessage="No categories found."
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={categories.length}
        itemsPerPage={itemsPerPage}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Categories;
