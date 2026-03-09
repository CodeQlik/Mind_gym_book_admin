import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Book as BookIcon,
  User,
  Tag,
  FileText,
  ShieldCheck,
  ExternalLink,
  Loader2,
  XCircle,
  Hash,
  Globe,
  Quote,
  Info,
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
        if (data) setBook(data);
      } catch (err) {
        console.error("Failed to fetch book details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-error-surface text-error rounded-full flex items-center justify-center mb-6">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Book Not Found
        </h2>
        <Button onClick={() => navigate("/books")} variant="secondary">
          Return to Library
        </Button>
      </div>
    );
  }

  const baseUrl = API.defaults.baseURL.split("/api/v1")[0];
  const formatUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const parseField = (f) => {
    if (!f) return null;
    const data = typeof f === "string" && f.startsWith("{") ? JSON.parse(f) : f;
    return data?.url || (typeof f === "string" ? f : null);
  };

  // New flat file_data structure: { url, type: 'pdf'|'epub', public_id, local_path }
  const fileData = book.file_data || null;
  const hasPdf =
    (fileData?.type === "pdf" && fileData?.url) || book.pdf_file?.url;
  const hasEpub =
    (fileData?.type === "epub" && fileData?.url) || book.epub_file?.url;
  const pdfFileUrl = hasPdf
    ? fileData?.type === "pdf"
      ? fileData.url
      : book.pdf_file?.url
    : null;
  const epubFileUrl = hasEpub
    ? fileData?.type === "epub"
      ? fileData.url
      : book.epub_file?.url
    : null;

  const imageUrl = formatUrl(parseField(book.thumbnail));
  // Use actual PDF URL from file_data or backend read endpoint
  // prioritize book.read_url as it uses the secure backend proxy
  const pdfUrl =
    book.read_url || pdfFileUrl || bookApi.getReadBookUrl(book.id || book._id);
  const epubDownloadUrl = book.read_url || epubFileUrl;
  const gallery = Array.isArray(book.images) ? book.images : [];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in text-left font-['Outfit']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/books")}
            className="mb-1"
          >
            Back to Library
          </Button>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Book Details
          </h1>
        </div>
        <Button
          icon={Pencil}
          size="sm"
          onClick={() =>
            navigate(`/books/edit/${book.slug || book.id || book._id}`)
          }
        >
          Edit Edition
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-[180px] aspect-[3/4] rounded-lg overflow-hidden bg-background border border-border shadow-sm transition-transform hover:scale-[1.02]">
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                  <BookIcon size={64} />
                </div>
              )}
            </div>
            {book.is_premium && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shadow-md uppercase tracking-wider">
                <ShieldCheck size={10} /> Premium
              </div>
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {book.is_bestselling && (
                <div className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-md uppercase tracking-wider">
                  Bestseller
                </div>
              )}
              {book.is_trending && (
                <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-md uppercase tracking-wider">
                  Trending
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
                  Bibliographic Record
                </span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
                {book.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <p className="font-medium flex items-center gap-1.5">
                  <User size={14} className="opacity-60" /> {book.author}
                </p>
                <p className="font-medium flex items-center gap-1.5">
                  <Tag size={14} className="opacity-60" />{" "}
                  {book.category?.name || "General"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-border">
              {[
                { label: "ISBN", val: book.isbn || "N/A" },
                { label: "Language", val: book.language || "English" },
                { label: "Price", val: `₹${book.price}` },
                {
                  label: "MRP",
                  val: book.original_price ? `₹${book.original_price}` : "N/A",
                },
                { label: "Weight", val: book.weight || "N/A" },
                { label: "Dimensions", val: book.dimensions || "N/A" },
                { label: "Condition", val: book.condition || "N/A" },
                { label: "Stock", val: book.stock || "0" },
                { label: "Release", val: book.published_date || "N/A" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-0.5 opacity-60">
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FileText size={12} className="text-primary" /> Summary
                  </h4>
                  <div
                    className="text-sm text-text-primary leading-relaxed bg-background/50 p-4 rounded-lg border border-border prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: book.description || "No description provided.",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {book.highlights && (
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <ListChecks size={14} /> Key Highlights
            </h4>
            <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
              {book.highlights}
            </div>
          </div>
        )}

        {/* PDF Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-primary/10">
              <FileText size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                PDF Artifact
              </h4>
              <p className="text-[9px] font-bold text-text-secondary uppercase opacity-60">
                {hasPdf ? "Digital Manuscript" : "No PDF Available"}
              </p>
            </div>
          </div>
          <Button
            icon={ExternalLink}
            size="sm"
            fullWidth
            onClick={() => setShowPdf(true)}
            disabled={!hasPdf}
          >
            Read Manuscript
          </Button>
        </div>

        {/* EPUB Section */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-amber-500/10">
              <BookIcon size={20} className="text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                EPUB Edition
              </h4>
              <p className="text-[9px] font-bold text-text-secondary uppercase opacity-60">
                {hasEpub ? "E-Book Format" : "No EPUB Available"}
              </p>
            </div>
          </div>
          {hasEpub ? (
            <a
              href={epubDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                icon={ExternalLink}
                size="sm"
                fullWidth
                variant="secondary"
                className="!bg-amber-500 !text-white hover:!bg-amber-600 border-none"
              >
                Download EPUB
              </Button>
            </a>
          ) : (
            <Button
              icon={ExternalLink}
              size="sm"
              fullWidth
              variant="secondary"
              disabled
            >
              Not Available
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {book.cover_image && (
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" /> Primary Cover
              Asset
            </h4>
            <div className="aspect-[3/4] max-w-[200px] rounded-lg overflow-hidden border border-primary/20 bg-background group cursor-pointer relative mx-auto md:mx-0">
              <img
                src={formatUrl(parseField(book.cover_image))}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt="Cover"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink size={16} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {gallery && gallery.length > 0 && (
          <div
            className={`bg-surface border border-border rounded-xl p-6 shadow-sm ${!book.cover_image ? "md:col-span-2" : ""}`}
          >
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" /> Gallery
              Collection
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border bg-background group cursor-pointer relative">
                    <img
                      src={formatUrl(parseField(img))}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={`Gallery ${idx}`}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
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
