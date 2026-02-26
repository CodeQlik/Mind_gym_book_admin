import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Lock,
  ArrowRight,
  Info,
  Eye,
} from "lucide-react";
import API from "../../api/axiosInstance";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title }) => {
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);
  const [metadata, setMetadata] = useState({
    isPreview: false,
    showPaywall: false,
    message: "",
  });
  const blobRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fetchPdfData = async () => {
      setLoadError(false);
      setErrorMessage("");
      setIsChecking(true);

      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
        setBlobUrl(null);
      }

      try {
        // Step 1: Fetch Metadata from backend
        // (Includes isPreview and the secure signed pdf_url)
        const metaResponse = await API.get(pdfUrl);

        if (!active) return;

        const { isPreview, pdf_url, success } = metaResponse.data;

        if (!success || !pdf_url) {
          throw new Error(
            metaResponse.data.message || "Archive integrity check failed.",
          );
        }

        // Calculate metadata for UI based on isPreview
        setMetadata({
          isPreview: isPreview,
          showPaywall: isPreview,
          message: isPreview
            ? "Enjoy a 5-page preview! Subscribe for full access."
            : "Full secure access granted to this manuscript.",
        });

        setBlobUrl(pdf_url);
      } catch (error) {
        if (active) {
          console.error("PDF Access Error:", error);
          setLoadError(true);
          if (error.response?.status === 401) {
            setErrorMessage(
              "Session expired. Please re-authenticate to view the manuscripts.",
            );
          } else {
            setErrorMessage(
              error.message || "The secure archive could not be established.",
            );
          }
        }
      } finally {
        if (active) setIsChecking(false);
      }
    };

    if (isOpen && pdfUrl) {
      document.body.style.overflow = "hidden";
      fetchPdfData();
    } else {
      document.body.style.overflow = "unset";
      setBlobUrl(null);
    }

    return () => {
      active = false;
      document.body.style.overflow = "unset";
    };
  }, [isOpen, pdfUrl]);

  useEffect(() => {
    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[99999] bg-slate-950/60 backdrop-blur-3xl saturate-150 animate-fade-in"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative w-[95%] max-w-[1400px] h-[92vh] bg-surface rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] border border-white/10 animate-in zoom-in-95 duration-500 cubic-bezier-[0.16,1,0.3,1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Glass Header */}
        <div className="h-20 px-10 bg-surface/80 backdrop-blur-md border-b border-border flex justify-between items-center z-20">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="m-0 text-[1.1rem] font-black text-white tracking-tight font-['Outfit'] italic">
                  Manuscript Archive
                </h3>
                {metadata.isPreview ? (
                  <span className="bg-amber-500/15 text-amber-500 text-[0.65rem] px-3 py-1 rounded-full font-black tracking-widest uppercase border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <Eye size={12} /> PREVIEW MODE
                  </span>
                ) : (
                  <span className="bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-3 py-1 rounded-full font-black tracking-widest uppercase border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={12} /> SECURE FULL ACCESS
                  </span>
                )}
              </div>
              <p className="m-0 text-xs text-text-secondary font-bold opacity-60">
                Reading: {title || "Untitled Archive"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {blobUrl && !metadata.isPreview && (
              <a
                href={blobUrl}
                download={title ? `${title}.pdf` : "document.pdf"}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[0.85rem] font-black text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-xl shadow-black/20 no-underline"
              >
                <Download size={18} /> Download pdf
              </a>
            )}

            <div className="w-px h-8 bg-border" />

            <button
              onClick={onClose}
              className="bg-background text-text-secondary w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all border-none cursor-pointer group"
            >
              <X
                size={22}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-background w-full overflow-hidden">
          {isChecking ? (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="w-14 h-14 text-primary animate-spin relative" />
              </div>
              <div className="text-center">
                <p className="text-text-primary font-black text-sm tracking-[0.2em] uppercase opacity-80 mb-1">
                  Decrypting Archive...
                </p>
                <p className="text-text-secondary text-xs font-bold opacity-40">
                  Connecting to secure binary stream
                </p>
              </div>
            </div>
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-rose-500/[0.02]">
              <div className="w-24 h-24 rounded-[2.5rem] bg-rose-500/5 flex items-center justify-center mb-8 border border-rose-500/10 shadow-inner">
                <AlertTriangle size={48} className="text-rose-500" />
              </div>
              <h4 className="m-0 text-3xl font-black text-text-primary font-['Outfit'] italic tracking-tight">
                Nexus Access Error
              </h4>
              <p className="my-8 text-text-secondary max-w-[500px] leading-relaxed font-bold text-base opacity-70">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setIsChecking(true);
                  setLoadError(false);
                }}
                className="px-10 py-4 rounded-2xl bg-surface border border-border text-text-primary font-black hover:bg-background transition-all cursor-pointer flex items-center gap-3 group shadow-xl"
              >
                <RefreshCw
                  size={20}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />{" "}
                Refresh Connection
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <iframe
                src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-none"
                title="Secure Manuscript Viewer"
              />

              {/* Paywall Overlay for Previews */}
              {metadata.showPaywall && (
                <div className="absolute inset-0 flex flex-col items-center justify-end p-12 pointer-events-none">
                  <div className="w-full max-w-2xl bg-surface/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] pointer-events-auto animate-in slide-in-from-bottom-10 duration-700">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                        <Lock size={40} />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-2xl font-black text-text-primary italic leading-none mb-2 tracking-tight">
                          Enjoying the book?
                        </h5>
                        <p className="text-sm text-text-secondary font-bold opacity-70 leading-relaxed">
                          You've reached the end of the limited preview. Unlock
                          the full manuscript and support the author by
                          subscribing.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          navigate("/subscribe");
                        }}
                        className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-base flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 border-none cursor-pointer"
                      >
                        Subscribe Now <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PdfViewerModal;
