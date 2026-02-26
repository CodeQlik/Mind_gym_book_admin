import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import {
  fetchAllUsers,
  clearUserError,
  deleteUserThunk,
  searchUsersThunk,
  toggleUserStatusThunk,
} from "../../store/slices/userSlice";

const UserAvatar = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  const parseImage = (imgData) => {
    if (!imgData) return null;
    if (typeof imgData === "string") {
      try {
        if (imgData.startsWith("{")) {
          const parsed = JSON.parse(imgData);
          return parsed.url || null;
        }
        return imgData;
      } catch (e) {
        return imgData;
      }
    }
    return imgData.url || null;
  };

  const imageUrl =
    parseImage(user.profile) ||
    parseImage(user.image) ||
    parseImage(user.avatar);

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-border/50 bg-background flex items-center justify-center flex-shrink-0 shadow-sm shadow-black/5">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-[0.8rem] font-black uppercase tracking-widest">
          {getInitials(user.name)}
        </div>
      )}
    </div>
  );
};

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error, totalPages, totalItems } = useSelector(
    (state) => state.users,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!searchQuery) {
      dispatch(fetchAllUsers({ page: currentPage, limit: itemsPerPage }));
    }
    return () => {
      dispatch(clearUserError());
    };
  }, [dispatch, currentPage, searchQuery]);

  // Handle Search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchUsersThunk(searchQuery));
      } else {
        dispatch(fetchAllUsers());
      }
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      const id = userToDelete.id || userToDelete._id;
      await dispatch(deleteUserThunk(id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    await dispatch(toggleUserStatusThunk(id));
    setTogglingId(null);
  };

  const currentData = users.filter((u) => {
    const role = (u.role || u.user_type || "").toLowerCase();
    return role === "user";
  });

  const columns = [
    {
      header: "User Details",
      width: "300px",
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row} />
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{row.name}</span>
            <span className="text-xs text-text-secondary">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (row) => {
        const role = row.role || row.user_type;
        const isAdmin =
          role === "Admin" || role === "admin" || role === "System Admin";
        return (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${
              isAdmin
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-indigo-500"}`}
            />
            <span className="text-xs font-semibold">{role}</span>
          </div>
        );
      },
    },
    {
      header: "Joined Date",
      render: (row) => {
        const dateValue = row.joined || row.createdAt || row.updatedAt;
        return (
          <span className="text-sm text-text-secondary">
            {dateValue
              ? new Date(dateValue).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        );
      },
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
      header: "Actions",
      width: "160px",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-sm border border-indigo-100 dark:border-indigo-500/20 cursor-pointer"
            title="View Details"
            onClick={() => navigate(`/users/view/${row.id || row._id}`)}
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all transform hover:-translate-y-1 shadow-sm border border-emerald-100 dark:border-emerald-500/20 cursor-pointer"
            title="Edit User"
            onClick={() => navigate(`/users/edit/${row.id || row._id}`)}
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all transform hover:-translate-y-1 shadow-sm border border-rose-100 dark:border-rose-500/20 cursor-pointer"
            title="Delete User"
            onClick={() => handleDeleteClick(row)}
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
            User <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-bold opacity-60 tracking-tight">
            Control access and manage user roles within your digital ecosystem.
          </p>
        </div>
      </div>

      <div className="text-left">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or role..."
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
          emptyMessage="No users found."
        />
      </div>

      <div className="mt-2 text-left">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Users;
