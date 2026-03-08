import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Paperclip,
  Check,
  Package,
  ExternalLink,
} from "lucide-react";
import { supportApi } from "../../api/supportApi";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const ChatSupport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.auth);

  const fetchTicketDetails = async () => {
    try {
      const res = await supportApi.getTicketDetails(id);
      // Backend returns { success: true, data: { ...ticket } }
      if (res.data && res.data.success) {
        setTicket(res.data.data);
      } else if (res.success) {
        setTicket(res.data);
      }
    } catch (err) {
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    // Poll for new messages every 10 seconds (Basic fallback for WebSockets)
    const interval = setInterval(fetchTicketDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await supportApi.addMessage(id, { message: newMessage });
      if (res.data?.success || res.success) {
        setNewMessage("");
        fetchTicketDetails();
      }
    } catch (err) {
      toast.error("Message failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await supportApi.updateStatus(id, newStatus);
      if (res.data?.success || res.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        fetchTicketDetails();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-text-secondary opacity-40">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-text-secondary uppercase tracking-widest opacity-60">
          Ticket Not Found
        </h2>
        <Button onClick={() => navigate("/support")} variant="outline">
          Back to Support
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-0 gap-4 animate-fade-in font-['Outfit'] pb-4 pt-6">
      {/* Premium Header Container */}
      <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-[2rem] p-4 flex items-center justify-between shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigate("/support")}
            className="w-10 h-10 rounded-xl bg-background hover:bg-surface flex items-center justify-center transition-all border border-border shadow-sm group/btn"
          >
            <ArrowLeft
              size={18}
              className="group-hover/btn:-translate-x-1 transition-transform"
            />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-lg bg-text-primary text-[10px] font-black text-background tracking-widest uppercase">
                {ticket.ticket_no}
              </span>
              <h1 className="text-sm font-bold text-text-primary truncate max-w-[300px]">
                {ticket.subject}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  ticket.status === "open"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : ticket.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-success-surface text-success border-success/20"
                }`}
              >
                <div
                  className={`w-1 h-1 rounded-full animate-pulse ${
                    ticket.status === "open"
                      ? "bg-amber-500"
                      : ticket.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                  }`}
                />
                {ticket.status?.replace("_", " ")}
              </span>
              <span className="text-[10px] text-text-secondary font-medium opacity-40">
                • Customer: {ticket.user?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <button
              onClick={() => handleStatusChange("resolved")}
              className="px-4 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Mark Resolved
            </button>
          )}
          <button className="w-10 h-10 rounded-xl hover:bg-background flex items-center justify-center text-text-secondary opacity-40 hover:opacity-100 border border-transparent hover:border-border transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 bg-surface border border-border rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] grayscale transition-opacity"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-primary) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide relative z-10">
            {/* Initial Ticket Description */}
            <div className="flex justify-center mb-10">
              <div className="max-w-[80%] bg-surface border border-dashed border-border rounded-3xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border mx-auto mb-4">
                  <LifeBuoy size={24} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 mb-2">
                  Original Ticket Inquiry
                </h3>
                <p className="text-sm font-medium text-text-primary leading-relaxed italic opacity-80">
                  "{ticket.description}"
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">
                  <span>Priorty: {ticket.priority}</span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span>
                    {new Date(
                      ticket.createdAt || ticket.created_at,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            {ticket.messages?.map((msg) => {
              const isMe = msg.sender_role === "admin";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isMe
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isMe ? "A" : msg.sender?.name?.[0] || "U"}
                  </div>

                  <div
                    className={`flex flex-col gap-1 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-5 py-3.5 rounded-2xl shadow-sm transition-all duration-300 ${
                        isMe
                          ? "bg-text-primary text-background rounded-br-none hover:opacity-90"
                          : "bg-surface border border-border rounded-bl-none text-text-primary hover:bg-background/50"
                      }`}
                    >
                      <p className="text-[13px] font-medium leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40">
                        {new Date(
                          msg.createdAt || msg.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <Check size={10} className="text-primary" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-surface border-t border-border mt-auto relative z-20">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-4 bg-background p-2 border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/10 transition-all"
            >
              <button
                type="button"
                className="w-10 h-10 rounded-xl hover:bg-surface flex items-center justify-center text-text-secondary opacity-40 hover:opacity-100 transition-colors"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your response..."
                className="flex-1 bg-transparent border-none px-2 text-sm font-medium text-text-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
          {/* Customer Card */}
          <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm group hover:border-primary/20 transition-all">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 mb-5">
              Customer Profile
            </h3>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {ticket.user?.name?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-black uppercase tracking-tight text-text-primary truncate">
                  {ticket.user?.name}
                </h4>
                <p className="text-[10px] font-bold text-primary mt-0.5">
                  Verified User
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40">
                  Email Address
                </span>
                <span className="text-[11px] font-bold text-text-secondary truncate">
                  {ticket.user?.email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40">
                  Phone Contact
                </span>
                <span className="text-[11px] font-bold text-text-secondary">
                  {ticket.user?.phone || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Order Card */}
          {ticket.order && (
            <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">
                  Order Context
                </h3>
                <Package
                  size={14}
                  className="text-primary opacity-40 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-background rounded-2xl p-4 mb-4 border border-border">
                <h4 className="text-[11px] font-black text-text-primary mb-1 uppercase tracking-tight">
                  {ticket.order.order_no}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black text-primary">
                    ₹{ticket.order.total_amount}
                  </span>
                  <span className="text-[9px] font-bold text-text-secondary opacity-40">
                    {new Date(ticket.order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/orders/view/${ticket.order.id}`)}
                className="w-full h-10 rounded-xl bg-background hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest text-text-secondary hover:border-transparent transition-all border border-border flex items-center justify-center gap-2"
              >
                Inspect Order <ExternalLink size={12} />
              </button>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-surface border border-border rounded-[2.2rem] p-6 shadow-xl shadow-primary/5 mt-auto">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 mb-5 text-center px-4">
              Management Console
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleStatusChange("in_progress")}
                className={`h-11 rounded-1.5xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  ticket.status === "in_progress"
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-background border border-border text-text-secondary hover:bg-background/50"
                }`}
              >
                <Clock size={14} /> Mark Active
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                className={`h-11 rounded-1.5xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  ticket.status === "closed"
                    ? "bg-slate-700 text-white"
                    : "bg-background border border-border text-text-secondary hover:bg-background/50"
                }`}
              >
                <AlertCircle size={14} /> Close Thread
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
