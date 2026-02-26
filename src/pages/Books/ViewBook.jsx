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
  TrendingUp,
  Award,
  ListChecks,
  Image as ImageIcon,
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
  const coverUrl = formatUrl(parseField(book.cover_image));
  const pdfData = parseField(book.pdf_file);
  let pdfUrl = formatUrl(pdfData);

  if (pdfData && (book.id || book._id)) {
    // Pass relative URL so that the API instance in PdfViewerModal
    // can handle the baseURL and auth tokens correctly.
    pdfUrl = bookApi.getReadBookUrl(book.id || book._id);
  }

  const gallery = Array.isArray(book.images) ? book.images : [];

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
            <h1 className="text-3xl font-black text-text-primary italic tracking-tight">
              Book Archive
            </h1>
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
        {/* Main Hero Card */}
        <div className="bg-surface border border-border p-8 sm:p-12 rounded-[2.5rem] shadow-sm overflow-hidden relative">
          {coverUrl && (
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none translate-x-1/4">
              <img
                src={coverUrl}
                className="w-full h-full object-cover grayscale"
                alt="decoration"
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
            <div className="relative group shrink-0">
              <div className="relative w-[280px] aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-50 border border-border shadow-2xl">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <BookIcon size={120} strokeWidth={1} />
                  </div>
                )}
                {book.is_premium && (
                  <div className="absolute top-5 right-5 bg-amber-500 text-white px-3.5 py-2 rounded-xl font-black text-[0.65rem] shadow-xl flex items-center gap-2 tracking-widest uppercase border border-white/20">
                    <ShieldCheck size={14} /> PREMIUM
                  </div>
                )}
              </div>
            </div>

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
                    <p className="text-xl font-bold text-text-secondary flex items-center gap-3">
                      <User size={22} className="text-primary/30" />{" "}
                      {book.author}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10">
                  <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                    Record ID
                  </label>
                  <div className="font-mono text-lg font-bold text-primary">
                    #{book.id || book._id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-border">
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                    ISBN
                  </label>
                  <p className="text-base font-bold text-text-primary">
                    {book.isbn || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                    Language
                  </label>
                  <p className="text-base font-bold text-text-primary">
                    {book.language || "English"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest">
                    Cataloged
                  </label>
                  <p className="text-base font-bold text-text-primary">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <label className="text-[0.7rem] font-black text-text-secondary uppercase tracking-[0.25em] flex items-center gap-3">
                  <Quote size={18} className="text-primary" /> Narrative /
                  Summary
                </label>
                <div className="bg-background/50 p-8 rounded-[2.5rem] border border-dashed border-border">
                  <p className="text-text-primary font-medium leading-[1.8] italic text-lg">
                    {book.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights & Additional Info Case */}
        {(book.highlights || book.otherdescription) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {book.highlights && (
              <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
                <h4 className="text-[0.75rem] font-black text-primary mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                  <ListChecks size={20} /> Key Highlights
                </h4>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-text-primary font-medium leading-relaxed whitespace-pre-line">
                    {book.highlights}
                  </p>
                </div>
              </div>
            )}
            {book.otherdescription && (
              <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
                <h4 className="text-[0.75rem] font-black text-primary mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                  <Info size={20} /> Additional Notes
                </h4>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-text-primary font-medium leading-relaxed whitespace-pre-line">
                    {book.otherdescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Commercial & Classification Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
            <h3 className="text-[0.75rem] font-black text-primary mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
              <DollarSign size={20} /> Commercial Specs
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                <label className="text-[0.6rem] font-black text-emerald-600 uppercase tracking-widest block mb-1">
                  Price
                </label>
                <span className="text-2xl font-black text-emerald-600 italic">
                  ₹{book.price}
                </span>
              </div>
              <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                <label className="text-[0.6rem] font-black text-indigo-600 uppercase tracking-widest block mb-1">
                  Stock
                </label>
                <span className="text-2xl font-black text-indigo-600">
                  {book.stock} Units
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
            <h3 className="text-[0.75rem] font-black text-primary mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
              <Tag size={20} /> Classification
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <label className="text-[0.6rem] font-black text-primary uppercase tracking-widest block mb-1">
                  Genre
                </label>
                <span className="text-sm font-black text-text-primary">
                  {book.category?.name || "Unclassified"}
                </span>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <label className="text-[0.6rem] font-black text-primary uppercase tracking-widest block mb-1">
                  Release
                </label>
                <span className="text-sm font-black text-text-primary">
                  {book.published_date
                    ? new Date(book.published_date).getFullYear()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Manuscript Asset */}
        <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-xl">
              <FileText size={32} className="text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-text-primary italic">
                Digital Manuscript
              </h4>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {pdfUrl ? "SECURE ARTIFACT READY" : "NO DIGITAL COPY CATALOGED"}
              </p>
            </div>
          </div>
          {pdfUrl && (
            <Button
              size="lg"
              icon={ExternalLink}
              onClick={() => setShowPdf(true)}
            >
              Read Now
            </Button>
          )}
        </div>

        {/* Image Gallery */}
        {gallery.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-[0.75rem] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 ml-4">
              <ImageIcon size={20} /> Media Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {gallery.map((img, idx) => {
                const url = formatUrl(parseField(img));
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
