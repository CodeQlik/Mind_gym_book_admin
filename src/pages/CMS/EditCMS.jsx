import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Save, ArrowLeft, Loader2, Globe, FileEdit } from "lucide-react";
import cmsApi from "../../api/cmsApi";
import Button from "../../components/UI/Button";
import toast from "react-hot-toast";

const EditCMS = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_active: true,
  });

  const fetchPageDetails = async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getPage(slug);
      if (data.success) {
        setFormData({
          title: data.data.title,
          content: data.data.content,
          is_active: data.data.is_active,
        });
      }
    } catch (err) {
      toast.error("Failed to load page content. Using defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageDetails();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await cmsApi.savePage({
        slug,
        ...formData,
      });
      if (result.success) {
        toast.success(`${formData.title} updated successfully!`);
        navigate("/cms");
      }
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin opacity-40" />
        <p className="text-text-secondary font-medium animate-pulse">
          Loading Editor Content...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms")}
            className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              Edit {formData.title}
            </h1>
            <div className="flex items-center gap-2 text-text-secondary text-sm font-medium opacity-80 italic">
              <Globe size={14} />
              <span>Public URL Slug:</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-xs not-italic border border-primary/10">
                /{slug}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Settings Card */}
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-text-primary flex items-center gap-2">
                <FileEdit size={16} className="text-primary" />
                Page Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-background border border-border p-4 rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                placeholder="e.g. Terms & Conditions"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[15px] font-bold text-text-primary">
                Publishing Status
              </label>
              <div className="flex items-center bg-background border border-border p-2 rounded-xl h-[60px]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: true })}
                  className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${
                    formData.is_active
                      ? "bg-success text-white shadow-md shadow-success/20"
                      : "text-text-secondary hover:bg-surface"
                  }`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: false })}
                  className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${
                    !formData.is_active
                      ? "bg-error text-white shadow-md shadow-error/20"
                      : "text-text-secondary hover:bg-surface"
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[15px] font-bold text-text-primary">
              Page Content
            </label>
            <div className="bg-background rounded-2xl overflow-hidden border border-border min-h-[500px] shadow-inner quill-container">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                modules={quillModules}
                className="h-full"
                style={{ height: "450px" }}
              />
            </div>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="flex items-center justify-end gap-4 bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl sticky bottom-6 z-10">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/cms")}
            className="px-8 shadow-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[180px] shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {saving ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>

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
          font-size: 16px !important;
        }
        .quill-container .ql-editor {
          min-height: 400px;
          padding: 24px !important;
          line-height: 1.6 !important;
          color: var(--color-text-primary) !important;
        }
        .quill-container .ql-editor.ql-blank::before {
          color: var(--color-text-secondary) !important;
          opacity: 0.5 !important;
          font-style: normal !important;
          font-weight: normal !important;
        }
      `}</style>
    </div>
  );
};

export default EditCMS;
