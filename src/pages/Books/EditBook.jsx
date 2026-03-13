import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { updateBookThunk, clearBookError } from "../../store/slices/bookSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { bookApi } from "../../api/bookApi";
import FormInput from "../../components/Form/FormInput";
import Toggle from "../../components/Form/Toggle";
import Button from "../../components/UI/Button";
import RichTextEditor from "../../components/Form/RichTextEditor";
import { toast } from "react-hot-toast";

const EditBook = () => {
  const { slug } = useParams();
  const [bookId, setBookId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [existingPdf, setExistingPdf] = useState(null);
  const [existingEpub, setExistingEpub] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      author: Yup.string().required("Author is required"),
      price: Yup.mixed().required("Price is required"),
      category_id: Yup.mixed().required("Category is required"),
      book_file: Yup.mixed().nullable(),
      thumbnail: Yup.mixed().nullable(),
      cover_image: Yup.mixed().nullable(),
      images: Yup.array().nullable(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log(
        "[EditBook] onSubmit called, bookId:",
        bookId,
        "values:",
        values,
      );
      if (!bookId) {
        toast.error("Book ID not found. Please reload the page.");
        return;
      }
      const data = new FormData();

      // Append scalar fields — skip file keys and empty values
      const fileKeys = [
        "book_file",
        "thumbnail",
        "cover_image",
        "images",
      ];
      Object.entries(values).forEach(([key, val]) => {
        if (fileKeys.includes(key)) return;
        if (val === null || val === undefined || val === "") return;
        data.append(key, val);
      });

      // Append new file uploads only if selected
      if (values.book_file instanceof File)
        data.append("book_file", values.book_file);
      if (values.thumbnail instanceof File)
        data.append("thumbnail", values.thumbnail);
      if (values.cover_image instanceof File)
        data.append("cover_image", values.cover_image);

      if (Array.isArray(values.images)) {
        values.images.forEach((file) => {
          if (file instanceof File) data.append("images", file);
        });
      }

      try {
        const result = await dispatch(
          updateBookThunk({ id: bookId, formData: data }),
        );
        if (updateBookThunk.fulfilled.match(result)) {
          toast.success("Book updated successfully");
          navigate("/books");
        } else {
          toast.error(result.payload || "Failed to update book");
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
      }
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    const fetchBook = async () => {
      try {
        const response = await bookApi.getBookBySlug(slug);
        // API returns: { success: true, data: { ...book } }
        const book = response?.data?.data || response?.data || response;
        console.log("[EditBook] Fetched book:", book);

        if (book && (book.id || book._id)) {
          const id = book.id || book._id;
          setBookId(id);
          console.log("[EditBook] Book ID set to:", id);

          formik.setValues({
            title: book.title || "",
            author: book.author || "",
            description: book.description || "",
            price: book.price || "",
            original_price: book.original_price || "",
            condition: book.condition || "good",
            stock: book.stock || "1",
            category_id: String(book.category_id || book.category?.id || ""),
            published_date: book.published_date?.split("T")[0] || "",
            is_premium: book.is_premium || false,
            is_bestselling: book.is_bestselling || false,
            is_trending: book.is_trending || false,
            highlights: book.highlights || "",
            isbn: book.isbn || "",
            language: book.language || "",
            dimensions: book.dimensions || "",
            weight: book.weight || "",
            book_file: null,
            thumbnail: null,
            cover_image: null,
            images: [],
          });

          setExistingPdf(
            (book.file_data?.type === "pdf" ? book.file_data?.url : null) ||
              book.pdf_file?.url ||
              book.pdf_file,
          );
          setExistingEpub(
            (book.file_data?.type === "epub" ? book.file_data?.url : null) ||
              book.epub_file?.url ||
              book.epub_file,
          );
          setThumbnailPreview(book.thumbnail?.url || book.thumbnail);
          setCoverImagePreview(book.cover_image?.url || book.cover_image);

          if (Array.isArray(book.images)) {
            setImagesPreview(
              book.images.map((img) =>
                typeof img === "string" ? img : img.url,
              ),
            );
          }
        } else {
          toast.error("Book not found");
        }
      } catch (err) {
        console.error("[EditBook] Failed to load book:", err);
        toast.error("Failed to load book");
      } finally {
        setPageLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

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

  if (pageLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

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
            Edit Edition
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Update information for "{formik.values.title}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/books")}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              console.log("=== UPDATE CLICKED ===");
              console.log("bookId:", bookId);
              console.log("values:", formik.values);
              const errors = await formik.validateForm();
              console.log("validation errors:", errors);
              if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
              } else {
                console.log("FORM INVALID - errors above");
                const firstErr = Object.values(errors)[0];
                toast.error(firstErr);
              }
            }}
            loading={loading}
            icon={Save}
          >
            Update Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <FormInput
                label="Book Title"
                {...formik.getFieldProps("title")}
                error={formik.touched.title && formik.errors.title}
                required
              />
              <FormInput
                label="Author Name"
                {...formik.getFieldProps("author")}
                error={formik.touched.author && formik.errors.author}
                required
              />
              <FormInput
                label="ISBN (Optional)"
                {...formik.getFieldProps("isbn")}
              />
              <FormInput
                label="Language"
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
                type="textarea"
                {...formik.getFieldProps("highlights")}
                rows={2}
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              2. Inventory & Classification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
              <FormInput
                label="Price (₹)"
                type="number"
                {...formik.getFieldProps("price")}
                required
              />
              <FormInput
                label="MRP (₹)"
                type="number"
                {...formik.getFieldProps("original_price")}
              />
              <FormInput
                label="Stock"
                type="number"
                {...formik.getFieldProps("stock")}
              />
              <FormInput
                label="Condition"
                type="select"
                {...formik.getFieldProps("condition")}
                options={[
                  { v: "new", l: "New" },
                  { v: "good", l: "Good" },
                  { v: "fair", l: "Fair" },
                  { v: "acceptable", l: "Acceptable" },
                ].map((o) => ({ value: o.v, label: o.l }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormInput
                label="Category"
                type="select"
                placeholder="Select Category"
                {...formik.getFieldProps("category_id")}
                options={categories.map((c) => ({
                  value: c.id || c._id,
                  label: c.name,
                }))}
              />
              <FormInput
                label="Release Date"
                type="date"
                {...formik.getFieldProps("published_date")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <Toggle
                label="Premium"
                checked={formik.values.is_premium}
                onChange={() =>
                  formik.setFieldValue("is_premium", !formik.values.is_premium)
                }
              />
              <Toggle
                label="Bestselling"
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

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Physical & Edition Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Dimensions"
                {...formik.getFieldProps("dimensions")}
                placeholder="e.g. 5x8 in"
              />
              <FormInput
                label="Weight"
                {...formik.getFieldProps("weight")}
                placeholder="e.g. 300g"
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">
              Asset Management
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                  Book Manuscript (PDF or EPUB)
                </label>
                <label className="flex items-center justify-between p-3 rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all mt-1 bg-background">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-primary" />
                    <span className="text-[11px] font-bold truncate">
                      {formik.values.book_file
                        ? formik.values.book_file.name
                        : existingPdf
                          ? "Current: PDF"
                          : existingEpub
                            ? "Current: EPUB"
                            : "Upload Manuscript"}
                    </span>
                  </div>
                  <Upload size={14} className="opacity-40" />
                  <input
                    type="file"
                    name="book_file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.epub"
                  />
                </label>
                {/* Extension Indicator */}
                {(formik.values.book_file || existingPdf || existingEpub) && (
                  <div className="flex gap-2 mt-2 ml-1">
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${formik.values.book_file?.name.toLowerCase().endsWith(".pdf") || (!formik.values.book_file && existingPdf) ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
                    >
                      {formik.values.book_file?.name
                        .toLowerCase()
                        .endsWith(".pdf") ||
                      (!formik.values.book_file && existingPdf)
                        ? "PDF Version"
                        : "EPUB Version"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                      Thumbnail
                    </label>
                    <label className="relative aspect-[3/4] rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden bg-background mt-1">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="opacity-20" />
                      )}
                      <input
                        type="file"
                        name="thumbnail"
                        hidden
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
                      Cover Image
                    </label>
                    <label className="relative aspect-[3/4] rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden bg-background mt-1">
                      {coverImagePreview ? (
                        <img
                          src={coverImagePreview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="opacity-20" />
                      )}
                      <input
                        type="file"
                        name="cover_image"
                        hidden
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

export default EditBook;
