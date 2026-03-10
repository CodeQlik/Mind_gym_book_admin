import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  Upload,
  CheckCircle2,
  X,
  FileText,
  Save,
  Eye,
  Send,
  Loader2,
  Globe,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import blogApi from "../../../api/blogApi";
import { categoryApi } from "../../../api/categoryApi";
import toast from "react-hot-toast";
import { Grid, LayoutPanelLeft } from "lucide-react";

const AddBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Admin",
    is_published: false,
    category_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
    ],
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchBlogDetails = async () => {
    try {
      setFetching(true);
      // Backend expects id in some controllers, slug in others.
      // Our controller uses id for update/delete.
      // But getAllBlogs returns the list.
      const data = await blogApi.getAllBlogs(); // Fetch all and find correct one for now
      const blog = data.data.find((b) => b.id.toString() === id);

      if (blog) {
        setFormData({
          title: blog.title || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          author: blog.author || "Admin",
          is_published: blog.is_published || false,
          category_id: blog.category_id || "",
          meta_title: blog.meta_title || "",
          meta_description: blog.meta_description || "",
          meta_keywords: blog.meta_keywords || "",
        });
        setImagePreview(blog.image || "");
      } else {
        toast.error("Blog not found");
        navigate("/cms/blog");
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch blog details");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill in title and content");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("author", formData.author);
    data.append("category_id", formData.category_id);
    data.append("is_published", formData.is_published);
    data.append("meta_title", formData.meta_title);
    data.append("meta_description", formData.meta_description);
    data.append("meta_keywords", formData.meta_keywords);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      setLoading(true);
      let res;
      if (isEdit) {
        res = await blogApi.updateBlog(id, data);
      } else {
        res = await blogApi.createBlog(data);
      }

      if (res.success) {
        toast.success(isEdit ? "Blog updated!" : "Blog created!");
        navigate("/cms/blog");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin opacity-40" />
        <p className="text-text-secondary font-medium animate-pulse">
          Loading Blog Content...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/blog")}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-text-secondary hover:text-primary transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">
              {isEdit ? "Edit Blog Post" : "Create New Post"}
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-70">
              Fill in the details to {isEdit ? "update" : "publish"} your blog.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                <FileText size={16} />
                Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a catchy title..."
                className="w-full px-5 py-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                  <Grid size={16} />
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-semibold appearance-none"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                  <LayoutPanelLeft size={16} />
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">
                Short Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief summary used in listings..."
                className="w-full px-5 py-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">
                Body Content <span className="text-error">*</span>
              </label>
              <div className="bg-background rounded-xl overflow-hidden border border-border min-h-[400px] shadow-inner quill-container">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  className="h-full"
                  placeholder="Start writing your story..."
                />
              </div>
            </div>
          </div>

          {/* SEO Settings Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden p-6 mt-6 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Globe size={18} />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                SEO Settings (Search Engine Optimization)
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="SEO Title (Recommended: < 60 chars)"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleInputChange}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="SEO description (Recommended: 150-160 chars)"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .quill-container .ql-toolbar {
            border: none !important;
            border-bottom: 1px solid var(--color-border) !important;
            background: var(--color-surface) !important;
            padding: 12px !important;
          }
          .quill-container .ql-container {
            border: none !important;
            font-family: inherit !important;
            font-size: 15px !important;
          }
          .quill-container .ql-editor {
            min-height: 350px;
            padding: 20px !important;
            line-height: 1.6 !important;
            color: var(--color-text-primary) !important;
          }
          .quill-container .ql-editor.ql-blank::before {
            color: var(--color-text-secondary) !important;
            opacity: 0.5 !important;
            font-style: normal !important;
          }
        `}</style>

        {/* Sidebar Settings Area */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-bold text-text-primary">Publishing</span>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
                <span className="text-sm font-bold text-text-secondary">
                  {formData.is_published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-wait"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isEdit ? <Save size={20} /> : <Send size={20} />}
                      <span>{isEdit ? "Update Post" : "Publish Post"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
            <span className="block font-bold text-text-primary mb-4">
              Featured Image
            </span>

            <div className="relative aspect-video rounded-xl bg-background border-2 border-dashed border-border flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-primary/50">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-primary transition-all cursor-pointer backdrop-blur-sm">
                      <Upload size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={removeImage}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-error transition-all backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-text-primary">
                      Click to upload
                    </span>
                    <span className="block text-[11px] text-text-secondary opacity-60">
                      JPG, PNG or WEBP (Max 5MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
