import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2 } from "lucide-react";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans, updatePlan } from "../../store/slices/planSlice";
import { toast } from "react-hot-toast";

const EditPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.plans);

  const safeParseFeatures = (features) => {
    if (Array.isArray(features)) return features;
    if (typeof features === "string" && features.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        /* proceed to fallback */
      }
    }
    return features ? [features] : [""];
  };

  const planToEdit = plans.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(fetchPlans());
    }
  }, [dispatch, plans.length]);

  const planTypeOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" },
    { value: "free", label: "Free" },
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Plan name is required"),
    plan_type: Yup.string().required("Plan type is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .min(0, "Price cannot be negative")
      .required("Price is required"),
    duration_months: Yup.number()
      .typeError("Duration must be a number")
      .min(1, "Duration must be at least 1 month")
      .required("Duration is required"),
    description: Yup.string().required("Description is required"),
    device_limit: Yup.number()
      .typeError("Device limit must be a number")
      .min(1, "Limit must be at least 1 device")
      .required("Device limit is required"),
    features: Yup.array().of(Yup.string().required("Feature text is required")),
    is_ad_free: Yup.boolean(),
    is_popular: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      name: planToEdit?.name || "",
      plan_type: planToEdit?.plan_type || "monthly",
      price: planToEdit?.price || "",
      duration_months: planToEdit?.duration_months || 1,
      device_limit: planToEdit?.device_limit || 1,
      description: planToEdit?.description || "",
      features: safeParseFeatures(planToEdit?.features),
      is_ad_free: planToEdit?.is_ad_free ?? true,
      is_popular: planToEdit?.is_popular ?? false,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          plan_type: values.plan_type,
          price: Number(values.price),
          duration_months: Number(values.duration_months),
          device_limit: Number(values.device_limit),
          description: values.description,
          features: values.features.filter((f) => f.trim() !== ""),
          is_ad_free: values.is_ad_free,
          is_popular: values.is_popular,
        };

        const resultAction = await dispatch(
          updatePlan({ id, planData: payload }),
        );
        if (updatePlan.fulfilled.match(resultAction)) {
          toast.success("Plan updated successfully");
          navigate("/subscribe");
        } else {
          toast.error(resultAction.payload || "Failed to update plan");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    },
  });

  if (!planToEdit && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-text-secondary font-bold">Plan not found</p>
        <Button onClick={() => navigate("/subscribe")}>Back to Plans</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-10">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/subscribe")}
        >
          Back to Options
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Edit Subscription Plan
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Update the existing subscription tier details.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="w-full">
          <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormInput
                label="Plan Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name}
                placeholder="e.g. Pro Premium"
                required
              />
              <FormInput
                label="Plan Type"
                name="plan_type"
                type="select"
                options={planTypeOptions}
                value={formik.values.plan_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.plan_type && formik.errors.plan_type}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <FormInput
                label="Price (₹)"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                placeholder="0"
                required
              />
              <FormInput
                label="Duration (Months)"
                name="duration_months"
                type="number"
                value={formik.values.duration_months}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.duration_months &&
                  formik.errors.duration_months
                }
                placeholder="1"
                required
              />
              <FormInput
                label="Device Limit"
                name="device_limit"
                type="number"
                value={formik.values.device_limit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.device_limit && formik.errors.device_limit
                }
                placeholder="1"
                required
              />
            </div>

            <div className="bg-background/40 border border-border/60 rounded-xl p-4 flex flex-wrap items-center gap-10 mb-8 ml-1 w-fit">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_ad_free"
                    className="sr-only peer"
                    checked={formik.values.is_ad_free}
                    onChange={formik.handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-xs font-bold text-text-primary uppercase tracking-wider">
                    Ad-Free Experience
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_popular"
                    className="sr-only peer"
                    checked={formik.values.is_popular}
                    onChange={formik.handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-xs font-bold text-text-primary uppercase tracking-wider">
                    Display Popular Tag
                  </span>
                </label>
              </div>
            </div>


            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              placeholder="What does this plan offer?"
              required
              className="mb-6"
            />

            <div className="space-y-4 mb-8">
              <label className="text-sm font-bold text-text-primary ml-1 block">
                Plan Features
              </label>

              <FieldArray name="features">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {(Array.isArray(formik.values.features)
                      ? formik.values.features
                      : []
                    ).map((_, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            name={`features.${index}`}
                            value={formik.values.features[index]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g. Unlimited Book Access"
                            className={`w-full bg-background border ${
                              formik.touched.features?.[index] &&
                              formik.errors.features?.[index]
                                ? "border-rose-500"
                                : "border-border"
                            } rounded-xl py-2.5 px-4 outline-hidden focus:border-primary transition-all text-sm font-medium text-text-primary`}
                          />
                          {formik.touched.features?.[index] &&
                            formik.errors.features?.[index] && (
                              <p className="text-red-500 text-[10px] mt-1 ml-1">
                                {formik.errors.features[index]}
                              </p>
                            )}
                        </div>
                        {formik.values.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2.5 rounded-lg bg-error-surface text-error hover:bg-error hover:text-white transition-colors border-none cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline ml-1"
                    >
                      <Plus size={14} /> Add Another Feature
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
              <Button
                type="submit"
                icon={Save}
                loading={loading}
                className="flex-1"
              >
                Update Plan
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/subscribe")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default EditPlan;
