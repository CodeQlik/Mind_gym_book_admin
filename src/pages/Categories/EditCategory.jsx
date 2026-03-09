import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import {
  updateCategory,
  clearCategoryError,
} from "../../store/slices/categorySlice";
import { categoryApi } from "../../api/categoryApi";
import FormInput from "../../components/Form/FormInput";
import RichTextEditor from "../../components/Form/RichTextEditor";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const EditCategory = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.categories);

  const [imagePreview, setImagePreview] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);

  const formik = useFormik({
    initialValues: { name: "", description: "", image: null },
    validationSchema: Yup.object({
      name: Yup.string().min(2).required("Name is required"),
      description: Yup.string().min(10).required("Description is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const data = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });
      const result = await dispatch(
        updateCategory({ id: categoryId, formData: data }),
      );
      if (updateCategory.fulfilled.match(result)) {
        toast.success("Category updated");
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
            const url =
              typeof category.image === "string" &&
              category.image.startsWith("{")
                ? JSON.parse(category.image).url
                : category.image.url || category.image;
            setImagePreview(url);
          }
        }
      } catch (err) {
        toast.error("Failed to load category");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCategory();
    return () => dispatch(clearCategoryError());
  }, [slug]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (initialLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/categories")}
            className="mb-2"
          >
            Back to Categories
          </Button>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Edit Category
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Update "{formik.values.name}" collection details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/categories")}>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} loading={loading} icon={Save}>
            Update Category
          </Button>
        </div>
      </div>

      <div className="w-full bg-surface border border-border/50 rounded-[2rem] p-8 sm:p-10 shadow-2xl">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <FormInput
            label="Category Name"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
            required
          />
          <RichTextEditor
            label="Description"
            value={formik.values.description}
            onChange={(val) => formik.setFieldValue("description", val)}
            error={formik.touched.description && formik.errors.description}
            required
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">
              Category Image
            </label>
            <label
              className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${imagePreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover rounded shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload
                    size={24}
                    className="text-text-secondary opacity-40"
                  />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tight">
                    Click to replace banner
                  </span>
                </div>
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {error && (
            <div className="p-3 bg-error-surface text-error border border-error/20 rounded-md text-xs font-bold uppercase">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
