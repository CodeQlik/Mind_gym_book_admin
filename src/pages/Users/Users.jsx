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
    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center flex-shrink-0 shadow-sm">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-[11px] font-bold uppercase">
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
  const itemsPerPage = 10;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!searchQuery) {
      dispatch(fetchAllUsers({ page: currentPage, limit: itemsPerPage }));
    }
    return () => {
      dispatch(clearUserError());
    };
  }, [dispatch, currentPage, searchQuery, itemsPerPage]);

  // Handle Search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchUsersThunk(searchQuery));
      } else {
        dispatch(fetchAllUsers({ page: 1, limit: itemsPerPage }));
      }
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch, itemsPerPage]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      setIsDeleting(true);
      try {
        const id = userToDelete.id || userToDelete._id;
        await dispatch(deleteUserThunk(id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleting(false);
      }
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
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row} />
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-[17px] line-clamp-1">
              {row.name}
            </span>
            <span className="text-[13px] text-text-secondary font-bold uppercase tracking-wider opacity-60">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Mobile",
      render: (row) => (
        <span className="text-base text-text-secondary font-medium">
          {row.phone || row.mobile || "N/A"}
        </span>
      ),
    },
    {
      header: "Joined Date",
      render: (row) => {
        const dateValue =
          row.joined || row.createdAt || row.created_at || row.joined_at;
        return (
          <span className="text-base text-text-secondary font-medium">
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
      width: "150px",
      render: (row) => {
        const isActive = !!row.is_active;
        const currentId = row.id || row._id;
        const isProcessing = togglingId === currentId;

        return (
          <div className="flex items-center gap-3">
            <span
              className={`w-[90px] text-center px-2 py-0.5 rounded-md text-[13px] font-bold uppercase tracking-wider border ${
                isActive
                  ? "bg-success-surface text-success border-success/20"
                  : "bg-error-surface text-error border-error/20"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
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
            onClick={() => navigate(`/users/view/${row.id || row._id}`)}
          >
            <Eye size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success-surface text-text-secondary hover:text-success transition-all border border-border"
            title="Edit"
            onClick={() => navigate(`/users/edit/${row.id || row._id}`)}
          >
            <Pencil size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
            title="Delete"
            onClick={() => handleDeleteClick(row)}
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
            User Accounts
          </h1>
          <p className="text-text-secondary text-sm">
            Monitor and manage your platform users.
          </p>
        </div>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name or email..."
        onReset={() => {
          setSearchQuery("");
          setCurrentPage(1);
        }}
      />

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
          emptyMessage="No users found."
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
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Users;
