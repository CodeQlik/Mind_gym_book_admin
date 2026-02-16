import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Upload, Save, Loader2, Tags } from "lucide-react";
import {
  updateCategory,
  clearCategoryError,
} from "../../store/slices/categorySlice";
import { categoryApi } from "../../api/categoryApi";
import FormInput from "../../components/Form/FormInput";
import TextArea from "../../components/Form/TextArea";
import Button from "../../components/UI/Button";

const EditCategory = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.categories);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name is too short")
      .required("Category name is required"),
    description: Yup.string()
      .min(10, "Description should be at least 10 characters")
      .required("Description is required"),
    image: Yup.mixed().optional(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const data = new FormData();
      Object.keys(values).forEach((key) => {
        data.append(key, values[key]);
      });

      const result = await dispatch(
        updateCategory({ id: categoryId, formData: data }),
      );
      if (updateCategory.fulfilled.match(result)) {
        navigate("/categories");
      }
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoryApi.getCategoryBySlug(slug);
        if (response.success) {
          const category = response.data;
          setCategoryId(category.id || category._id);
          formik.setValues({
            name: category.name || "",
            description: category.description || "",
          });

          if (category.image) {
            let url = null;
            if (
              typeof category.image === "string" &&
              category.image.startsWith("{")
            ) {
              url = JSON.parse(category.image).url;
            } else {
              url = category.image.url || category.image;
            }
            setImagePreview(url);
          }
        }
      } catch (err) {
        console.error("Failed to fetch category", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCategory();

    return () => {
      dispatch(clearCategoryError());
    };
  }, [slug, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium font-['Outfit']">
          Loading category data...
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
          onClick={() => navigate("/categories")}
        >
          Back to Categories
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary italic">
            Edit Category
          </h1>
          <p className="text-text-secondary mt-1 tracking-tight">
            Update the information for the{" "}
            <span className="text-text-primary font-bold">
              "{formik.values.name}"
            </span>{" "}
            category.
          </p>
        </div>
      </div>

      <div className="bg-surface/70 backdrop-blur-lg border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-xl max-w-[800px]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8">
          <FormInput
            label="Category Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            required
            placeholder="e.g. Science Fiction"
          />

          <TextArea
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && formik.errors.description}
            placeholder="Enter category description..."
            rows={4}
          />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary ml-1 block">
              Category Image
            </label>
            <div
              className={`border-2 border-dashed ${
                formik.touched.image && formik.errors.image
                  ? "border-rose-500"
                  : "border-border"
              } rounded-3xl p-10 text-center bg-primary/[0.02] hover:bg-primary/[0.04] transition-all relative group overflow-hidden`}
            >
              {imagePreview ? (
                <div className="relative w-48 h-48 mx-auto group/preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl shadow-xl shadow-primary/10"
                  />
                  <label className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-primary-hover transition-all border-none cursor-pointer transform scale-90 group-hover/preview:scale-100">
                    <Upload size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group/upload">
                  <div className="text-primary mb-4 p-4 bg-primary/10 rounded-2xl group-hover/upload:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <p className="font-bold text-text-primary uppercase tracking-tight">
                    Click to upload image
                  </p>
                  <p className="text-[0.7rem] font-bold text-text-secondary mt-1">
                    PNG, JPG or JPEG (Max 2MB)
                  </p>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            {formik.touched.image && formik.errors.image && (
              <p className="text-rose-500 text-xs font-bold ml-1 mt-1 italic animate-in fade-in slide-in-from-top-1">
                {formik.errors.image}
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3 italic">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" icon={Save} loading={loading} size="lg">
              {loading ? "Saving..." : "Update Category"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/categories")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
