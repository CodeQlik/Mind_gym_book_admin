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
  Phone,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import { userApi } from "../../api/userApi";
import { updateUserThunk } from "../../store/slices/userSlice";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "User",
      profile_image: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      role: Yup.string().required("Required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setUpdating(true);
      const data = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });

      try {
        const result = await dispatch(updateUserThunk({ id, formData: data }));
        if (updateUserThunk.fulfilled.match(result)) {
          toast.success("User updated successfully");
          navigate("/users");
        }
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
          const getProfileUrl = (p) => {
            if (!p) return null;
            if (typeof p === "string" && p.startsWith("{"))
              return JSON.parse(p).url;
            return p.url || p;
          };
          const img = getProfileUrl(user.profile) || user.avatar || user.image;
          if (img) setImagePreview(img);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("profile_image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].slice(0, 2).toUpperCase();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left font-['Outfit']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/users")}
            className="mb-2"
          >
            Back to Directory
          </Button>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Edit User Profile
          </h1>
          <p className="text-text-secondary text-sm">
            Update account information for "{formik.values.name}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/users")}>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} loading={updating} icon={Save}>
            Update Security Profile
          </Button>
        </div>
      </div>

      <div className="max-w-3xl bg-surface border border-border rounded-lg p-8 shadow-sm">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border bg-background flex items-center justify-center shadow-md">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold uppercase tracking-wider">
                    {getInitials(formik.values.name)}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-all">
                <Camera size={14} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Full Name"
              name="name"
              {...formik.getFieldProps("name")}
              error={formik.touched.name && formik.errors.name}
              icon={User}
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && formik.errors.email}
              icon={Mail}
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              {...formik.getFieldProps("phone")}
              icon={Phone}
            />
            <FormInput
              label="User Role"
              name="role"
              type="select"
              {...formik.getFieldProps("role")}
              options={[
                { v: "User", l: "User" },
                { v: "Admin", l: "Administrator" },
                { v: "System Admin", l: "System Root" },
              ].map((o) => ({ value: o.v, label: o.l }))}
              icon={Shield}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
