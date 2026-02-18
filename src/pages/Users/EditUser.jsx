import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  MapPin,
  Phone,
  Camera,
  Save,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { userApi } from "../../api/userApi";
import { updateUserThunk } from "../../store/slices/userSlice";
import Button from "../../components/UI/Button";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string(),
    role: Yup.string().required("Role is required"),
    profile_image: Yup.mixed().optional(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "User",
      profile_image: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setUpdating(true);
      const data = new FormData();

      // Explicitly append only the fields that the API expects
      // Note: 'location' and 'role' are excluded as they cause validation errors
      const allowedFields = ["name", "email", "phone", "profile_image"];

      allowedFields.forEach((key) => {
        if (
          values[key] !== null &&
          values[key] !== undefined &&
          values[key] !== ""
        ) {
          data.append(key, values[key]);
        }
      });

      try {
        const resultAction = await dispatch(
          updateUserThunk({ id, formData: data }),
        );
        if (updateUserThunk.fulfilled.match(resultAction)) {
          navigate("/users");
        }
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setUpdating(false);
      }
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getUserById(id);
        if (response.success) {
          const user = response.data;
          formik.setValues({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "User",
          });

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

          const imageUrl =
            getProfileUrl(user.profile) || user.avatar || user.image;
          if (imageUrl) setImagePreview(imageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      formik.setFieldValue("profile_image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-['Outfit']">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium tracking-tight">
          Loading user data...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit']">
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
        <div>
          <h1 className="text-3xl font-black text-text-primary italic tracking-tight">
            Edit User Profile
          </h1>
          <p className="text-text-secondary mt-1 tracking-tight">
            Modify account information for{" "}
            <span className="text-text-primary font-bold">
              "{formik.values.name}"
            </span>
            .
          </p>
        </div>
      </div>

      <div className="bg-surface/70 backdrop-blur-lg border border-border p-8 sm:p-10 rounded-[2.5rem] shadow-xl max-w-[800px]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-10">
          {/* Avatar Edit */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-background flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-primary/30" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-all border-4 border-surface overflow-hidden">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Full Name
              </label>
              <div className="relative group">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-background border ${
                    formik.touched.name && formik.errors.name
                      ? "border-rose-500"
                      : "border-border"
                  } focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 pl-12 pr-4 outline-hidden transition-all text-text-primary font-medium`}
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs ml-1 font-medium">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-background border ${
                    formik.touched.email && formik.errors.email
                      ? "border-rose-500"
                      : "border-border"
                  } focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 pl-12 pr-4 outline-hidden transition-all text-text-primary font-medium`}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs ml-1 font-medium">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary ml-1 block">
                Phone Number
              </label>
              <div className="relative group">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-background border ${
                    formik.touched.phone && formik.errors.phone
                      ? "border-rose-500"
                      : "border-border"
                  } focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 pl-12 pr-4 outline-hidden transition-all text-text-primary font-medium`}
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest ml-1">
                Security Entitlements / Role
              </label>
              <div className="relative group">
                <Shield
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
                />
                <select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-background border ${
                    formik.touched.role && formik.errors.role
                      ? "border-rose-500"
                      : "border-border"
                  } focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-4 pl-14 pr-12 outline-hidden transition-all text-text-primary font-bold appearance-none cursor-pointer`}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="System Admin">System Admin</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <ChevronDown size={20} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-10 border-t border-border">
            <Button
              type="submit"
              size="lg"
              icon={Save}
              loading={updating}
              className="flex-1 h-14 rounded-2xl"
            >
              Update Security Profile
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 h-14 rounded-2xl"
              onClick={() => navigate("/users")}
            >
              Cancel Revision
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
