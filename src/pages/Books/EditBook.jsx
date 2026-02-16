import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import { updateBookThunk, clearBookError } from "../../store/slices/bookSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { bookApi } from "../../api/bookApi";
import FormInput from "../../components/Form/FormInput";
import TextArea from "../../components/Form/TextArea";
import Button from "../../components/UI/Button";

const EditBook = () => {
  const { slug } = useParams();
  const [bookId, setBookId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnail, setThumbnail] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingPdf, setExistingPdf] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    author: Yup.string().required("Author is required"),
    price: Yup.number()
      .min(0, "Price cannot be negative")
      .required("Price is required"),
    original_price: Yup.number()
      .min(0, "Original price cannot be negative")
      .required("Original price is required"),
    stock: Yup.number()
      .min(0, "Stock cannot be negative")
      .required("Stock is required"),
    category_id: Yup.string().required("Category is required"),
    published_date: Yup.string().required("Published date is required"),
    description: Yup.string().required("Description is required"),
    isbn: Yup.string(),
    language: Yup.string(),
    condition: Yup.string().required("Condition is required"),
    is_premium: Yup.boolean(),
    pdf_file: Yup.mixed().optional(),
    thumbnail: Yup.mixed().optional(),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      author: "",
      description: "",
      price: "",
      original_price: "",
      condition: "good",
      stock: "1",
      category_id: "",
      published_date: "",
      is_premium: false,
      isbn: "",
      language: "",
      pdf_file: null,
      thumbnail: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const data = new FormData();
      Object.keys(values).forEach((key) => {
        data.append(key, values[key]);
      });

      const result = await dispatch(
        updateBookThunk({ id: bookId, formData: data }),
      );
      if (updateBookThunk.fulfilled.match(result)) {
        navigate("/books");
      }
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());

    const fetchBookDetails = async () => {
      try {
        const response = await bookApi.getBookBySlug(slug);
        if (response.success) {
          const book = response.data;
          setBookId(book.id || book._id);
          const catId =
            book.category_id || book.category?._id || book.category?.id || "";

          formik.setValues({
            title: book.title || "",
            author: book.author || "",
            description: book.description || "",
            price: book.price || "",
            original_price: book.original_price || "",
            condition: book.condition || "good",
            stock: book.stock || "1",
            category_id: catId,
            published_date: book.published_date
              ? book.published_date.split("T")[0]
              : "",
            is_premium: book.is_premium || false,
            isbn: book.isbn || "",
            language: book.language || "",
          });

          if (book.pdf_file) {
            setExistingPdf(book.pdf_file.url);
          }

          if (book.thumbnail) {
            const url =
              typeof book.thumbnail === "string"
                ? book.thumbnail.startsWith("{")
                  ? JSON.parse(book.thumbnail).url
                  : book.thumbnail
                : book.thumbnail.url;
            setPreview(url);
          }
        }
      } catch (err) {
        console.error("Failed to fetch book details", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchBookDetails();
    return () => dispatch(clearBookError());
  }, [dispatch, slug]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      if (name === "thumbnail") {
        setThumbnail(file);
        formik.setFieldValue("thumbnail", file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else if (name === "pdf_file") {
        setPdfFile(file);
        formik.setFieldValue("pdf_file", file);
      }
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium font-['Outfit']">
          Loading book details...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit']">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/books")}
        >
          Back to Library
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary italic">
            Edit Book
          </h1>
          <p className="text-text-secondary mt-1 tracking-tight">
            Update the information for{" "}
            <span className="text-text-primary font-bold">
              "{formik.values.title}"
            </span>
            .
          </p>
        </div>
      </div>

      <div className="bg-surface/70 backdrop-blur-lg border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-xl max-w-[1100px]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-10">
          {/* Section 1: General Info */}
          <div className="pb-10 border-b border-border">
            <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              1. Book Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <FormInput
                label="Book Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && formik.errors.title}
                required
                placeholder="e.g. Atomic Habits"
              />
              <FormInput
                label="Author Name"
                name="author"
                value={formik.values.author}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.author && formik.errors.author}
                required
                placeholder="e.g. James Clear"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <FormInput
                label="ISBN"
                name="isbn"
                value={formik.values.isbn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.isbn && formik.errors.isbn}
                placeholder="e.g. 978-3-16-148410-0"
                className="font-mono"
              />
              <FormInput
                label="Language"
                name="language"
                value={formik.values.language}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.language && formik.errors.language}
                placeholder="e.g. English, Hindi"
              />
            </div>
            <TextArea
              label="Description / Summary"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              placeholder="Briefly describe what the book is about..."
            />
          </div>

          {/* Section 2: Details & Pricing */}
          <div className="pb-10 border-b border-border">
            <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              2. Details & Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 mb-8">
              <FormInput
                label="Price (₹)"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                required
                placeholder="0.00"
              />
              <FormInput
                label="Original Price"
                name="original_price"
                type="number"
                value={formik.values.original_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.original_price && formik.errors.original_price
                }
                required
                placeholder="0.00"
              />
              <FormInput
                label="Condition"
                name="condition"
                type="select"
                value={formik.values.condition}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.condition && formik.errors.condition}
                required
                options={[
                  { value: "new", label: "🆕 New" },
                  { value: "good", label: "✨ Good" },
                  { value: "fair", label: "📖 Fair" },
                  { value: "acceptable", label: "♻️ Acceptable" },
                ]}
              />
              <FormInput
                label="Stock"
                name="stock"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stock && formik.errors.stock}
                required
                placeholder="Quantity"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Category"
                name="category_id"
                type="select"
                value={formik.values.category_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category_id && formik.errors.category_id}
                required
                placeholder="Select Category"
                options={categories.map((cat) => ({
                  value: cat.id || cat._id,
                  label: cat.name,
                }))}
              />

              <FormInput
                label="Release Date"
                name="published_date"
                type="date"
                value={formik.values.published_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.published_date && formik.errors.published_date
                }
                required
              />
            </div>
          </div>

          {/* Section 3: Media & Files */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              3. Files & Assets
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-primary ml-1 block">
                    PDF Manuscript (optional)
                  </label>
                  {existingPdf && (
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="text-text-secondary font-medium">
                        Current:
                      </span>
                      <a
                        href={existingPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline decoration-2 flex items-center gap-1"
                      >
                        View Manuscript{" "}
                        <ArrowLeft className="rotate-180" size={14} />
                      </a>
                    </div>
                  )}
                  <div className="relative group">
                    <input
                      type="file"
                      name="pdf_file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className={`w-full bg-background border-2 border-dashed ${
                        formik.touched.pdf_file && formik.errors.pdf_file
                          ? "border-rose-500"
                          : "border-border hover:border-primary"
                      } transition-all rounded-2xl py-4 px-6 cursor-pointer flex items-center justify-between text-text-primary`}
                    >
                      <span className="font-bold flex items-center gap-2 truncate pr-4">
                        {pdfFile ? (
                          <span className="text-primary truncate">
                            {pdfFile.name}
                          </span>
                        ) : (
                          <span className="text-text-secondary/50">
                            Replace PDF File...
                          </span>
                        )}
                      </span>
                      <Upload
                        size={20}
                        className="text-primary group-hover:animate-bounce shrink-0"
                      />
                    </label>
                  </div>
                  {formik.touched.pdf_file && formik.errors.pdf_file && (
                    <p className="text-rose-500 text-xs font-bold ml-1 mt-1 italic animate-in fade-in slide-in-from-top-1">
                      {formik.errors.pdf_file}
                    </p>
                  )}
                  <p className="text-[0.65rem] font-bold text-text-secondary mt-1 px-1 uppercase tracking-wider">
                    Only upload if you want to replace the existing file.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm mt-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="is_premium"
                        name="is_premium"
                        checked={formik.values.is_premium}
                        onChange={formik.handleChange}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-primary/40 transition-all checked:bg-primary checked:border-primary"
                      />
                      <svg
                        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white transition-opacity pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <label
                      htmlFor="is_premium"
                      className="text-base font-bold text-text-primary cursor-pointer"
                    >
                      Mark as Premium Content
                    </label>
                  </div>
                  <p className="text-[0.75rem] font-medium text-text-secondary mt-2 ml-9">
                    Premium books require a subscription or purchase to read and
                    enjoy full features.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary ml-1 block">
                  Cover Thumbnail
                </label>
                <div
                  className={`border-2 border-dashed ${
                    formik.touched.thumbnail && formik.errors.thumbnail
                      ? "border-rose-500"
                      : "border-border"
                  } rounded-3xl p-8 bg-primary/[0.02] hover:bg-primary/[0.04] transition-all flex flex-col items-center justify-center min-h-[260px] relative group overflow-hidden`}
                >
                  {preview ? (
                    <div className="relative aspect-[3/4] h-48 rounded-xl overflow-hidden shadow-2xl group/preview">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-xl transform scale-90 group-hover/preview:scale-100 transition-transform hover:bg-primary-hover">
                        <Upload size={20} />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                          name="thumbnail"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={32} className="text-primary" />
                      </div>
                      <p className="font-bold text-text-primary uppercase tracking-tight">
                        Update Cover
                      </p>
                      <p className="text-[0.7rem] font-bold text-text-secondary mt-1">
                        JPG, PNG or WebP
                      </p>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        name="thumbnail"
                      />
                    </label>
                  )}
                </div>
                {formik.touched.thumbnail && formik.errors.thumbnail && (
                  <p className="text-rose-500 text-xs font-bold ml-1 mt-1 italic animate-in fade-in slide-in-from-top-1">
                    {formik.errors.thumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
              <span className="flex-1 italic">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" icon={Save} loading={loading} size="lg">
              {loading ? "Updating..." : "Update Book Details"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/books")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
