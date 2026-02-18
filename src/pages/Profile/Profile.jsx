import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Shield,
  Settings,
  Camera,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { updateProfile, clearError } from "../../store/slices/authSlice";
const Profile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (imageFile) {
      data.append("profile_image", imageFile);
    }

    const result = await dispatch(
      updateProfile({ id: user?.id || user?._id, formData: data }),
    );
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
      setImageFile(null);
    }
  };

  const profileData = [
    {
      label: "Full Name",
      name: "name",
      value: formData.name,
      icon: <User size={18} />,
    },
    {
      label: "Email Address",
      name: "email",
      value: formData.email,
      icon: <Mail size={18} />,
    },
    {
      label: "Contact Number",
      name: "phone",
      value: formData.phone || "+91 98765 43210",
      icon: <Phone size={18} />,
    },
    {
      label: "Joined Date",
      value: user?.joinedAt
        ? new Date(user.joinedAt).toLocaleDateString()
        : "January 12, 2024",
      icon: <Calendar size={18} />,
      readOnly: true,
    },
  ];

  const getProfileUrl = (profile) => {
    if (!profile) return null;
    if (typeof profile === "string") {
      try {
        if (profile.startsWith("{")) {
          return JSON.parse(profile).url;
        }
        return profile;
      } catch (e) {
        return profile;
      }
    }
    return profile.url;
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary font-['Outfit'] tracking-tight">
            User <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-text-secondary mt-2 text-lg font-medium opacity-80 italic font-['Outfit']">
            Manage your digital identity and administrative credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Sidebar - Profile Card */}
        <div
          className="lg:col-span-1 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="card-premium flex flex-col items-center p-10">
            <div className="relative w-40 h-40 mb-8 group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
              <img
                src={
                  imagePreview ||
                  getProfileUrl(user?.profile) ||
                  user?.avatar ||
                  user?.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Felix"}`
                }
                alt="Profile"
                className="w-full h-full rounded-[2.5rem] object-cover border-4 border-white/50 dark:border-white/5 shadow-2xl relative z-10 transition-all duration-500 group-hover:rotate-2 group-hover:scale-105"
              />
              {isEditing && (
                <label className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all z-20 border-none">
                  <Camera size={22} strokeWidth={2.5} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <h2 className="text-3xl font-black text-text-primary font-['Outfit'] tracking-tight mb-2">
              {user?.name || "System Admin"}
            </h2>
            <div className="flex gap-2 mb-10">
              <span className="px-4 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                {user?.role || user?.user_type || "Admin"}
              </span>
              <span className="px-4 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full pt-10 border-t border-border/30">
              <div className="flex flex-col items-center group/stat cursor-default">
                <h4 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors">
                  148
                </h4>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">
                  Books
                </p>
              </div>
              <div className="flex flex-col items-center border-x border-border/30 group/stat cursor-default px-4">
                <h4 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors">
                  12.4k
                </h4>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">
                  Readers
                </p>
              </div>
              <div className="flex flex-col items-center group/stat cursor-default">
                <h4 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors">
                  4.8
                </h4>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">
                  Rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area - Forms */}
        <div
          className="lg:col-span-2 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="card-premium h-full p-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
              <h3 className="text-2xl font-black text-text-primary font-['Outfit'] tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Shield size={24} strokeWidth={2.5} />
                </div>
                Credential Archive
              </h3>
              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border-none cursor-pointer"
                    onClick={() => {
                      setIsEditing(false);
                      setImagePreview(null);
                      setImageFile(null);
                      dispatch(clearError());
                    }}
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all border-none cursor-pointer"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={18} /> Save Update
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-background border border-border/50 text-text-primary font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary active:scale-95 transition-all shadow-xl shadow-black/5 border-none cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings size={18} /> Settings Override
                </button>
              )}
            </div>

            {error && (
              <div className="p-6 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 font-black text-xs tracking-widest uppercase animate-pulse mb-10">
                SYSTEM BREACH: {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {profileData.map((item, index) => (
                <div className="flex flex-col gap-4" key={index}>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">
                    {item.label}
                  </label>
                  {isEditing && !item.readOnly ? (
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                        {item.icon}
                      </div>
                      <input
                        type="text"
                        name={item.name}
                        value={item.value}
                        onChange={handleInputChange}
                        className="w-full bg-background/50 border border-border/50 group-focus-within:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/10 rounded-2xl py-4 pl-14 pr-6 outline-hidden transition-all text-sm font-bold text-text-primary"
                      />
                    </div>
                  ) : (
                    <div className="group flex items-center gap-5 bg-background/30 p-5 rounded-3xl border border-border/20 hover:border-primary/30 transition-all hover:bg-white/50 dark:hover:bg-slate-800/50">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-text-primary tracking-tight">
                          {item.value || "Not Assigned"}
                        </span>
                        {item.readOnly && (
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                            Immutable Field
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
