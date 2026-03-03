import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Shield,
  Settings as SettingsIcon,
  Camera,
  Phone,
  Calendar,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { updateProfile, clearError } from "../../store/slices/authSlice";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append(
      "phone",
      formData.phone ? formData.phone.replace(/\D/g, "") : "",
    );

    if (imageFile) data.append("profile_image", imageFile);

    const result = await dispatch(updateProfile({ formData: data }));
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
      setImageFile(null);
      toast.success("Profile updated successfully");
    }
  };

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

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Account Profile
          </h1>
          <p className="text-text-secondary text-sm">
            Manage your administrative details and credentials.
          </p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            icon={SettingsIcon}
            variant="secondary"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading} icon={Save}>
              Save Update
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-lg p-8 flex flex-col items-center shadow-sm">
            <div className="relative w-32 h-32 mb-6 group">
              <img
                src={
                  imagePreview ||
                  getProfileUrl(user?.profile) ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Admin"}`
                }
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover border border-border/50 shadow-md"
              />
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-all">
                  <Camera size={18} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              {user?.name || "System Admin"}
            </h2>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {user?.role || "Administrator"}
              </span>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-bold text-text-primary">148</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
                  Books
                </p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-sm font-bold text-text-primary">12.4k</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
                  Users
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-text-primary">4.8</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
                  Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Shield size={16} className="text-primary" />
              Credential Archive
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-error-surface text-error border border-error/20 rounded-md text-xs font-bold uppercase tracking-wider">
                System Error: {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    icon={User}
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                  />
                  <FormInput
                    label="Contact Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    icon={Phone}
                  />
                  <FormInput
                    label="Account ID"
                    value={user?.id || "N/A"}
                    disabled
                    icon={Shield}
                  />
                </>
              ) : (
                <>
                  {[
                    { label: "Full Name", value: user?.name, icon: User },
                    { label: "Email Address", value: user?.email, icon: Mail },
                    {
                      label: "Contact Number",
                      value: user?.phone || "Not Provided",
                      icon: Phone,
                    },
                    {
                      label: "Role Status",
                      value: user?.role || "Admin",
                      icon: Shield,
                    },
                  ].map((field, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-background/50 p-4 rounded-lg border border-border"
                    >
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <field.icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60 leading-none mb-1">
                          {field.label}
                        </p>
                        <p className="text-sm font-bold text-text-primary truncate">
                          {field.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-text-secondary font-medium text-xs">
              <Calendar size={14} className="opacity-40" />
              <span>
                Joined on{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Jan 2024"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
