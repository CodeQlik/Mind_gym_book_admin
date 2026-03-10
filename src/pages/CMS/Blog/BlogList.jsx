import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import blogApi from "../../../api/blogApi";
import Table from "../../../components/Table/Table";
import Pagination from "../../../components/Pagination/Pagination";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";
import SearchInput from "../../../components/Search/SearchInput";
import toast from "react-hot-toast";

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAllBlogs();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteClick = (id) => {
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    try {
      const data = await blogApi.deleteBlog(blogToDelete);
      if (data.success) {
        toast.success("Blog deleted successfully");
        setBlogs(blogs.filter((b) => b.id !== blogToDelete));
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const currentData = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "Blog Post",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
            {row.image ? (
              <img
                src={row.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary opacity-30">
                <FileText size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-text-primary text-[15px] leading-snug truncate">
              {row.title}
            </span>
            <span className="text-[12px] text-text-secondary opacity-70 italic truncate max-w-[300px]">
              {row.excerpt || "No excerpt provided"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Author",
      width: "120px",
      render: (row) => (
        <span className="text-[14px] font-medium text-text-secondary">
          {row.author || "Admin"}
        </span>
      ),
    },
    {
      header: "Category",
      width: "140px",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-background border border-border text-[12px] font-bold text-text-primary shadow-sm">
          {row.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "140px",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.is_published ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-bold uppercase tracking-wider border border-success/20">
              <CheckCircle2 size={12} />
              Published
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[11px] font-bold uppercase tracking-wider border border-warning/20">
              <Clock size={12} />
              Draft
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      width: "150px",
      render: (row) => (
        <span className="text-[13px] font-semibold text-text-secondary opacity-60">
          {new Date(row.created_at || row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      width: "130px",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-border group"
            title="Edit Blog"
            onClick={() => navigate(`/cms/blog/edit/${row.id}`)}
          >
            <Pencil
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-error/10 text-text-secondary hover:text-error transition-all border border-border group"
            title="Delete Blog"
            onClick={() => handleDeleteClick(row.id)}
          >
            <Trash2
              size={14}
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
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              Blogs Management
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80">
              Create, edit and manage your blog posts.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/cms/blog/add")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-dark shadow-md shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Add New Blog</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title or content..."
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
            emptyMessage="No blog posts found. Create your first post!"
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredBlogs.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this blog post? This action cannot be undone."
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default BlogList;
