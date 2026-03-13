import React, { useState, useEffect, useRef } from "react";
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
  Volume2,
  Globe,
  Settings,
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
  const { loading } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  
  // Tab control for the Edition Card
  const [activeTab, setActiveTab] = useState("digital"); // 'digital' or 'audio'

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
      language: "Hindi",
      dimensions: "",
      weight: "",
      // Digital
      book_file: null,
      // Media
      thumbnail: null,
      cover_image: null,
      images: [],
      // Audio related
      audio_chapters: [],
      audio_narrator: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      author: Yup.string().required("Author is required"),
      price: Yup.number().min(0).required("Price is required"),
      category_id: Yup.string().required("Category is required"),
      description: Yup.string().required("Description is required"),
      thumbnail: Yup.mixed().required("Thumbnail required"),
      cover_image: Yup.mixed().required("Cover image required"),
    }),
    onSubmit: async (values) => {
      try {
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (key === "images" && Array.isArray(val)) {
            val.forEach((file) => data.append("images", file));
          } else if (key === "audio_chapters" && Array.isArray(val)) {
            if (val.length > 0) {
                const metadata = val.map(ch => ({
                    chapter_number: ch.chapter_number,
                    chapter_title: ch.chapter_title,
                    audio_url: "",
                    use_file: true
                }));
                data.append(key, JSON.stringify(metadata));
                val.forEach(ch => {
                  if (ch.file) {
                    data.append("audio_files", ch.file);
                  }
                });
            }
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

  const addAudioChapter = () => {
    const nextNum = formik.values.audio_chapters.length + 1;
    formik.setFieldValue("audio_chapters", [
      ...formik.values.audio_chapters,
      { 
        chapter_number: nextNum, 
        chapter_title: `Chapter ${nextNum}`, 
        audio_url: "",
        use_file: true,
        file: null
      }
    ]);
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
            Fill in the details and upload your edition.
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
              <FormInput label="ISBN" name="isbn" {...formik.getFieldProps("isbn")} />
              <FormInput label="Language" name="language" {...formik.getFieldProps("language")} />
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
                placeholder="Key takeaways or bullet points..."
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Inventory & Classification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <FormInput label="Price (₹)" name="price" type="number" {...formik.getFieldProps("price")} required />
              <FormInput label="MRP (₹)" name="original_price" type="number" {...formik.getFieldProps("original_price")} />
              <FormInput label="Stock" name="stock" type="number" {...formik.getFieldProps("stock")} />
              <FormInput label="Condition" name="condition" type="select" {...formik.getFieldProps("condition")}
                options={[
                  { value: "new", label: "New" },
                  { value: "good", label: "Good" },
                  { value: "fair", label: "Fair" },
                  { value: "acceptable", label: "Acceptable" },
                ]}
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
              <FormInput label="Release Date" name="published_date" type="date" {...formik.getFieldProps("published_date")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <Toggle label="Premium" checked={formik.values.is_premium} onChange={() => formik.setFieldValue("is_premium", !formik.values.is_premium)} />
              <Toggle label="Bestselling" checked={formik.values.is_bestselling} onChange={() => formik.setFieldValue("is_bestselling", !formik.values.is_bestselling)} />
              <Toggle label="Trending" checked={formik.values.is_trending} onChange={() => formik.setFieldValue("is_trending", !formik.values.is_trending)} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Edition Card with Tabs */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-[12px] font-black text-text-primary mb-6 uppercase tracking-widest flex items-center gap-2">
               <Settings size={16} className="text-primary" /> Digital Manuscript
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

            {/* TAB CONTENT: Digital Manuscript */}
            {activeTab === "digital" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    {/* ONLY FILE UPLOAD - NO URL OPTION */}
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${formik.values.book_file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={20} className={formik.values.book_file ? "text-primary" : "text-text-secondary opacity-40"} />
                            <span className="text-[11px] font-bold truncate">{formik.values.book_file ? formik.values.book_file.name : "Upload PDF/EPUB"}</span>
                        </div>
                        <Upload size={16} className="text-text-secondary opacity-40 shrink-0" />
                        <input type="file" name="book_file" accept=".pdf,.epub" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            )}

            {/* TAB CONTENT: Audiobook Chapters */}
            {activeTab === "audio" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Chapters List</span>
                        <button type="button" onClick={addAudioChapter}
                            className="text-[10px] font-black px-3 py-1.5 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all flex items-center gap-1">
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
                                    <input type="text" className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-[11px] font-medium h-9 focus:ring-1 focus:ring-primary outline-none" placeholder="Chapter Title" value={ch.chapter_title} onChange={(e) => {
                                        const newChapters = [...formik.values.audio_chapters];
                                        newChapters[idx].chapter_title = e.target.value;
                                        formik.setFieldValue("audio_chapters", newChapters);
                                    }} />
                                </div>
                                
                                <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-border rounded-lg bg-surface hover:border-primary transition-all cursor-pointer overflow-hidden group/label">
                                    <Volume2 size={16} className="absolute left-7 text-text-secondary opacity-30 group-hover/label:text-primary group-hover/label:opacity-100" />
                                    <span className="text-[11px] text-primary font-bold truncate px-6">
                                        {ch.file ? ch.file.name : "Select MP3 File"}
                                    </span>
                                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            const newChapters = [...formik.values.audio_chapters];
                                            newChapters[idx].file = e.target.files[0];
                                            formik.setFieldValue("audio_chapters", newChapters);
                                        }
                                    }} />
                                </label>
                            </div>
                        ))}
                        {formik.values.audio_chapters.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <Volume2 size={40} className="mb-2" />
                                <p className="text-[11px] font-bold">No chapters added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Visual Branding */}
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
                    {thumbnailPreview ? <img src={thumbnailPreview} className="w-full h-full object-cover" alt="thumbnail" /> : <ImageIcon size={24} className="opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                    <input type="file" name="thumbnail" accept="image/*" className="hidden" onChange={handleFileChange} />
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
                    {coverImagePreview ? <img src={coverImagePreview} className="w-full h-full object-cover" alt="cover" /> : <ImageIcon size={24} className="opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                    <input type="file" name="cover_image" accept="image/*" className="hidden" onChange={handleFileChange} />
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
                    <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" alt="Gallery" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white"/></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary bg-background/50 hover:bg-primary/5 transition-all">
                    <Plus size={20} className="opacity-30" />
                    <input type="file" name="images" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
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
