import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Plus,
  Minus,
  Search,
  Loader2,
  Package,
  ChevronRight,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { updateBookThunk } from "../../store/slices/bookSlice";
import { bookApi } from "../../api/bookApi";
import Button from "../UI/Button";

/**
 * UpdateInventoryModal - Re-implemented to be an EXACT twin of CreateNotificationModal.
 * This version uses the same portal structure, backdrop logic, and conditional rendering.
 */
const UpdateInventoryModal = ({
  onClose,
  initialProduct = null,
  refreshAction = null,
}) => {
  const dispatch = useDispatch();
  const backdropRef = useRef();

  // State
  const [step, setStep] = useState(initialProduct ? 2 : 1);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [addQuantity, setAddQuantity] = useState(1);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState([]);
  const [isSearchingModal, setIsSearchingModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalSteps = 2;

  // Modal Product Search logic
  useEffect(() => {
    if (modalSearchQuery.trim().length > 1 && !selectedProduct) {
      setIsSearchingModal(true);
      const searchTimer = setTimeout(async () => {
        try {
          const response = await bookApi.searchBooks(
            modalSearchQuery,
            "",
            1,
            5,
          );
          const data = response?.data || response;
          setModalSearchResults(data.books || []);
        } catch (err) {
          console.error("Modal search failed", err);
        } finally {
          setIsSearchingModal(false);
        }
      }, 300);
      return () => clearTimeout(searchTimer);
    } else {
      setModalSearchResults([]);
    }
  }, [modalSearchQuery, selectedProduct]);

  const handleConfirmAddition = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    setIsUpdating(true);
    try {
      const currentStock = parseInt(selectedProduct.stock || 0);
      const newStock = currentStock + addQuantity;

      const formData = new FormData();
      formData.append("stock", newStock);

      const result = await dispatch(
        updateBookThunk({
          id: selectedProduct.id || selectedProduct._id,
          formData,
        }),
      );

      if (updateBookThunk.fulfilled.match(result)) {
        toast.success(`Successfully updated ${selectedProduct.title}`);
        if (refreshAction) refreshAction();
        onClose();
      } else {
        toast.error("Failed to update stock");
      }
    } catch (err) {
      console.error("Stock update failed", err);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const getStepTitle = () => {
    if (step === 1) return "Selection";
    return "Adjustment";
  };

  return ReactDOM.createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-surface rounded-lg border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header - Identical to Notification Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Package size={16} />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-base tracking-tight">
                Update Inventory
              </h2>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Step {step}/{totalSteps} — {getStepTitle()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar - Identical to Notification Modal */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 text-left">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
                  Search & Select Product
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or ISBN..."
                    value={
                      selectedProduct ? selectedProduct.title : modalSearchQuery
                    }
                    readOnly={!!selectedProduct}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full bg-background border border-border rounded-md pl-9 pr-10 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-primary transition-all"
                  />
                  {selectedProduct && (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setModalSearchQuery("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {isSearchingModal && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <Loader2
                        size={14}
                        className="animate-spin text-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results List */}
              {!selectedProduct && modalSearchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-md bg-background divide-y divide-border shadow-sm">
                  {modalSearchResults.map((product) => (
                    <button
                      key={product.id || product._id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setModalSearchResults([]);
                      }}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-10 h-14 rounded border border-border overflow-hidden shrink-0 bg-background">
                        <img
                          src={product.thumbnail?.url || product.thumbnail}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {product.title}
                        </p>
                        <p className="text-[10px] text-text-secondary font-bold opacity-60 mt-0.5">
                          ISBN: {product.isbn}
                        </p>
                        <div className="mt-2 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                          Current Stock: {product.stock || 0}
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Selected State visualization */}
              {selectedProduct && (
                <div className="p-4 rounded-md border border-primary bg-primary/5 flex items-center gap-4">
                  <div className="w-12 h-16 rounded border border-primary/20 overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={
                        selectedProduct.thumbnail?.url ||
                        selectedProduct.thumbnail
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-primary truncate">
                      {selectedProduct.title}
                    </p>
                    <p className="text-[10px] text-text-secondary font-bold opacity-60 mt-1 uppercase">
                      ISBN: {selectedProduct.isbn}
                    </p>
                    <div className="mt-3 inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                      Selected for update
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Product Review */}
              <div className="p-4 bg-background border border-border rounded-md shadow-sm opacity-90 scale-[0.99]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-14 rounded border border-border overflow-hidden shrink-0 bg-background">
                    <img
                      src={
                        selectedProduct.thumbnail?.url ||
                        selectedProduct.thumbnail
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {selectedProduct.title}
                    </p>
                    <p className="text-[10px] text-text-secondary font-bold opacity-60">
                      Current Stock: {selectedProduct.stock || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="space-y-4 pt-2">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center">
                  Adjustment Quantity
                </label>
                <div className="flex items-center justify-center gap-8 bg-background p-6 border border-border rounded-xl shadow-inner">
                  <button
                    onClick={() => setAddQuantity((p) => Math.max(1, p - 1))}
                    className="w-12 h-12 rounded bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-all active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={addQuantity}
                      onChange={(e) =>
                        setAddQuantity(parseInt(e.target.value) || 0)
                      }
                      className="w-20 text-center bg-transparent text-4xl font-black text-text-primary outline-none"
                    />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-40 mt-1">
                      Units
                    </span>
                  </div>
                  <button
                    onClick={() => setAddQuantity((p) => p + 1)}
                    className="w-12 h-12 rounded bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-all active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                    New Stock Projection
                  </span>
                  <span className="text-lg font-black text-primary">
                    {parseInt(selectedProduct.stock || 0) + addQuantity}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Identical to Notification Modal */}
        <div className="px-6 py-4 border-t border-border flex justify-between gap-3 bg-background/50">
          <Button
            variant="secondary"
            onClick={() =>
              step === 1 || initialProduct ? onClose() : setStep(1)
            }
          >
            {step === 1 || initialProduct ? "Cancel" : "Back"}
          </Button>

          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedProduct}
              className="min-w-[140px]"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleConfirmAddition}
              loading={isUpdating}
              disabled={isUpdating}
              className="min-w-[140px]"
            >
              Update Stock
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UpdateInventoryModal;
