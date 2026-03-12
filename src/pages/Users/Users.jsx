import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Smartphone, LogOut, Clock, Globe, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CustomModal from "../../components/Modal/CustomModal";
import { userApi } from "../../api/userApi";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import SearchInput from "../../components/Search/SearchInput";
import {
  fetchAllUsers,
  clearUserError,
  searchUsersThunk,
  toggleUserStatusThunk,
  deleteUserThunk,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionUser, setSessionUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [terminatingSessionId, setTerminatingSessionId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    await dispatch(toggleUserStatusThunk(id));
    setTogglingId(null);
  };

  const handleViewSessions = async (user) => {
    setSessionUser(user);
    setIsSessionModalOpen(true);
    setSessionLoading(true);
    try {
      const res = await userApi.adminGetUserSessions(user.id || user._id);
      if (res.success) {
        setActiveSessions(res.data);
      } else {
        toast.error(res.message || "Failed to fetch sessions");
      }
    } catch (err) {
      toast.error("Error loading user sessions");
    } finally {
      setSessionLoading(false);
    }
  };

  const handleTerminateAdminSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to terminate this session?"))
      return;

    setTerminatingSessionId(sessionId);
    try {
      const res = await userApi.adminTerminateSession(
        sessionUser.id || sessionUser._id,
        sessionId,
      );
      if (res.success) {
        toast.success("Session terminated successfully");
        // Refresh session list
        const updatedRes = await userApi.adminGetUserSessions(
          sessionUser.id || sessionUser._id,
        );
        if (updatedRes.success) setActiveSessions(updatedRes.data);
      } else {
        toast.error(res.message || "Failed to terminate session");
      }
    } catch (err) {
      toast.error("Error terminating session");
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const res = await dispatch(
        deleteUserThunk(userToDelete.id || userToDelete._id),
      ).unwrap();
      toast.success("User deleted successfully");
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
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
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-amber-100 text-text-secondary hover:text-amber-600 transition-all border border-border"
            title="Active Devices"
            onClick={() => handleViewSessions(row)}
          >
            <Smartphone size={14} />
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
            onClick={() => {
              setUserToDelete(row);
              setDeleteConfirmOpen(true);
            }}
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

      <CustomModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Active Device Sessions"
        subtitle={sessionUser?.name}
        icon={Smartphone}
        maxWidth="max-w-lg"
      >
        <div className="p-6">
          {sessionLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                Scanning network...
              </p>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-text-secondary/20">
                <Smartphone size={24} />
              </div>
              <p className="text-text-secondary font-bold uppercase tracking-wider text-xs">
                No active sessions found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Active Device List ({activeSessions.length})
                </span>
              </div>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-background border border-border rounded-xl flex items-center justify-between transition-all hover:border-primary/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Smartphone size={18} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-text-primary capitalize leading-none">
                          {session.device_name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-text-secondary font-bold flex items-center gap-1">
                            <Globe size={10} className="opacity-40" />{" "}
                            {session.ip_address}
                          </span>
                          <span className="text-[10px] text-text-secondary font-bold flex items-center gap-1">
                            <Clock size={10} className="opacity-40" />{" "}
                            {new Date(session.last_active).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTerminateAdminSession(session.id)}
                      disabled={terminatingSessionId === session.id}
                      className="p-2 rounded-lg bg-error-surface text-error border border-error/10 hover:bg-error hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                      title="Remote Logout"
                    >
                      {terminatingSessionId === session.id ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <LogOut size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button
              onClick={() => setIsSessionModalOpen(false)}
              className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-dark transition-colors border-none cursor-pointer"
            >
              Close Status
            </button>
          </div>
        </div>
      </CustomModal>

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
          }
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will delete all associated records (orders, subscriptions, etc.) from the database.`}
        confirmText={isDeleting ? "Deleting..." : "Delete User"}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Users;
