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
        let response;
        // Check if it's our backend proxy URL (prevents direct Cloudinary block)
        const isBackendUrl = pdfUrl.includes("/api/v1/book/readBook/");

        if (isBackendUrl) {
          // Backend API path — use authenticated API instance to send Token
          response = await API.get(pdfUrl, { responseType: "blob" });
        } else {
          // Direct Cloudinary URL — fetch without auth headers (may fail if blocked)
          response = await axios.get(pdfUrl, { responseType: "blob" });
        }

        if (!active) return;

        // Extract preview info from headers (only available from backend)
        const isPreviewHeader = response.headers["x-is-preview"];
        const isPreview = isPreviewHeader === "true";

        // Create a secure local URL for the PDF blob
        const blob = new Blob([response.data], { type: "application/pdf" });
        const localUrl = URL.createObjectURL(blob);
        blobRef.current = localUrl;

        setMetadata({
          isPreview: isPreview,
          showPaywall: isPreview,
          message: isPreview
            ? "Enjoy a 5-page preview! Subscribe for full access."
            : "Full secure access granted to this manuscript.",
        });

        setBlobUrl(localUrl);
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
      className="fixed inset-0 flex items-center justify-center z-[99999] bg-black animate-fade-in"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative w-full h-full bg-[#323639] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-[#202124] text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-error transition-all border-none cursor-pointer shadow-lg"
          title="Close Viewer"
        >
          <X size={20} />
        </button>

        <div className="flex-1 relative w-full h-full overflow-hidden">
          {isChecking ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#323639]">
              <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Loading Secure Manuscript...
              </p>
            </div>
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#323639]">
              <AlertTriangle size={48} className="text-error mb-4" />
              <p className="text-white text-base font-bold mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setIsChecking(true);
                  setLoadError(false);
                }}
                className="px-8 py-3 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-all border-none cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="w-full h-full">
              <iframe
                src={blobUrl}
                className="w-full h-full border-none"
                title="Secure Manuscript Viewer"
              />

              {/* Minimal Paywall Overlay */}
              {metadata.showPaywall && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center p-8 pointer-events-none">
                  <div className="w-full max-w-xl bg-[#202124] border border-white/10 rounded-2xl p-6 shadow-2xl pointer-events-auto flex items-center justify-between gap-6">
                    <div>
                      <h5 className="text-white font-bold text-lg mb-1">
                        Preview Ended
                      </h5>
                      <p className="text-white/60 text-xs">
                        Subscribe to read the full manuscript.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/subscribe");
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all border-none cursor-pointer"
                    >
                      Subscribe Now
                    </button>
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
