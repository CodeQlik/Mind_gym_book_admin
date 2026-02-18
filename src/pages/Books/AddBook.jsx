import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import { createBook, clearBookError } from "../../store/slices/bookSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import FormInput from "../../components/Form/FormInput";
import TextArea from "../../components/Form/TextArea";
import Button from "../../components/UI/Button";

const AddBook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

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
    is_bestselling: Yup.boolean(),
    is_trending: Yup.boolean(),
    highlights: Yup.string(),
    otherdescription: Yup.string(),
    pdf_file: Yup.mixed().required("PDF file is required"),
    thumbnail: Yup.mixed().required("Thumbnail is required"),
    cover_image: Yup.mixed().optional(),
    images: Yup.array().optional(),
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
      is_bestselling: false,
      is_trending: false,
      highlights: "",
      otherdescription: "",
      isbn: "",
      language: "",
      pdf_file: null,
      thumbnail: null,
      cover_image: null,
      images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const data = new FormData();

      const fields = [
        "title",
        "author",
        "description",
        "price",
        "original_price",
        "condition",
        "stock",
        "category_id",
        "published_date",
        "is_premium",
        "is_bestselling",
        "is_trending",
        "highlights",
        "otherdescription",
        "isbn",
        "language",
        "pdf_file",
        "thumbnail",
        "cover_image",
      ];

      fields.forEach((key) => {
        if (
          values[key] !== null &&
          values[key] !== undefined &&
          values[key] !== ""
        ) {
          data.append(key, values[key]);
        }
      });

      // Handle multiple images (gallery)
      if (values.images && values.images.length > 0) {
        values.images.forEach((file) => {
          data.append("images", file);
        });
      }

      const result = await dispatch(createBook(data));
      if (createBook.fulfilled.match(result)) {
        navigate("/books");
      }
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    return () => dispatch(clearBookError());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === "thumbnail") {
        const file = files[0];
        formik.setFieldValue("thumbnail", file);
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailPreview(reader.result);
        reader.readAsDataURL(file);
      } else if (name === "cover_image") {
        const file = files[0];
        formik.setFieldValue("cover_image", file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result);
        reader.readAsDataURL(file);
      } else if (name === "pdf_file") {
        const file = files[0];
        setPdfFile(file);
        formik.setFieldValue("pdf_file", file);
      } else if (name === "images") {
        const selectedFiles = Array.from(files);
        const currentImages = [...formik.values.images];
        const newImages = [...currentImages, ...selectedFiles];
        formik.setFieldValue("images", newImages);

        const newPreviews = selectedFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });

        Promise.all(newPreviews).then((results) => {
          setGalleryPreviews((prev) => [...prev, ...results]);
        });
      }
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = formik.values.images.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    formik.setFieldValue("images", newImages);
    setGalleryPreviews(newPreviews);
  };

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
            Add New Edition
          </h1>
          <p className="text-text-secondary mt-1 tracking-tight">
            Register a new book or manuscript in the Mind Gym digital archive.
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

            <div className="flex flex-col gap-6">
              <TextArea
                label="Main Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && formik.errors.description}
                placeholder="Briefly describe what the book is about..."
                required
              />

              <TextArea
                label="Other Description / Notes"
                name="otherdescription"
                value={formik.values.otherdescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.otherdescription &&
                  formik.errors.otherdescription
                }
                placeholder="Additional details, summary or notes..."
              />

              <TextArea
                label="Key Highlights"
                name="highlights"
                value={formik.values.highlights}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.highlights && formik.errors.highlights}
                placeholder="List major takeaways or highlights..."
              />
            </div>
          </div>

          {/* Section 2: Details & Status */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

            {/* Status Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="is_premium"
                      name="is_premium"
                      checked={formik.values.is_premium}
                      onChange={formik.handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-primary/40 checked:bg-primary"
                    />
                    <X
                      size={14}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white pointer-events-none"
                    />
                  </div>
                  <label
                    htmlFor="is_premium"
                    className="text-sm font-bold text-text-primary cursor-pointer"
                  >
                    Premium Content
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="is_bestselling"
                      name="is_bestselling"
                      checked={formik.values.is_bestselling}
                      onChange={formik.handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-amber-500/40 checked:bg-amber-500"
                    />
                    <X
                      size={14}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white pointer-events-none"
                    />
                  </div>
                  <label
                    htmlFor="is_bestselling"
                    className="text-sm font-bold text-text-primary cursor-pointer"
                  >
                    Bestseller
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="is_trending"
                      name="is_trending"
                      checked={formik.values.is_trending}
                      onChange={formik.handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-indigo-500/40 checked:bg-indigo-500"
                    />
                    <X
                      size={14}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white pointer-events-none"
                    />
                  </div>
                  <label
                    htmlFor="is_trending"
                    className="text-sm font-bold text-text-primary cursor-pointer"
                  >
                    Trending
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Media & Files */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              3. Files & Media Assets
            </h3>

            <div className="space-y-10">
              {/* PDF & Cover Upload Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-primary ml-1 block">
                      PDF Manuscript
                    </label>
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
                        } transition-all rounded-2xl py-4 px-6 cursor-pointer flex items-center justify-between text-text-primary group-hover:bg-primary/[0.02]`}
                      >
                        <span className="font-bold flex items-center gap-2 truncate pr-4">
                          {pdfFile ? (
                            <span className="text-primary truncate">
                              {pdfFile.name}
                            </span>
                          ) : (
                            <span className="text-text-secondary/50">
                              Upload PDF File...
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
                      <p className="text-rose-500 text-xs font-bold ml-1 mt-1 italic">
                        {formik.errors.pdf_file}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-primary ml-1 block">
                      Small Thumbnail
                    </label>
                    <div
                      className={`border-2 border-dashed ${formik.touched.thumbnail && formik.errors.thumbnail ? "border-rose-500" : "border-border"} rounded-3xl p-6 bg-slate-50/50 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center min-h-[220px] relative`}
                    >
                      {thumbnailPreview ? (
                        <div className="relative aspect-[3/4] h-40 rounded-xl overflow-hidden shadow-lg group">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailPreview(null);
                              formik.setFieldValue("thumbnail", null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center text-center p-4">
                          <Upload size={32} className="text-primary mb-3" />
                          <p className="font-bold text-text-primary text-sm">
                            Upload Thumbnail
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
                      <p className="text-rose-500 text-xs font-bold ml-1 mt-1 italic">
                        {formik.errors.thumbnail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-primary ml-1 block">
                    Large Cover Image
                  </label>
                  <div className="border-2 border-dashed border-border rounded-[2.5rem] p-8 bg-slate-50/50 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center min-h-[300px] relative group">
                    {coverPreview ? (
                      <div className="relative aspect-[3/4] h-64 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={coverPreview}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPreview(null);
                            formik.setFieldValue("cover_image", null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center text-center p-6">
                        <ImageIcon
                          size={48}
                          className="text-primary/40 mb-4 group-hover:scale-110 transition-transform"
                        />
                        <p className="font-bold text-text-primary">
                          Upload High-Res Cover
                        </p>
                        <p className="text-xs font-medium text-text-secondary mt-2">
                          Recommended: 1200 x 1600 px
                        </p>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                          name="cover_image"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-semibold text-text-primary">
                    Gallery Images
                  </label>
                  <span className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest">
                    {galleryPreviews.length} / 10 Images
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm bg-surface"
                    >
                      <img
                        src={preview}
                        alt={`Gallery ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {galleryPreviews.length < 10 && (
                    <label className="relative aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all group">
                      <Plus
                        size={24}
                        className="text-primary/40 group-hover:text-primary transition-colors"
                      />
                      <span className="text-[0.6rem] font-black text-text-secondary mt-2 uppercase tracking-tighter">
                        Add More
                      </span>
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        name="images"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
              <span className="flex-1 italic">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
            <Button type="submit" icon={Save} loading={loading} size="lg">
              {loading ? "Registering..." : "Save Edition"}
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

export default AddBook;
