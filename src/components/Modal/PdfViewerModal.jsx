import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import API from "../../api/axiosInstance";

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title }) => {
  const [loadError, setLoadError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchPdf = async () => {
      const isStream = pdfUrl && pdfUrl.includes("/book/readBook/");

      if (!isStream) {
        setBlobUrl(pdfUrl);
        setIsChecking(false);
        return;
      }

      setLoadError(false);
      setIsChecking(true);

      try {
        const response = await API.get(pdfUrl, {
          responseType: "blob",
        });

        if (active) {
          const newBlobUrl = URL.createObjectURL(response.data);
          setBlobUrl(newBlobUrl);
          setIsChecking(false);
        }
      } catch (error) {
        if (active) {
          console.error("PDF Fetch Error:", error);
          setLoadError(true);
          setIsChecking(false);
        }
      }
    };

    if (isOpen && pdfUrl) {
      document.body.style.overflow = "hidden";
      fetchPdf();
    } else {
      document.body.style.overflow = "unset";
      setBlobUrl(null);
    }

    return () => {
      active = false;
      document.body.style.overflow = "unset";
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, pdfUrl]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[99999] bg-slate-950/40 backdrop-blur-2xl saturate-150 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-[95%] max-w-[1400px] h-[92vh] bg-surface rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-500 cubic-bezier-[0.16,1,0.3,1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Glass Header */}
        <div className="h-20 px-10 bg-surface/80 backdrop-blur-md border-b border-border flex justify-between items-center z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="m-0 text-[1.15rem] font-black text-text-primary tracking-tight font-['Outfit']">
                  Manuscript Archive
                </h3>
                <span className="bg-emerald-500/10 text-emerald-500 text-[0.7rem] px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                  SECURE
                </span>
              </div>
              <p className="m-0 text-xs text-text-secondary font-bold">
                Reading: {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={blobUrl || pdfUrl}
              download={title ? `${title}.pdf` : "document.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-black text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5"
            >
              <Download size={18} /> Download
            </a>

            <div className="w-px h-8 bg-border" />

            <button
              onClick={onClose}
              className="bg-background text-text-secondary w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer / Fallback Area */}
        <div className="flex-1 relative bg-background w-full">
          {isChecking ? (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-text-secondary font-bold text-sm tracking-tight">
                Loading manuscript safely...
              </p>
            </div>
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-rose-500/[0.02]">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/5 flex items-center justify-center mb-6 border border-rose-500/10">
                <AlertTriangle size={40} className="text-rose-500" />
              </div>
              <h4 className="m-0 text-2xl font-black text-text-primary font-['Outfit'] italic">
                Access Restricted
              </h4>
              <p className="my-6 text-text-secondary max-w-[500px] leading-relaxed font-bold text-sm">
                Unable to load the secure manuscript. Please check your
                permissions or try again.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsChecking(true)} // Trigger re-check/fetch
                  className="px-6 py-3.5 rounded-2xl bg-surface border border-border text-text-secondary font-black hover:bg-background transition-all border-none cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Retry
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={blobUrl}
              className="w-full h-full border-none"
              title="PDF Viewer"
            />
          )}

          {/* Context Info Overlay */}
          {!loadError && !isChecking && (
            <div className="absolute bottom-5 right-8 bg-slate-900/90 text-white px-5 py-2.5 rounded-full text-[0.8rem] font-black backdrop-blur-md flex items-center gap-2.5 pointer-events-none z-100 italic">
              <ShieldCheck size={14} className="text-emerald-500" /> System
              Archive Link
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PdfViewerModal;
