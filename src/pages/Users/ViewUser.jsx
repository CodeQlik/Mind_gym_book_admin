import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  MapPin,
  Phone,
  Calendar,
  Pencil,
  Loader2,
  Clock,
  Hash,
} from "lucide-react";
import { userApi } from "../../api/userApi";
import { subscriptionApi } from "../../api/subscriptionApi";
import Button from "../../components/UI/Button";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await userApi.getUserById(id);
        if (userRes.success) {
          setUser(userRes.data);

          // Fetch subscription details if user is found
          const subRes = await subscriptionApi.getSubscriptionByUserId(id);
          if (subRes.success) {
            setSubscription(subRes.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-['Outfit']">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium tracking-tight">
          Consulting directory for user records...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-10 animate-fade-in font-['Outfit']">
        <div className="bg-surface border border-rose-500/20 p-8 rounded-[2.5rem] shadow-xl text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-800">
            <User size={40} />
          </div>
          <div>
            <p className="text-xl font-black text-text-primary">
              Profile Not Found
            </p>
            <p className="text-sm text-text-secondary mt-1">
              The requested user record does not exist or has been archived.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full"
            icon={ArrowLeft}
            onClick={() => navigate("/users")}
          >
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  const getProfileUrl = (profile) => {
    if (!profile) return null;
    if (typeof profile === "string") {
      try {
        if (profile.startsWith("{")) return JSON.parse(profile).url;
        return profile;
      } catch (e) {
        return profile;
      }
    }
    return profile.url;
  };

  const imageUrl = getProfileUrl(user.profile) || user.avatar || user.image;

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0].slice(0, 2).toUpperCase();
  };

  const role = user.role || user.user_type || "User";
  const isAdmin = role.toLowerCase().includes("admin");

  return (
    <div className="flex flex-col gap-10 animate-fade-in font-['Outfit'] pb-20">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/users")}
        >
          Back to Directory
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-text-primary italic tracking-tight uppercase">
                User Record
              </h1>
              <div
                className={`px-4 py-1.5 rounded-full text-[0.65rem] font-black tracking-widest uppercase border transition-all duration-300 ${
                  user.is_active !== false
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                }`}
              >
                {user.is_active !== false ? "● ACTIVE" : "● SUSPENDED"}
              </div>
            </div>
            <p className="text-text-secondary font-medium tracking-tight">
              Viewing security profile and analytics for{" "}
              <span className="text-primary font-bold">"{user.name}"</span>
            </p>
          </div>
          <Button
            icon={Pencil}
            size="md"
            onClick={() => navigate(`/users/edit/${user.id || user._id}`)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Main Profile Hero Card */}
        <div className="bg-surface border border-border p-10 sm:p-14 rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
            {/* Avatar Column */}
            <div className="relative shrink-0">
              <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-background shadow-2xl transition-transform duration-700 group-hover:scale-105">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center text-7xl font-black italic">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
              <div className="absolute -inset-4 bg-primary/5 rounded-full -z-10 blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Quick Stats Area */}
            <div className="flex-1 flex flex-col gap-8 text-center lg:text-left py-4">
              <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-black text-text-primary italic leading-none tracking-tight">
                  {user.name}
                </h2>
                <p className="text-xl font-bold text-text-secondary flex items-center justify-center lg:justify-start gap-3">
                  <Mail size={22} className="text-primary/30" /> {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div
                  className={`px-8 py-3 rounded-2xl text-[0.8rem] font-black uppercase tracking-[0.25em] shadow-lg ${
                    isAdmin
                      ? "bg-amber-400 text-white shadow-amber-400/20"
                      : "bg-primary text-white shadow-primary/20 hover:-translate-y-1 transition-transform"
                  }`}
                >
                  {role}
                </div>
                <div className="bg-background px-6 py-3 rounded-2xl border border-border flex items-center gap-3">
                  <Hash size={16} className="text-primary" />
                  <span className="text-sm font-mono font-bold text-text-secondary">
                    ID: {user.id || user._id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Background Mark */}
          <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-[20rem] font-black text-text-primary/[0.02] -z-0 pointer-events-none select-none italic">
            {getInitials(user.name)}
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="bg-surface border border-border p-10 sm:p-14 rounded-[3rem] shadow-sm">
          <h3 className="text-[0.8rem] font-black text-primary mb-12 flex items-center gap-4 uppercase tracking-[0.3em]">
            <span className="w-2.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/30"></span>
            Personal Information Registry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Official Designation
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                <User size={20} className="text-primary" /> {user.name}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Electronic Communication
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                <Mail size={20} className="text-primary" /> {user.email}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Secure Mobile Link
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                <Phone size={20} className="text-primary" />{" "}
                {user.phone || "No secure line provided"}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Onboarding Data
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                <Clock size={20} className="text-primary" />
                {new Date(user.createdAt || user.joinedAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Security Entitlements
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                <Shield
                  size={20}
                  className={isAdmin ? "text-amber-500" : "text-primary"}
                />
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-surface border border-border p-10 sm:p-14 rounded-[3rem] shadow-sm">
          <h3 className="text-[0.8rem] font-black text-primary mb-12 flex items-center gap-4 uppercase tracking-[0.3em]">
            <span className="w-2.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/30"></span>
            Subscription Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Plan Type
              </label>
              <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20 capitalize">
                <Shield size={20} className="text-primary" />{" "}
                {user.subscription_plan || "Free Tier"}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                Current Status
              </label>
              <div className="flex items-center">
                <div
                  className={`px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border ${
                    user.subscription_status === "active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}
                >
                  {user.subscription_status || "Inactive"}
                </div>
              </div>
            </div>

            {user.subscription_end_date && (
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                  Expirations Date
                </label>
                <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                  <Calendar size={20} className="text-rose-400" />
                  {new Date(user.subscription_end_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </div>
              </div>
            )}

            {subscription && (
              <>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                    Payment Reference
                  </label>
                  <div className="bg-background px-6 py-4 rounded-2xl font-bold text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                    <Hash size={20} className="text-indigo-400" />{" "}
                    {subscription.payment_id || "N/A"}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.25em] ml-1 block">
                    Transactional Amount
                  </label>
                  <div className="bg-background px-6 py-4 rounded-2xl font-black text-text-primary border border-border flex items-center gap-4 transition-all hover:border-primary/20">
                    <span className="text-primary text-xl">₹</span>{" "}
                    {subscription.amount}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
