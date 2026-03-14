import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HelpCircle, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import faqApi from "../../../api/faqApi";
import toast from "react-hot-toast";

const AddEditFAQ = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [faqs, setFaqs] = useState([
    {
      question: "",
      answer: "",
      order: 0,
      is_active: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchFaq();
    }
  }, [id]);

  const fetchFaq = async () => {
    try {
      setFetching(true);
      const data = await faqApi.getFaqById(id);
      if (data.success) {
        const faq = data.data;
        if (faq) {
          setFaqs([
            {
              question: faq.question,
              answer: faq.answer,
              order: faq.order,
              is_active: faq.is_active,
            },
          ]);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch FAQ");
    } finally {
      setFetching(false);
    }
  };

  const handleAddRow = () => {
    setFaqs([
      ...faqs,
      {
        question: "",
        answer: "",
        order: faqs.length,
        is_active: true,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (faqs.length === 1) return;
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };

  const handleInputChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isEdit) {
        response = await faqApi.updateFaq(id, faqs[0]);
      } else {
        // If multiple FAQs, send the array; if one, sending array is also fine as backend handles it
        response = await faqApi.createFaq(faqs.length === 1 ? faqs[0] : faqs);
      }

      if (response.success) {
        toast.success(
          isEdit 
            ? "FAQ updated successfully" 
            : faqs.length > 1 
              ? "FAQs added successfully" 
              : "FAQ created successfully"
        );
        navigate("/cms/faqs");
      }
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <HelpCircle size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none mb-2">
              {isEdit ? "Edit FAQ" : "Add FAQ(s)"}
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-80">
              {isEdit ? "Update existing FAQ details" : "Create one or multiple frequently asked questions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isEdit && (
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl font-bold hover:bg-success/20 transition-all active:scale-95"
            >
              <Plus size={18} />
              Add Another
            </button>
          )}
          <button
            onClick={() => navigate("/cms/faqs")}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-surface rounded-2xl border border-border shadow-sm p-8 space-y-6 relative group"
          >
            {!isEdit && faqs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remove this FAQ"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary flex items-center gap-2">
                  {!isEdit && <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center">#{index + 1}</span>}
                  Question
                </label>
                <textarea
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[80px] focus:border-primary outline-none transition-all text-text-primary placeholder:opacity-40"
                  placeholder="Enter question here..."
                  value={faq.question}
                  onChange={(e) => handleInputChange(index, "question", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Answer</label>
                <textarea
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[120px] focus:border-primary outline-none transition-all text-text-primary placeholder:opacity-40"
                  placeholder="Enter answer here..."
                  value={faq.answer}
                  onChange={(e) => handleInputChange(index, "answer", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary">Display Order</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-text-primary placeholder:opacity-40"
                    value={faq.order}
                    onChange={(e) => handleInputChange(index, "order", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <label className="text-sm font-bold text-text-primary">Status</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                        checked={faq.is_active}
                        onChange={() => handleInputChange(index, "is_active", true)}
                      />
                      <span className="text-[14px] font-semibold text-text-secondary group-hover:text-success transition-colors">
                        Active
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                        checked={!faq.is_active}
                        onChange={() => handleInputChange(index, "is_active", false)}
                      />
                      <span className="text-[14px] font-semibold text-text-secondary group-hover:text-error transition-colors">
                        Inactive
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 bg-surface/50 p-6 rounded-2xl border border-dashed border-border sticky bottom-4 z-20 backdrop-blur-sm shadow-xl">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save size={20} />
            {loading ? "Saving..." : isEdit ? "Update FAQ" : `Save ${faqs.length} FAQ(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditFAQ;
