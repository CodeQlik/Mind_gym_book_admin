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
  Volume2,
  Loader2,
  Settings,
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
  const { loading } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [existingPdf, setExistingPdf] = useState(null);
  const [existingEpub, setExistingEpub] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState("digital");

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
      audio_chapters: [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      author: Yup.string().required("Author is required"),
      price: Yup.mixed().required("Price is required"),
      category_id: Yup.mixed().required("Category is required"),
      description: Yup.string().required("Description is required"),
      thumbnail: Yup.mixed().required("Thumbnail is required"),
      cover_image: Yup.mixed().required("Cover image is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!bookId) {
        toast.error("Book ID not found.");
        return;
      }
      const data = new FormData();

      // Append general fields
      const skipKeys = ["book_file", "thumbnail", "cover_image", "images", "audio_chapters"];
      Object.entries(values).forEach(([key, val]) => {
        if (skipKeys.includes(key)) return;
        if (val !== null && val !== undefined && val !== "") data.append(key, val);
      });

      // Files
      if (values.book_file instanceof File) data.append("book_file", values.book_file);
      if (values.thumbnail instanceof File) data.append("thumbnail", values.thumbnail);
      if (values.cover_image instanceof File) data.append("cover_image", values.cover_image);
      
      // Gallery images processing
      if (Array.isArray(values.images)) {
        const keeps = values.images.filter(img => !(img instanceof File));
        data.append("images", JSON.stringify(keeps)); // Keeps existing ones
        values.images.forEach(img => {
            if (img instanceof File) data.append("images", img);
        });
      }

      // Audio Chapters
      const audioMetadata = values.audio_chapters.map(ch => ({
          id: ch.id,
          chapter_number: ch.chapter_number,
          chapter_title: ch.chapter_title,
          use_file: !!ch.new_file,
          audio_file: ch.audio_file
      }));
      data.append("audio_chapters", JSON.stringify(audioMetadata));
      
      values.audio_chapters.forEach(ch => {
          if (ch.new_file instanceof File) {
              data.append("audio_files", ch.new_file);
          }
      });

      try {
        const result = await dispatch(updateBookThunk({ id: bookId, formData: data }));
        if (updateBookThunk.fulfilled.match(result)) {
          toast.success("Book updated successfully");
          navigate("/books");
        } else {
          toast.error(result.payload || "Failed to update");
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
        const book = response?.data?.data || response?.data || response;

        if (book && (book.id || book._id)) {
          const id = book.id || book._id;
          setBookId(id);

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
            thumbnail: book.thumbnail?.url || book.thumbnail || null,
            cover_image: book.cover_image?.url || book.cover_image || null,
            images: book.images || [],
            audio_chapters: (book.audiobooks || []).map(ab => ({
                id: ab.id,
                chapter_number: ab.chapter_number,
                chapter_title: ab.chapter_title,
                audio_file: ab.audio_file,
                new_file: null
            })),
          });

          const fd = book.file_data || {};
          setExistingPdf(fd.type === "pdf" ? fd.url : null);
          setExistingEpub(fd.type === "epub" ? fd.url : null);
          setThumbnailPreview(book.thumbnail?.url || book.thumbnail);
          setCoverImagePreview(book.cover_image?.url || book.cover_image);
          setImagesPreview((book.images || []).map(img => img.url || img));
        }
      } catch (err) {
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
      formik.setFieldValue("images", [...formik.values.images, ...fieldFiles]);
      fieldFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagesPreview(prev => [...prev, reader.result]);
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

  const addAudioChapter = () => {
    const nextNum = formik.values.audio_chapters.length + 1;
    formik.setFieldValue("audio_chapters", [
      ...formik.values.audio_chapters,
      { chapter_number: nextNum, chapter_title: `Chapter ${nextNum}`, audio_file: null, new_file: null }
    ]);
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
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/books")} className="mb-2">
            Back to Library
          </Button>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Update Book Details</h1>
          <p className="text-text-secondary text-sm font-medium">Modifying assets for "{formik.values.title}"</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/books")}>Cancel</Button>
          <Button onClick={formik.handleSubmit} loading={loading} icon={Save}>Update Edition</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span> Book Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <FormInput label="Book Title" {...formik.getFieldProps("title")} error={formik.touched.title && formik.errors.title} required />
              <FormInput label="Author Name" {...formik.getFieldProps("author")} error={formik.touched.author && formik.errors.author} required />
              <FormInput label="ISBN" {...formik.getFieldProps("isbn")} />
              <FormInput label="Language" {...formik.getFieldProps("language")} />
            </div>
            <RichTextEditor label="Description" value={formik.values.description} onChange={(val) => formik.setFieldValue("description", val)} error={formik.touched.description && formik.errors.description} required />
            <div className="mt-5">
              <FormInput
                label="Highlights"
                type="textarea"
                {...formik.getFieldProps("highlights")}
                rows={2}
                placeholder="Key takeaways or bullet points..."
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span> Inventory & Pricing
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
              <FormInput label="Price (₹)" type="number" {...formik.getFieldProps("price")} error={formik.touched.price && formik.errors.price} required />
              <FormInput label="MRP (₹)" type="number" {...formik.getFieldProps("original_price")} />
              <FormInput label="Stock" type="number" {...formik.getFieldProps("stock")} />
              <FormInput label="Condition" type="select" {...formik.getFieldProps("condition")}
                options={[
                  { value: "new", label: "New" },
                  { value: "good", label: "Good" },
                  { value: "fair", label: "Fair" },
                  { value: "acceptable", label: "Acceptable" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormInput label="Category" type="select" {...formik.getFieldProps("category_id")} required error={formik.touched.category_id && formik.errors.category_id}
                options={categories.map((c) => ({ value: c.id || c._id, label: c.name }))}
              />
              <FormInput label="Release Date" type="date" {...formik.getFieldProps("published_date")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <Toggle label="Premium" checked={formik.values.is_premium} onChange={() => formik.setFieldValue("is_premium", !formik.values.is_premium)} />
              <Toggle label="Bestselling" checked={formik.values.is_bestselling} onChange={() => formik.setFieldValue("is_bestselling", !formik.values.is_bestselling)} />
              <Toggle label="Trending" checked={formik.values.is_trending} onChange={() => formik.setFieldValue("is_trending", !formik.values.is_trending)} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-[12px] font-black text-text-primary mb-6 uppercase tracking-widest flex items-center gap-2">
               <Settings size={16} className="text-primary" /> Managed Assets
            </h3>
            <div className="flex gap-2 mb-6">
                <button type="button" onClick={() => setActiveTab("digital")}
                  className={`flex-1 text-[11px] font-bold py-2.5 rounded border transition-all shadow-sm ${activeTab === "digital" ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-text-secondary hover:bg-surface"}`}>
                  PDF & EPUB
                </button>
                <button type="button" onClick={() => setActiveTab("audio")}
                  className={`flex-1 text-[11px] font-bold py-2.5 rounded border transition-all shadow-sm ${activeTab === "audio" ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-text-secondary hover:bg-surface"}`}>
                  AUDIO FILE
                </button>
            </div>

            {activeTab === "digital" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${formik.values.book_file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={20} className={formik.values.book_file || existingPdf || existingEpub ? "text-primary" : "text-text-secondary opacity-40"} />
                            <span className="text-[11px] font-bold truncate">
                                {formik.values.book_file ? formik.values.book_file.name : (existingPdf ? "Current: PDF" : (existingEpub ? "Current: EPUB" : "Upload New File"))}
                            </span>
                        </div>
                        <Upload size={16} className="text-text-secondary opacity-40 shrink-0" />
                        <input type="file" name="book_file" accept=".pdf,.epub" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            )}

            {activeTab === "audio" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Chapters List</span>
                        <button type="button" onClick={addAudioChapter} className="text-[10px] font-black px-3 py-1.5 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all flex items-center gap-1">
                            <Plus size={12} /> ADD CHAPTER
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {formik.values.audio_chapters.map((ch, idx) => (
                            <div key={idx} className="p-4 border border-border rounded-xl bg-background/50 space-y-3 relative group">
                                <button type="button" onClick={() => {
                                    const newChapters = [...formik.values.audio_chapters];
                                    newChapters.splice(idx, 1);
                                    formik.setFieldValue("audio_chapters", newChapters);
                                }} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all duration-200 z-10">
                                    <X size={14} />
                                </button>
                                <div className="flex gap-2">
                                    <input type="number" className="w-12 bg-surface border border-border rounded-lg px-2 py-1.5 text-[11px] font-bold h-9 focus:ring-1 focus:ring-primary outline-none" value={ch.chapter_number} onChange={(e) => {
                                        const newChapters = [...formik.values.audio_chapters];
                                        newChapters[idx].chapter_number = e.target.value;
                                        formik.setFieldValue("audio_chapters", newChapters);
                                    }} />
                                    <input type="text" className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-[11px] font-medium h-9 focus:ring-1 focus:ring-primary outline-none" value={ch.chapter_title} onChange={(e) => {
                                        const newChapters = [...formik.values.audio_chapters];
                                        newChapters[idx].chapter_title = e.target.value;
                                        formik.setFieldValue("audio_chapters", newChapters);
                                    }} />
                                </div>
                                <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-border rounded-lg bg-surface hover:border-primary transition-all cursor-pointer overflow-hidden group/label">
                                    <Volume2 size={16} className="absolute left-7 text-primary" />
                                    <span className="text-[11px] text-primary font-bold truncate px-6">
                                        {ch.new_file ? ch.new_file.name : (ch.audio_file ? "Current MP3 (Click to change)" : "Select MP3 File")}
                                    </span>
                                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            const newChapters = [...formik.values.audio_chapters];
                                            newChapters[idx].new_file = e.target.files[0];
                                            formik.setFieldValue("audio_chapters", newChapters);
                                        }
                                    }} />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-[12px] font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
               <ImageIcon size={16} className="text-primary" /> Visual Assets
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-1">
                    Thumbnail <span className="text-error mt-0.5">*</span>
                  </label>
                  <label className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-background group ${formik.touched.thumbnail && formik.errors.thumbnail ? "border-error bg-error/5" : "border-border hover:border-primary"}`}>
                    {thumbnailPreview ? <img src={thumbnailPreview} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={20} className="text-white" /></div>
                    <input type="file" name="thumbnail" className="hidden" onChange={handleFileChange} />
                  </label>
                  {formik.touched.thumbnail && formik.errors.thumbnail && (
                    <p className="text-[10px] text-error font-bold ml-1">{formik.errors.thumbnail}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-1">
                    Cover Image <span className="text-error mt-0.5">*</span>
                  </label>
                  <label className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-background group ${formik.touched.cover_image && formik.errors.cover_image ? "border-error bg-error/5" : "border-border hover:border-primary"}`}>
                    {coverImagePreview ? <img src={coverImagePreview} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={20} className="text-white" /></div>
                    <input type="file" name="cover_image" className="hidden" onChange={handleFileChange} />
                  </label>
                  {formik.touched.cover_image && formik.errors.cover_image && (
                    <p className="text-[10px] text-error font-bold ml-1">{formik.errors.cover_image}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Gallery</label>
                <div className="grid grid-cols-3 gap-2">
                  {imagesPreview.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-background group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white"/></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary bg-background/50 transition-all"><Plus size={20} className="opacity-30" /><input type="file" name="images" multiple className="hidden" onChange={handleFileChange} /></label>
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
