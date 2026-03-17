import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  User,
  Clock,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { getAllContactQueries, updateQueryStatus, deleteContactQuery } from "../../api/contactApi";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const ViewContactMessage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // Since we don't have a single GET API yet, we'll fetch all and filter or just use the list if state was passed.
        // For now, let's fetch the list and find our item as a quick way, or I should have added a specific GET by ID.
        // Let's assume we can fetch it or just redirect back if not found.
        const data = await getAllContactQueries(1, 100); // Fetch recent 100
        const found = data.queries.find((q) => q.id === parseInt(id));
        if (found) {
          setMessage(found);
        } else {
          toast.error("Message not found");
          navigate("/messages");
        }
      } catch (error) {
        toast.error("Failed to load message details");
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateQueryStatus(id, newStatus);
      if (res.status === "success") {
        toast.success("Status updated successfully");
        setMessage({ ...message, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteContactQuery(id);
        toast.success("Message deleted successfully");
        navigate("/messages");
      } catch (error) {
        toast.error("Failed to delete message");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/messages")}
            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">
              Message Details
            </h1>
            <p className="text-text-secondary text-sm font-medium opacity-60">
              Viewing inquiry from {message.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-error/20 text-error hover:bg-error/5 rounded-xl font-bold text-xs uppercase tracking-widest px-6"
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-background/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
                  Message Content
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  message.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                  message.status === 'responded' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-success/10 text-success'
                }`}>
                  {message.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-text-primary mt-4">
                {message.subject}
              </h2>
            </div>
            <div className="p-8">
              <p className="text-text-primary text-base leading-relaxed whitespace-pre-wrap opacity-80">
                {message.message}
              </p>
            </div>
            <div className="p-6 bg-background/30 border-t border-border flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-text-secondary font-medium text-sm">
                <Clock size={16} className="opacity-40" />
                <span>Received: {new Date(message.created_at || message.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions / Response */}
          <div className="bg-surface rounded-3xl border border-border shadow-sm p-6">
            <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-6">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusChange("pending")}
                className={`flex-1 min-w-[120px] p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  message.status === "pending"
                    ? "bg-amber-500/5 border-amber-500 text-amber-600"
                    : "border-border text-text-secondary hover:bg-background"
                }`}
              >
                <AlertCircle size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
              </button>
              <button
                onClick={() => handleStatusChange("responded")}
                className={`flex-1 min-w-[120px] p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  message.status === "responded"
                    ? "bg-blue-500/5 border-blue-500 text-blue-600"
                    : "border-border text-text-secondary hover:bg-background"
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Responded</span>
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                className={`flex-1 min-w-[120px] p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  message.status === "closed"
                    ? "bg-success/5 border-success text-success"
                    : "border-border text-text-secondary hover:bg-background"
                }`}
              >
                <CheckCircle2 size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Closed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-3xl border border-border shadow-sm p-6">
            <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-6">
              Sender Details
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Full Name</p>
                  <p className="text-sm font-bold text-text-primary">{message.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Mail size={24} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Email Address</p>
                  <p className="text-sm font-bold text-text-primary truncate">{message.email}</p>
                </div>
              </div>

              {message.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Phone Number</p>
                    <p className="text-sm font-bold text-text-primary">{message.phone}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <a 
                  href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-surface rounded-3xl border border-border shadow-sm p-6">
             <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-6 font-['Outfit']">
              System Info
            </h3>
            <div className="flex flex-col gap-4 font-['Outfit']">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary opacity-60 uppercase">IP Address</span>
                <span className="text-xs font-bold text-text-primary bg-background px-2 py-1 rounded-md border border-border">{message.ip_address || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary opacity-60 uppercase">Reference ID</span>
                <span className="text-xs font-bold text-text-primary">#MSG-{message.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContactMessage;
