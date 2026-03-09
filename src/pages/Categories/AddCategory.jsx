import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Upload, Save } from "lucide-react";
import {
  createCategory,
  clearCategoryError,
} from "../../store/slices/categorySlice";
import FormInput from "../../components/Form/FormInput";
import RichTextEditor from "../../components/Form/RichTextEditor";
import Button from "../../components/UI/Button";
import { toast } from "react-hot-toast";

const AddCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.categories);

  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: { name: "", description: "", image: null },
    validationSchema: Yup.object({
      name: Yup.string().min(2).required("Name is required"),
      description: Yup.string().min(10).required("Description is required"),
      image: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values) => {
      const data = new FormData();
      Object.entries(values).forEach(([key, val]) => data.append(key, val));
      const result = await dispatch(createCategory(data));
      if (createCategory.fulfilled.match(result)) {
        toast.success("Category created");
        navigate("/categories");
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => dispatch(clearCategoryError());
  }, [dispatch]);

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
            New Category
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Create a new genre or collection for the library.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/categories")}>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} loading={loading} icon={Save}>
            Save Category
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
              Cover Image
            </label>
            <label
              className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${imagePreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              {imagePreview ? (
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover rounded shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setImagePreview(null);
                      formik.setFieldValue("image", null);
                    }}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-md w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload
                    size={24}
                    className="text-text-secondary opacity-40"
                  />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tight">
                    Click to upload banner
                  </span>
                  <span className="text-[10px] text-text-secondary opacity-60">
                    PNG or JPG (Max 2MB)
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
            {formik.touched.image && formik.errors.image && (
              <p className="text-error text-[10px] font-bold uppercase tracking-wider ml-1">
                {formik.errors.image}
              </p>
            )}
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

export default AddCategory;
