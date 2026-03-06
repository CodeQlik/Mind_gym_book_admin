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
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  updateProfile,
  changePassword,
  clearError,
} from "../../store/slices/authSlice";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const passwordFormik = useFormik({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      old_password: Yup.string().required("Current password is required"),
      new_password: Yup.string()
        .min(6, "Naya password kam se kam 6 characters ka hona chahiye")
        .required("Naya password zaroori hai"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Passwords match hone chahiye")
        .required("Password confirm karna zaroori hai"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(changePassword(values));
      if (changePassword.fulfilled.match(result)) {
        toast.success(result.payload || "Password successfully changed");
        resetForm();
      }
    },
  });

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
        <div className="lg:col-span-1 space-y-6">
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

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 text-text-secondary font-medium text-xs">
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

        {/* Details & Security Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <User size={16} className="text-primary" />
              Profile Details
            </h3>

            {error &&
              !isEditing && ( // Show general errors only if not editing profile
                <div className="mb-6 p-4 bg-error-surface text-error border border-error/20 rounded-md text-xs font-bold uppercase tracking-wider">
                  Error: {error}
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
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Lock size={16} className="text-primary" />
              Security Management
            </h3>

            <form onSubmit={passwordFormik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className={`w-full h-11 bg-background/50 border border-border rounded-xl pl-10 pr-10 text-sm focus:border-primary/50 outline-none transition-all ${
                        passwordFormik.touched.old_password &&
                        passwordFormik.errors.old_password
                          ? "border-error"
                          : ""
                      }`}
                      {...passwordFormik.getFieldProps("old_password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordFormik.touched.old_password &&
                    passwordFormik.errors.old_password && (
                      <p className="text-error text-[10px] font-bold px-1 tracking-wider uppercase">
                        {passwordFormik.errors.old_password}
                      </p>
                    )}
                </div>

                <div className="hidden md:block"></div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`w-full h-11 bg-background/50 border border-border rounded-xl pl-10 pr-10 text-sm focus:border-primary/50 outline-none transition-all ${
                        passwordFormik.touched.new_password &&
                        passwordFormik.errors.new_password
                          ? "border-error"
                          : ""
                      }`}
                      {...passwordFormik.getFieldProps("new_password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordFormik.touched.new_password &&
                    passwordFormik.errors.new_password && (
                      <p className="text-error text-[10px] font-bold px-1 tracking-wider uppercase">
                        {passwordFormik.errors.new_password}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full h-11 bg-background/50 border border-border rounded-xl pl-10 pr-10 text-sm focus:border-primary/50 outline-none transition-all ${
                        passwordFormik.touched.confirm_password &&
                        passwordFormik.errors.confirm_password
                          ? "border-error"
                          : ""
                      }`}
                      {...passwordFormik.getFieldProps("confirm_password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordFormik.touched.confirm_password &&
                    passwordFormik.errors.confirm_password && (
                      <p className="text-error text-[10px] font-bold px-1 tracking-wider uppercase">
                        {passwordFormik.errors.confirm_password}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Shield}
                  size="sm"
                  className="rounded-xl px-8"
                >
                  Update Admin Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
