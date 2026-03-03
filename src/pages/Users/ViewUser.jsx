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
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await userApi.getUserById(id);
        if (userRes.success) {
          const userData = userRes.data;
          setUser(userData);

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

          setImageUrl(
            getProfileUrl(userData.profile) ||
              userData.avatar ||
              userData.image ||
              null,
          );

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

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0].slice(0, 2).toUpperCase();
  };

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
        <div className="bg-surface border border-error/20 p-8 rounded-2xl shadow-xl text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-16 h-16 bg-error-surface dark:bg-rose-900/20 text-error rounded-full flex items-center justify-center border border-error/20 dark:border-rose-800">
            <User size={32} />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">
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

  const role = user.role || user.user_type || "User";
  const isAdmin = role.toLowerCase().includes("admin");

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-20">
      {/* Header Area */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/users")}
        >
          Back to Directory
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                User Profile
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border transition-all duration-300 ${
                  user.is_active !== false
                    ? "bg-success-surface text-success border-success/20"
                    : "bg-error-surface text-error border-error/20"
                }`}
              >
                {user.is_active !== false ? "Active" : "Suspended"}
              </div>
            </div>
          </div>
          <Button
            icon={Pencil}
            size="sm"
            onClick={() => navigate(`/users/edit/${user.id || user._id}`)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Simplified Profile Hero Card */}
        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar Column */}
            <div className="shrink-0">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageUrl(null)}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-5xl font-bold uppercase">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Area */}
            <div className="flex-1 flex flex-col gap-6 text-center md:text-left py-2">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                  {user.name}
                </h2>
                <p className="text-lg font-medium text-text-secondary flex items-center justify-center md:justify-start gap-2">
                  <Mail size={18} className="opacity-40" /> {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {role}
                </div>
                <div className="bg-background px-4 py-1.5 rounded-lg border border-border flex items-center gap-2">
                  <Hash size={14} className="text-primary/40" />
                  <span className="text-xs font-mono font-bold text-text-secondary">
                    ID: {user.id || user._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Combined Personal & Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Info Card */}
          <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Identity Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                    Contact Phone
                  </label>
                  <div className="bg-background px-4 py-3 rounded-xl text-sm font-bold text-text-primary border border-border flex items-center gap-3">
                    <Phone size={16} className="text-primary/40" />{" "}
                    {user.phone || "N/A"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                    Join Date
                  </label>
                  <div className="bg-background px-4 py-3 rounded-xl text-sm font-bold text-text-primary border border-border flex items-center gap-3">
                    <Clock size={16} className="text-primary/40" />
                    {user.createdAt
                      ? new Date(
                          user.createdAt || user.joinedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                  Access Role
                </label>
                <div className="bg-background px-4 py-3 rounded-xl text-sm font-bold text-text-primary border border-border flex items-center gap-3">
                  <Shield
                    size={16}
                    className={isAdmin ? "text-amber-500" : "text-primary/40"}
                  />
                  {role}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details Card */}
          <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Subscription Info
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                    Current Plan
                  </label>
                  <div className="bg-background px-4 py-3 rounded-xl text-sm font-bold text-text-primary border border-border flex items-center gap-3 capitalize italic">
                    <Shield size={16} className="text-primary/40" />{" "}
                    {user.subscription_plan || "Free Tier"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                    Member Status
                  </label>
                  <div className="flex items-center h-[46px]">
                    <div
                      className={`px-4 py-1.5 rounded-lg font-bold uppercase text-[10px] tracking-wider border ${
                        user.subscription_status === "active"
                          ? "bg-success-surface text-success border-success/20"
                          : "bg-error-surface text-error border-error/20"
                      }`}
                    >
                      {user.subscription_status || "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {user.subscription_end_date && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                    Expiration
                  </label>
                  <div className="bg-background px-4 py-3 rounded-xl text-sm font-bold text-text-primary border border-border flex items-center gap-3 text-rose-500">
                    <Calendar size={16} />
                    {new Date(user.subscription_end_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </div>
                </div>
              )}

              {subscription && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                      Payment ID
                    </label>
                    <p className="text-xs font-mono font-bold text-text-primary truncate px-1">
                      {subscription.payment_id}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                      Amount
                    </label>
                    <p className="text-sm font-bold text-primary px-1">
                      ₹{subscription.amount}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
