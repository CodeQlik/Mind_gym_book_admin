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
  ImageIcon,
  Volume2,
  Calendar,
  Layers,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { bookApi } from "../../api/bookApi";
import API from "../../api/axiosInstance";
import PdfViewerModal from "../../components/Modal/PdfViewerModal";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

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
        const data = response.data?.data || response.data || response;
        if (data) setBook(data);
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to load book specifications.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-primary opacity-20" />
        <p className="mt-4 text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Retaining book records...</p>
      </div>
    );

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-error-surface text-error rounded-full flex items-center justify-center mb-6">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Book Not Found</h2>
        <Button onClick={() => navigate("/books")} variant="secondary">Return to Library</Button>
      </div>
    );
  }

  const baseUrl = (API.defaults.baseURL || "http://localhost:5000/api/v1").replace(/\/api\/v1$/, "");
  
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

  // Logic to handle nested or flat file_data
  const fd = book.file_data || {};
  const pdfInfo = fd.pdf || (fd.type === "pdf" ? fd : null);
  const epubInfo = fd.epub || (fd.type === "epub" ? fd : null);

  const hasPdf = !!pdfInfo?.url;
  const hasEpub = !!epubInfo?.url;
  
  const pdfUrl = hasPdf ? bookApi.getReadBookUrl(book.id || book._id) : null;
  const epubDownloadUrl = hasEpub ? bookApi.getReadBookUrl(book.id || book._id) : null;

  const imageUrl = formatUrl(parseField(book.thumbnail));
  const coverUrl = formatUrl(parseField(book.cover_image));
  const gallery = Array.isArray(book.images) ? book.images : [];
  const audioChapters = Array.isArray(book.audiobooks) ? book.audiobooks : 
                        (book.audio_book?.chapters || []);

  const handleDownloadEpub = async () => {
    try {
      const toastId = toast.loading("Downloading Secure EPUB...");
      const response = await API.get(epubDownloadUrl, { responseType: "blob" });
      const blobURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement("a");
      fileLink.href = blobURL;
      fileLink.setAttribute("download", `${book.title}_Secure.epub`);
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
      window.URL.revokeObjectURL(blobURL);
      toast.success("EPUB downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Format conversion/download failed.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 animate-fade-in text-left font-['Outfit'] max-w-[1400px] mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/books")} className="mb-2 hover:bg-primary/5">
            Back to Library
          </Button>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-text-primary tracking-tight">Technical Specifications</h1>
             <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <p className="text-text-secondary text-xs font-semibold opacity-60">Master Record ID: {book.id || book._id}</p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" icon={ShoppingBag} size="sm">View on Store</Button>
            <Button icon={Pencil} size="sm" onClick={() => navigate(`/books/edit/${book.slug || book.id || book._id}`)}>Edit Edition</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Visual & Stats */}
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm overflow-hidden relative group">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="relative z-10 space-y-6">
                    <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-500 group-hover:scale-[1.03]">
                        {imageUrl ? (
                            <img src={imageUrl} className="w-full h-full object-cover" alt="thumbnail" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-background text-text-secondary/10">
                                <BookIcon size={80} strokeWidth={1} />
                            </div>
                        )}
                        {/* Status Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {book.is_bestselling && <span className="px-2 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter rounded shadow-lg">Bestseller</span>}
                            {book.is_trending && <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-tighter rounded shadow-lg">Trending</span>}
                        </div>
                        {book.is_premium && <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase shadow-lg flex items-center gap-1"><ShieldCheck size={10} /> Premium</div>}
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Pricing (Market)</p>
                                <p className="text-xl font-black text-text-primary tracking-tighter">₹{book.price}</p>
                                {book.original_price && <p className="text-xs text-text-secondary line-through opacity-50">₹{book.original_price}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Stock Status</p>
                                <div className="flex items-center justify-end gap-2">
                                    <span className={`h-2 w-2 rounded-full ${book.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                    <p className="text-lg font-black text-text-primary">{book.stock || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metadata */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info size={14} className="text-primary" /> Bibliographic Info
                </h4>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { label: "ISBN-13", val: book.isbn || "978-XXXXXXXXXX", icon: Hash },
                        { label: "Edition Lang", val: book.language || "English", icon: Globe },
                        { label: "Category", val: book.category?.name || "General Arch", icon: Tag },
                        { label: "Release Date", val: book.published_date || "N/A", icon: Calendar },
                        { label: "Print Condition", val: book.condition?.toUpperCase() || "NEW", icon: Zap },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                            <div className="flex items-center gap-2">
                                <item.icon size={12} className="text-text-secondary opacity-40" />
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{item.label}</span>
                            </div>
                            <span className="text-[11px] font-black text-text-primary">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Content Details */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm space-y-8">
                <div>
                   <h2 className="text-3xl font-black text-text-primary tracking-tighter mb-2">{book.title}</h2>
                   <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/20">{book.category?.name || "Category"}</div>
                       <p className="text-sm font-bold text-text-secondary flex items-center gap-2 tracking-tight">
                           <User size={16} className="text-primary" /> Authority: {book.author}
                       </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Quote size={14} className="text-primary" /> Summary Text
                        </h4>
                        <div 
                            className="text-sm text-text-secondary leading-relaxed bg-background/30 p-5 rounded-xl border border-border/50 min-h-[160px]"
                            dangerouslySetInnerHTML={{ __html: book.description || "No extensive description data available for this edition." }}
                        />
                    </div>
                    {book.highlights && (
                    <div className="space-y-4">
                         <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <ListChecks size={14} className="text-primary" /> Key Performance Indicators
                        </h4>
                        <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed italic border-l-4 border-primary/40 pl-6 py-1 bg-primary/5 rounded-r-xl min-h-[160px] flex items-center">
                            {book.highlights}
                        </div>
                    </div>
                    )}
                </div>

                {/* Artifacts Access Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-2xl border-2 transition-all ${hasPdf ? 'border-primary/20 bg-primary/5 group cursor-pointer hover:bg-primary/10' : 'border-border bg-background opacity-50grayscale'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${hasPdf ? 'bg-primary text-white' : 'bg-border text-text-secondary'}`}>
                                <FileText size={20} />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${hasPdf ? 'text-primary' : 'text-text-secondary'}`}>
                                {hasPdf ? 'Online' : 'Unavailable'}
                            </span>
                        </div>
                        <h5 className="text-sm font-black text-text-primary mb-1">PDF MANUSCRIPT</h5>
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-4">Full Digital Text Access</p>
                        <Button 
                            fullWidth 
                            size="sm" 
                            disabled={!hasPdf} 
                            onClick={() => setShowPdf(true)}
                            variant={hasPdf ? 'primary' : 'secondary'}
                        >
                            {hasPdf ? 'Open Viewer' : 'No Data'}
                        </Button>
                    </div>

                    <div className={`p-6 rounded-2xl border-2 transition-all ${hasEpub ? 'border-amber-500/20 bg-amber-500/5 group cursor-pointer hover:bg-amber-500/10' : 'border-border bg-background opacity-50 grayscale'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${hasEpub ? 'bg-amber-500 text-white' : 'bg-border text-text-secondary'}`}>
                                <Layers size={20} />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${hasEpub ? 'text-amber-600' : 'text-text-secondary'}`}>
                                {hasEpub ? 'Online' : 'Unavailable'}
                            </span>
                        </div>
                        <h5 className="text-sm font-black text-text-primary mb-1">EPUB EDITION</h5>
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-4">E-Reader Compatible File</p>
                        <Button 
                            fullWidth 
                            size="sm" 
                            disabled={!hasEpub} 
                            onClick={handleDownloadEpub}
                            variant={hasEpub ? 'primary' : 'secondary'}
                            className={hasEpub ? '!bg-amber-500 hover:!bg-amber-600 border-none text-white' : ''}
                        >
                            {hasEpub ? 'Download Source' : 'No Data'}
                        </Button>
                    </div>
                </div>

                {/* Audio Chapters Section (NEW) */}
                {audioChapters.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Volume2 size={16} className="text-primary" /> Audio Edition Content
                        </h4>
                        <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                            {audioChapters.length} Chapters Identified
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {audioChapters.map((ch, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background/40 hover:border-primary/40 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    {ch.chapter_number || idx + 1}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-black text-text-primary truncate uppercase tracking-tight">
                                        {ch.chapter_title || ch.title || `Chapter ${ch.chapter_number}`}
                                    </p>
                                    <p className="text-[9px] font-bold text-text-secondary opacity-50">Narrated Audio Track</p>
                                </div>
                                <Volume2 size={16} className="text-text-secondary group-hover:text-primary transition-colors cursor-pointer" />
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>

            {/* Visual Assets Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coverUrl && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.15em] flex items-center gap-2">
                        <ImageIcon size={14} className="text-primary" /> Marketing Cover
                    </h4>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border bg-background group cursor-pointer relative">
                        <img src={coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="cover" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                             <ExternalLink size={24} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                </div>
                )}
                
                {gallery.length > 0 && (
                <div className={`bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 ${!coverUrl ? 'md:col-span-2' : ''}`}>
                    <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.15em] flex items-center gap-2">
                        <Layers size={14} className="text-primary" /> Gallery Archive {gallery.length > 1 && `(${gallery.length})`}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {gallery.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border bg-background group hover:border-primary transition-all cursor-pointer shadow-sm">
                                <img src={formatUrl(parseField(img))} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`gallery-${idx}`} />
                            </div>
                        ))}
                    </div>
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
