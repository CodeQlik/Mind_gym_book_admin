import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Book as BookIcon,
  User,
  Tag,
  Calendar,
  DollarSign,
  Package,
  FileText,
  ShieldCheck,
  Clock,
  ExternalLink,
  Loader2,
  XCircle,
  Hash,
  Globe,
  Quote,
  Info,
} from "lucide-react";
import { bookApi } from "../../api/bookApi";
import API from "../../api/axiosInstance";
import PdfViewerModal from "../../components/Modal/PdfViewerModal";
import Button from "../../components/UI/Button";

const ViewBook = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await bookApi.getBookBySlug(slug);
        const data =
          response.data || (response.success !== false ? response : null);
        if (data) {
          setBook(data);
        }
      } catch (err) {
        console.error("Failed to fetch book details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in font-['Outfit']">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium tracking-tight">
          Loading book details...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in font-['Outfit']">
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <XCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">
          Book Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md font-medium">
          The requested book could not be located in the digital library
          records.
        </p>
        <Button onClick={() => navigate("/books")} icon={ArrowLeft} size="lg">
          Return to Library
        </Button>
      </div>
    );
  }

  const baseUrl = API.defaults.baseURL.split("/api/v1")[0];

  const formatUrl = (url) => {
    if (!url) return null;
    if (typeof url !== "string") return null;
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const parseField = (field) => {
    if (!field) return null;
    const data =
      typeof field === "string" && field.startsWith("{")
        ? JSON.parse(field)
        : field;
    return data?.url || (typeof field === "string" ? field : null);
  };

  const imageUrl = formatUrl(parseField(book.thumbnail));
  let pdfUrl = formatUrl(parseField(book.pdf_file));

  // Prioritize the secure readBook API if book has an ID and a PDF file artifact
  if (book.pdf_file && (book.id || book._id)) {
    pdfUrl = `${API.defaults.baseURL}${bookApi.getReadBookUrl(book.id || book._id)}`;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in font-['Outfit']">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/books")}
        >
          Back to Library
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-text-primary italic tracking-tight">
                Book Archive
              </h1>
              <div
                className={`px-4 py-1.5 rounded-full text-[0.65rem] font-black tracking-widest uppercase border transition-all duration-300 ${
                  book.is_active
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                }`}
              >
                {book.is_active ? "● ACTIVE" : "● INACTIVE"}
              </div>
            </div>
            <p className="text-text-secondary font-medium tracking-tight">
              Consulting library records for{" "}
              <span className="text-primary font-bold">"{book.title}"</span>
            </p>
          </div>
          <Button
            icon={Pencil}
            size="md"
            onClick={() =>
              navigate(`/books/edit/${book.slug || book.id || book._id}`)
            }
          >
            Edit Edition
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Main Hero Card: Image + Details + Integrated Metadata */}
        <div className="bg-surface border border-border p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Image Column */}
            <div className="relative group shrink-0">
              <div className="relative w-[280px] aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-500 group-hover:shadow-primary/10">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-800">
                    <BookIcon size={120} strokeWidth={1} />
                  </div>
                )}
                {book.is_premium && (
                  <div className="absolute top-5 right-5 bg-amber-400 dark:bg-amber-500 text-white px-3.5 py-2 rounded-xl font-black text-[0.7rem] shadow-xl flex items-center gap-2 tracking-widest uppercase border border-white/20">
                    <ShieldCheck size={16} /> PREMIUM
                  </div>
                )}
              </div>
            </div>

            {/* Info Area (Right of Image) */}
            <div className="flex-1 space-y-10 py-4 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4">
                  <h3 className="text-[0.7rem] font-black text-primary flex items-center gap-3 uppercase tracking-[0.2em]">
                    <BookIcon size={16} /> Bibliographic Record
                  </h3>
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-text-primary italic leading-[1.1] tracking-tight">
                      {book.title}
                    </h2>
                    <p className="text-xl font-bold text-text-secondary flex items-center gap-2">
                      <User size={20} className="text-primary/40" />{" "}
                      {book.author}
                    </p>
                  </div>
                </div>

                {/* Record ID Shifted to Top Right Area (Marked in image) */}
                <div className="flex flex-col gap-2 min-w-[180px] w-full md:w-auto">
                  <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest text-right">
                    Record ID
                  </label>
                  <div className="font-mono text-base font-bold text-primary bg-primary/5 px-5 py-3 rounded-2xl border border-primary/10 text-right">
                    #{book.id || book._id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:col-span-2">
                  <div className="bg-background p-6 rounded-2xl border border-border flex flex-col gap-1.5 transition-all hover:border-primary/20">
                    <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest">
                      ISBN Record
                    </label>
                    <div className="text-base font-bold text-text-primary">
                      {book.isbn || "Not Cataloged"}
                    </div>
                  </div>
                  <div className="bg-background p-6 rounded-2xl border border-border flex flex-col gap-1.5 transition-all hover:border-primary/20">
                    <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest">
                      Edition Language
                    </label>
                    <div className="text-base font-bold text-text-primary">
                      {book.language || "English / Global"}
                    </div>
                  </div>

                  {/* System Logs Shifted Below Info Cards (Marked in image) */}
                  <div className="bg-background p-6 rounded-2xl border border-border flex justify-between items-center px-8">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-text-secondary" />
                      <span className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest">
                        Cataloged
                      </span>
                    </div>
                    <span className="text-sm font-black text-text-primary">
                      {new Date(book.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="bg-background p-6 rounded-2xl border border-border flex justify-between items-center px-8">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-text-secondary" />
                      <span className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest">
                        Last Update
                      </span>
                    </div>
                    <span className="text-sm font-black text-text-primary">
                      {new Date(book.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Narrative / Summary */}
              <div className="pt-8 space-y-4">
                <label className="text-[0.7rem] font-black text-text-secondary uppercase tracking-[0.25em] flex items-center gap-3">
                  <Quote size={18} className="text-primary" /> Narrative /
                  Summary
                </label>
                <div className="bg-background p-8 rounded-[2rem] border border-dashed border-border">
                  <p className="text-text-primary font-medium leading-[1.8] italic text-lg max-w-4xl">
                    {book.description ||
                      "The central library records do not contain a detailed synopsis for this specific digital edition."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Specification Card */}
        <div className="bg-surface border border-border p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[0.75rem] font-black text-primary mb-10 flex items-center gap-4 uppercase tracking-[0.25em]">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Commercial Specification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-[2rem] border border-border space-y-1">
              <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                Regular Price
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  &#8377;{book.price}
                </span>
                {book.original_price && (
                  <span className="text-sm font-bold text-emerald-300 dark:text-emerald-700 line-through">
                    &#8377;{book.original_price}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-background p-8 rounded-[2rem] border border-border space-y-1">
              <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                Available Stock
              </label>
              <div className="flex items-center gap-3">
                <Package size={24} className="text-indigo-500" />
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {book.stock || 0}
                </span>
              </div>
            </div>

            <div className="bg-background p-8 rounded-[2rem] border border-border space-y-1">
              <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                Condition
              </label>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/20" />
                <span className="text-xl font-black text-text-primary capitalize">
                  {book.condition || "Pristine"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Classification & Assets Card */}
        <div className="bg-surface border border-border p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[0.75rem] font-black text-primary mb-10 flex items-center gap-4 uppercase tracking-[0.25em]">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Classification & Assets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.2em]">
                Primary Genre
              </label>
              <div className="flex items-center gap-3 bg-background px-5 py-3.5 rounded-2xl border border-border">
                <Tag size={18} className="text-primary" />
                <span className="text-sm font-bold text-text-primary">
                  {book.category?.name || "Unclassified"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.2em]">
                Release Era
              </label>
              <div className="flex items-center gap-3 bg-background px-5 py-3.5 rounded-2xl border border-border">
                <Calendar size={18} className="text-primary" />
                <span className="text-sm font-bold text-text-primary">
                  {book.published_date
                    ? new Date(book.published_date).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" },
                      )
                    : "Archival Record"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-primary/5 dark:bg-primary/10 p-10 rounded-[2.5rem] border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-8 group">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
                <FileText size={40} className="text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-text-primary">
                  Digital Manuscript
                </h4>
                <p className="text-sm font-bold text-text-secondary leading-relaxed max-w-[240px]">
                  {book.pdf_file
                    ? "High-resolution PDF artifact ready for secure review."
                    : "No digital copy cataloged."}
                </p>
              </div>
            </div>

            {pdfUrl && (
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  icon={ExternalLink}
                  onClick={() => setShowPdf(true)}
                >
                  View File
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PdfViewerModal
        isOpen={showPdf}
        onClose={() => setShowPdf(false)}
        pdfUrl={pdfUrl}
        title={book.title}
      />
    </div>
  );
};

export default ViewBook;
