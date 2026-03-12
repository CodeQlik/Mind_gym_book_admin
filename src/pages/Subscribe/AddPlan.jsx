import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2 } from "lucide-react";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { createPlan } from "../../store/slices/planSlice";
import { toast } from "react-hot-toast";

const AddPlan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.plans);

  const planTypeOptions = [
    { value: "one_month", label: "One Month" },
    { value: "three_month", label: "Three Months" },
    { value: "one_year", label: "One Year" },
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
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      plan_type: "one_month",
      price: "",
      duration_months: 1,
      device_limit: 2,
      description: "",
      features: [""],
      is_ad_free: true,
    },
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
        };

        const resultAction = await dispatch(createPlan(payload));
        if (createPlan.fulfilled.match(resultAction)) {
          toast.success("Plan created successfully");
          navigate("/subscribe");
        } else {
          toast.error(resultAction.payload || "Failed to create plan");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    },
  });

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
            Create New Plan
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Define a new subscription model for your platform.
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
                onBlur={formik.handleBlur}
                error={formik.touched.plan_type && formik.errors.plan_type}
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  const type = e.target.value;
                  // Auto-set limits based on plan type
                  if (type === "one_month") {
                    formik.setFieldValue("device_limit", 2);
                    formik.setFieldValue("is_ad_free", true);
                  } else if (type === "three_month") {
                    formik.setFieldValue("device_limit", 3);
                    formik.setFieldValue("is_ad_free", true);
                  } else if (type === "one_year") {
                    formik.setFieldValue("device_limit", 4);
                    formik.setFieldValue("is_ad_free", true);
                  } else if (type === "free") {
                    formik.setFieldValue("device_limit", 1);
                    formik.setFieldValue("is_ad_free", false);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <div className="flex items-center gap-3 h-[72px] mt-1 pr-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_ad_free"
                    className="sr-only peer"
                    checked={formik.values.is_ad_free}
                    onChange={formik.handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-bold text-text-primary">
                    Ad-Free Experience
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
                Save Plan
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

export default AddPlan;
