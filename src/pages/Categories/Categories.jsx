import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, Tags } from "lucide-react";
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
    await dispatch(deleteCategory(categoryToDelete));
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
      width: "100px",
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
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-border bg-background flex items-center justify-center shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 text-primary flex items-center justify-center uppercase font-bold text-xs">
                {row.name?.charAt(0) || "C"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Category",
      render: (row) => (
        <span className="font-bold text-text-primary capitalize">
          {row.name}
        </span>
      ),
    },
    {
      header: "Status",
      width: "250px",
      align: "right",
      render: (row) => {
        const isActive = row.is_active !== false;
        const isProcessing = togglingId === (row.id || row._id);
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
              onClick={() => handleToggleCategoryStatus(row.id || row._id)}
              disabled={isProcessing}
              className={`w-11 h-6 rounded-full relative transition-all duration-500 border-none cursor-pointer p-0 shadow-inner overflow-hidden ${
                isActive ? "bg-[#6366f1]" : "bg-slate-200 dark:bg-slate-800"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-1.25 transition-all duration-500 shadow-md ${
                  isActive ? "left-[24px]" : "left-[4px]"
                }`}
              />
            </button>
          </div>
        );
      },
    },
    {
      header: "ACTIONS",
      width: "180px",
      align: "right",
      render: (row) => {
        if (!row) return null;
        return (
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm border border-indigo-100 dark:border-indigo-500/20 cursor-pointer"
              title="View Category"
              onClick={() => navigate(`/categories/view/${row.id || row._id}`)}
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm border border-emerald-100 dark:border-emerald-500/20 cursor-pointer"
              title="Edit Category"
              onClick={() => navigate(`/categories/edit/${row.id || row._id}`)}
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm border border-rose-100 dark:border-rose-500/20 cursor-pointer"
              title="Delete Category"
              onClick={() => handleDeleteCategory(row.id || row._id)}
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in font-['Outfit']">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight leading-tight">
            Book <span className="text-primary italic">Categories</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Organize and manage your library taxonomy with precision.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/categories/add")}>
          Add Category
        </Button>
      </div>

      <div className="w-full md:w-1/2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
          onReset={() => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
        />
      </div>

      {error && (
        <div className="p-5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-bold text-sm tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          SYSTEM ALERT: {error}
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
        message="Are you sure you want to delete this category? This action cannot be undone."
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Categories;
