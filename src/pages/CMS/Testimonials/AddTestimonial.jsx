import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  Upload,
  X,
  User,
  Quote,
  Star,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import testimonialApi from "../../../api/testimonialApi";
import toast from "react-hot-toast";

const AddTestimonial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    content: "",
    rating: 5,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (isEdit) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      setFetching(true);
      const data = await testimonialApi.getAllTestimonials();
      const item = data.data.find((t) => t.id.toString() === id);

      if (item) {
        setFormData({
          name: item.name || "",
          designation: item.designation || "",
          content: item.content || "",
          rating: item.rating || 5,
          is_active: item.is_active || false,
        });
        setImagePreview(item.image || "");
      } else {
        toast.error("Testimonial not found");
        navigate("/cms/testimonials");
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch details");
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

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
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
    if (!formData.name || !formData.content) {
      toast.error("Please fill in name and feedback content");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("designation", formData.designation);
    data.append("content", formData.content);
    data.append("rating", formData.rating);
    data.append("is_active", formData.is_active);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      setLoading(true);
      let res;
      if (isEdit) {
        res = await testimonialApi.updateTestimonial(id, data);
      } else {
        res = await testimonialApi.createTestimonial(data);
      }

      if (res.success) {
        toast.success(isEdit ? "Testimonial updated!" : "Testimonial created!");
        navigate("/cms/testimonials");
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
          Loading Data...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/testimonials")}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-text-secondary hover:text-primary transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">
              {isEdit ? "Edit Testimonial" : "Add New Testimonial"}
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-70">
              Manage what users are saying about Mind Gym Book.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                  <User size={16} />
                  User Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-semibold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
                  <Quote size={16} className="rotate-180" />
                  Designation / Role
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">
                Feedback / Testimonial Content{" "}
                <span className="text-error">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                placeholder="Write the user feedback here..."
                className="w-full px-5 py-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all resize-none"
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-text-secondary">
                User Rating
              </label>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingChange(i + 1)}
                    className={`transition-all ${i < formData.rating ? "text-warning" : "text-border"}`}
                  >
                    <Star
                      size={32}
                      fill={i < formData.rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-bold text-text-primary">Status</span>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
                <span className="text-sm font-bold text-text-secondary">
                  {formData.is_active ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isEdit ? <Save size={20} /> : <Send size={20} />}
                  <span>{isEdit ? "Update Changes" : "Save Testimonial"}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
            <span className="block font-bold text-text-primary mb-4">
              User Avatar (Optional)
            </span>
            <div className="relative aspect-square w-32 mx-auto rounded-full bg-background border-2 border-dashed border-border flex items-center justify-center group overflow-hidden transition-all hover:border-primary/50">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-error transition-all backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <Upload
                    size={22}
                    className="text-text-secondary opacity-40"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-text-secondary opacity-60 text-center mt-4">
              JPG, PNG (Max 2MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTestimonial;
