import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  const [pdfFile, setPdfFile] = useState(null);
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
    is_bestselling: Yup.boolean(),
    is_trending: Yup.boolean(),
    highlights: Yup.string(),
    otherdescription: Yup.string(),
    pdf_file: Yup.mixed().nullable().optional(),
    thumbnail: Yup.mixed().nullable().optional(),
    cover_image: Yup.mixed().nullable().optional(),
    images: Yup.array().nullable().optional(),
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
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("Submitting book update for ID:", bookId, values);
      const data = new FormData();

      // 1. Handle regular text/boolean fields
      const textFields = [
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
      ];

      textFields.forEach((key) => {
        if (values[key] !== null && values[key] !== undefined) {
          data.append(key, values[key]);
        }
      });

      // 2. Handle file fields - ONLY append if it's a new file (not the initial null)
      const fileFields = ["pdf_file", "thumbnail", "cover_image"];
      fileFields.forEach((key) => {
        if (values[key] instanceof File || values[key] instanceof Blob) {
          data.append(key, values[key]);
        }
      });

      // 3. Handle multiple images (gallery)
      if (values.images && values.images.length > 0) {
        values.images.forEach((file) => {
          if (file instanceof File || file instanceof Blob) {
            data.append("images", file);
          }
        });
      }

      const result = await dispatch(
        updateBookThunk({ id: bookId, formData: data }),
      );
      if (updateBookThunk.fulfilled.match(result)) {
        console.log("Update successful!");
        navigate("/books");
      } else {
        console.error("Update failed:", result.payload);
      }
    },
  });

  // Log validation errors to console for developer help
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      console.warn("Formik Validation Errors:", formik.errors);
    }
  }, [formik.submitCount, formik.errors]);

  useEffect(() => {
    dispatch(fetchCategories());

    const fetchBookDetails = async () => {
      try {
        const response = await bookApi.getBookBySlug(slug);
        const book = response.data || response;
        if (book) {
          setBookId(book.id || book._id);

          // Use category_id directly if possible, else look in the populated category object
          const catId =
            book.category_id || book.category?.id || book.category?._id || "";

          formik.setValues({
            title: book.title || "",
            author: book.author || "",
            description: book.description || "",
            price: book.price || "",
            original_price: book.original_price || "",
            condition: book.condition || "good",
            stock: book.stock !== undefined ? book.stock : "1",
            category_id: catId,
            published_date: book.published_date
              ? book.published_date.split("T")[0]
              : "",
            is_premium: book.is_premium || false,
            is_bestselling: book.is_bestselling || false,
            is_trending: book.is_trending || false,
            highlights: book.highlights || "",
            otherdescription: book.otherdescription || "",
            isbn: book.isbn || "",
            language: book.language || "",
            pdf_file: null,
            thumbnail: null,
            cover_image: null,
            images: [],
          });

          if (book.pdf_file) {
            setExistingPdf(
              typeof book.pdf_file === "string"
                ? book.pdf_file
                : book.pdf_file.url,
            );
          }

          if (book.thumbnail) {
            setThumbnailPreview(
              typeof book.thumbnail === "string"
                ? book.thumbnail
                : book.thumbnail.url,
            );
          }

          if (book.cover_image) {
            setCoverPreview(
              typeof book.cover_image === "string"
                ? book.cover_image
                : book.cover_image.url,
            );
          }

          if (book.images && Array.isArray(book.images)) {
            setExistingGallery(book.images);
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
                    className="text-sm font-bold text-text-primary cursor-pointer rotate-0"
                  >
                    Premium Content
                  </label>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_bestselling"
                    name="is_bestselling"
                    checked={formik.values.is_bestselling}
                    onChange={formik.handleChange}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-amber-500/40 checked:bg-amber-500"
                  />
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
                  <input
                    type="checkbox"
                    id="is_trending"
                    name="is_trending"
                    checked={formik.values.is_trending}
                    onChange={formik.handleChange}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-indigo-500/40 checked:bg-indigo-500"
                  />
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

          <div>
            <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              3. Files & Media Assets
            </h3>

            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-primary ml-1 block">
                      PDF Manuscript (optional upgrade)
                    </label>
                    {existingPdf && (
                      <div className="mb-2 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary truncate max-w-[200px]">
                          Current: {existingPdf.split("/").pop()}
                        </span>
                        <a
                          href={existingPdf}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.6rem] font-black uppercase text-primary hover:underline"
                        >
                          View
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
                        className="w-full bg-background border-2 border-dashed border-border hover:border-primary transition-all rounded-2xl py-4 px-6 cursor-pointer flex items-center justify-between text-text-primary"
                      >
                        <span className="font-bold flex items-center gap-2 truncate pr-4">
                          {pdfFile ? (
                            <span className="text-primary truncate">
                              {pdfFile.name}
                            </span>
                          ) : (
                            <span className="text-text-secondary/50">
                              Replace PDF...
                            </span>
                          )}
                        </span>
                        <Upload
                          size={20}
                          className="text-primary group-hover:animate-bounce shrink-0"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-primary ml-1 block">
                      Thumbnail
                    </label>
                    <div className="border-2 border-dashed border-border rounded-3xl p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[200px] relative group overflow-hidden">
                      {thumbnailPreview ? (
                        <div className="relative aspect-[3/4] h-40 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload size={24} className="text-white" />
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
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload size={32} className="text-primary mb-2" />
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
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-primary ml-1 block">
                    Large Cover Image
                  </label>
                  <div className="border-2 border-dashed border-border rounded-[2.5rem] p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[300px] relative group overflow-hidden">
                    {coverPreview ? (
                      <div className="relative aspect-[3/4] h-64 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={coverPreview}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <ImageIcon size={32} className="text-white" />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                            name="cover_image"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <ImageIcon size={48} className="text-primary/40 mb-4" />
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-text-primary">
                    Gallery & Extra Images
                  </label>
                  <p className="text-[0.6rem] font-bold text-rose-500 uppercase tracking-widest italic">
                    Note: Uploading new images will replace existing gallery
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {/* Show existing gallery first */}
                  {galleryPreviews.length === 0 &&
                    existingGallery.map((img, idx) => (
                      <div
                        key={`exist-${idx}`}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface opacity-70"
                      >
                        <img
                          src={typeof img === "string" ? img : img.url}
                          alt="Existing"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}

                  {/* Show new uploads */}
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-primary group"
                    >
                      <img
                        src={preview}
                        alt="New"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {galleryPreviews.length < 10 && (
                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                      <Plus size={20} className="text-primary/40" />
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
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[0.8rem] font-black italic flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              API ERROR: {error}
            </div>
          )}

          {Object.keys(formik.errors).length > 0 && formik.submitCount > 0 && (
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[0.65rem] font-black text-amber-600 uppercase tracking-widest mb-3">
                Validation Errors Detected
              </p>
              <ul className="m-0 p-0 list-none space-y-1.5">
                {Object.entries(formik.errors).map(([field, msg]) => (
                  <li
                    key={field}
                    className="text-xs font-bold text-text-primary flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                    <span className="capitalize">
                      {field.replace("_", " ")}
                    </span>
                    : <span className="opacity-70">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
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
