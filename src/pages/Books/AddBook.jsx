import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Upload,
  Save,
  Image as ImageIcon,
  Plus,
  X,
  FileText,
  Music,
} from "lucide-react";
import { createBook, clearBookError } from "../../store/slices/bookSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import FormInput from "../../components/Form/FormInput";
import Toggle from "../../components/Form/Toggle";
import Button from "../../components/UI/Button";
import RichTextEditor from "../../components/Form/RichTextEditor";
import { toast } from "react-hot-toast";

const AddBook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      author: "",
      description: "",
      price: "",
      original_price: "",
      condition: "good",
      stock: "",
      category_id: "",
      published_date: "",
      is_premium: false,
      is_bestselling: false,
      is_trending: false,
      highlights: "",
      isbn: "",
      language: "",
      dimensions: "",
      weight: "",
      book_file: null,
      thumbnail: null,
      cover_image: null,
      images: [],
      audio_file: null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      author: Yup.string().required("Author is required"),
      price: Yup.number().min(0).required("Price is required"),
      original_price: Yup.number().min(0),
      category_id: Yup.string().required("Category is required"),
      description: Yup.string().required("Description is required"),
      book_file: Yup.mixed().required("Manuscript is required"),
      thumbnail: Yup.mixed().required("Thumbnail required"),
      cover_image: Yup.mixed(),
      images: Yup.array(),
      audio_file: Yup.mixed().optional(),
    }),
    onSubmit: async (values) => {
      try {
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (key === "images" && Array.isArray(val)) {
            val.forEach((file) => data.append("images", file));
          } else if (val !== null && val !== undefined && val !== "") {
            data.append(key, val);
          }
        });

        const result = await dispatch(createBook(data));
        if (createBook.fulfilled.match(result)) {
          toast.success("Book registered successfully");
          navigate("/books");
        } else {
          toast.error(result.payload || "Registration failed");
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
      }
    },
  });

  // Watch for validation errors on submit attempt
  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      const firstError = Object.values(formik.errors)[0];
      if (firstError) toast.error(firstError);
    }
  }, [formik.submitCount, formik.isValid, formik.errors]);

  useEffect(() => {
    dispatch(fetchCategories());
    return () => dispatch(clearBookError());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.length) return;

    if (name === "images") {
      const fieldFiles = Array.from(files);
      const currentImages = formik.values.images || [];
      formik.setFieldValue("images", [...currentImages, ...fieldFiles]);

      fieldFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagesPreview((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    const file = files[0];
    formik.setFieldValue(name, file);

    if (name === "thumbnail") {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (name === "cover_image") {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = [...formik.values.images];
    newImages.splice(index, 1);
    formik.setFieldValue("images", newImages);

    const newPreviews = [...imagesPreview];
    newPreviews.splice(index, 1);
    setImagesPreview(newPreviews);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/books")}
            className="mb-2"
          >
            Back to Library
          </Button>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Register New Book
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Add a new manuscript or digital edition to the archive.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/books")}>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} loading={loading} icon={Save}>
            Save Edition
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Book Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <FormInput
                label="Book Title"
                name="title"
                {...formik.getFieldProps("title")}
                error={formik.touched.title && formik.errors.title}
                required
              />
              <FormInput
                label="Author Name"
                name="author"
                {...formik.getFieldProps("author")}
                error={formik.touched.author && formik.errors.author}
                required
              />
              <FormInput
                label="ISBN (Optional)"
                name="isbn"
                {...formik.getFieldProps("isbn")}
              />
              <FormInput
                label="Language"
                name="language"
                {...formik.getFieldProps("language")}
                placeholder="e.g. English"
              />
            </div>
            <RichTextEditor
              label="Description"
              value={formik.values.description}
              onChange={(val) => formik.setFieldValue("description", val)}
              error={formik.touched.description && formik.errors.description}
              required
            />
            <div className="mt-5">
              <FormInput
                label="Highlights"
                name="highlights"
                type="textarea"
                {...formik.getFieldProps("highlights")}
                placeholder="Key takeaways or features..."
                rows={2}
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Inventory & Classification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <FormInput
                label="Price (₹)"
                name="price"
                type="number"
                {...formik.getFieldProps("price")}
                error={formik.touched.price && formik.errors.price}
                required
              />
              <FormInput
                label="MRP (₹)"
                name="original_price"
                type="number"
                {...formik.getFieldProps("original_price")}
                required
              />
              <FormInput
                label="Stock"
                name="stock"
                type="number"
                {...formik.getFieldProps("stock")}
              />
              <FormInput
                label="Condition"
                name="condition"
                type="select"
                {...formik.getFieldProps("condition")}
                options={[
                  { v: "new", l: "New" },
                  { v: "good", l: "Good" },
                  { v: "fair", l: "Fair" },
                ].map((o) => ({ value: o.v, label: o.l }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <FormInput
                label="Category"
                name="category_id"
                type="select"
                placeholder="Select Category"
                {...formik.getFieldProps("category_id")}
                options={categories.map((c) => ({
                  value: c.id || c._id,
                  label: c.name,
                }))}
                required
                error={formik.touched.category_id && formik.errors.category_id}
              />
              <FormInput
                label="Release Date"
                name="published_date"
                type="date"
                {...formik.getFieldProps("published_date")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <Toggle
                label="Premium"
                description="Members only"
                checked={formik.values.is_premium}
                onChange={() =>
                  formik.setFieldValue("is_premium", !formik.values.is_premium)
                }
              />
              <Toggle
                label="Bestselling"
                description="High demand"
                checked={formik.values.is_bestselling}
                onChange={() =>
                  formik.setFieldValue(
                    "is_bestselling",
                    !formik.values.is_bestselling,
                  )
                }
              />
              <Toggle
                label="Trending"
                description="Popular now"
                checked={formik.values.is_trending}
                onChange={() =>
                  formik.setFieldValue(
                    "is_trending",
                    !formik.values.is_trending,
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Right: Media Assets & Secondary Details */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Physical & Edition Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Dimensions"
                name="dimensions"
                {...formik.getFieldProps("dimensions")}
                placeholder="e.g. 5x8 in"
              />
              <FormInput
                label="Weight"
                name="weight"
                {...formik.getFieldProps("weight")}
                placeholder="e.g. 300g"
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              Assets & Media
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                  Book Manuscript (PDF or EPUB){" "}
                  <span className="text-primary/70">*</span>
                </label>
                <label
                  className={`flex items-center justify-between p-3 rounded-md border-2 border-dashed transition-all cursor-pointer ${formik.values.book_file ? "border-primary bg-primary/5" : formik.submitCount > 0 && formik.errors.book_file ? "border-red-500 bg-red-50" : "border-border hover:border-primary/50"}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText
                      size={18}
                      className={
                        formik.values.book_file
                          ? "text-primary"
                          : formik.submitCount > 0 && formik.errors.book_file
                            ? "text-red-500"
                            : "text-text-secondary opacity-40"
                      }
                    />
                    <span
                      className={`text-[11px] font-bold truncate ${formik.values.book_file ? "text-primary" : formik.submitCount > 0 && formik.errors.book_file ? "text-red-500" : "text-text-secondary"}`}
                    >
                      {formik.values.book_file
                        ? formik.values.book_file.name
                        : "Click to upload Manuscript"}
                    </span>
                  </div>
                  <Upload
                    size={14}
                    className={
                      formik.submitCount > 0 && formik.errors.book_file
                        ? "text-red-500"
                        : "text-text-secondary opacity-40 shrink-0"
                    }
                  />
                  <input
                    type="file"
                    name="book_file"
                    accept=".pdf,.epub"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Error Message for Manuscript */}
                {formik.submitCount > 0 && formik.errors.book_file && (
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1 ml-1">
                    {formik.errors.book_file}
                  </p>
                )}

                {/* Visual feedback for extension */}
                {formik.values.book_file && (
                  <div className="flex gap-2 ml-1">
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${formik.values.book_file.name.toLowerCase().endsWith(".pdf") ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
                    >
                      {formik.values.book_file.name
                        .toLowerCase()
                        .endsWith(".pdf")
                        ? "PDF Version"
                        : "EPUB Version"}
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Upload Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                  Audio Version (MP3){" "}
                  <span className="text-text-secondary/50 font-normal italic">
                    (Optional)
                  </span>
                </label>
                <label
                  className={`flex items-center justify-between p-3 rounded-md border-2 border-dashed transition-all cursor-pointer ${formik.values.audio_file ? "border-amber-500 bg-amber-500/5" : "border-border hover:border-amber-500/50"}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Music
                      size={18}
                      className={
                        formik.values.audio_file
                          ? "text-amber-500"
                          : "text-text-secondary opacity-40"
                      }
                    />
                    <span
                      className={`text-[11px] font-bold truncate ${formik.values.audio_file ? "text-amber-500" : "text-text-secondary"}`}
                    >
                      {formik.values.audio_file
                        ? formik.values.audio_file.name
                        : "Click to upload Audio"}
                    </span>
                  </div>
                  <Upload
                    size={14}
                    className="text-text-secondary opacity-40 shrink-0"
                  />
                  <input
                    type="file"
                    name="audio_file"
                    accept=".mp3"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {formik.values.audio_file && (
                  <div className="flex gap-2 ml-1">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-500/10 text-amber-500">
                      MP3 Version Ready
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                      Thumbnail <span className="text-primary/70">*</span>
                    </label>
                    <label
                      className={`relative aspect-[3/4] rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden bg-background ${formik.touched.thumbnail && formik.errors.thumbnail ? "border-red-500 bg-red-50" : "border-border"}`}
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={20}
                          className={
                            formik.touched.thumbnail && formik.errors.thumbnail
                              ? "text-red-500"
                              : "text-text-secondary opacity-30"
                          }
                        />
                      )}
                      <input
                        type="file"
                        name="thumbnail"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    {formik.touched.thumbnail && formik.errors.thumbnail && (
                      <p className="text-[10px] font-bold text-red-500 uppercase mt-1 ml-1">
                        Thumbnail is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                      Cover Image
                    </label>
                    <label className="relative aspect-[3/4] rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden bg-background">
                      {coverImagePreview ? (
                        <img
                          src={coverImagePreview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={20}
                          className="text-text-secondary opacity-30"
                        />
                      )}
                      <input
                        type="file"
                        name="cover_image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                    Gallery Images
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imagesPreview.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-md border border-border overflow-hidden bg-background group"
                      >
                        <img
                          src={src}
                          className="w-full h-full object-cover"
                          alt={`Gallery ${idx}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all bg-background/50">
                      <Plus
                        size={18}
                        className="text-text-secondary opacity-40"
                      />
                      <span className="text-[8px] font-bold text-text-secondary uppercase mt-1">
                        Add
                      </span>
                      <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
