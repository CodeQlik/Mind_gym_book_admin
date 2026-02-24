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

  const planToEdit = plans.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(fetchPlans());
    }
  }, [dispatch, plans.length]);

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
    features: Yup.array().of(Yup.string().required("Feature text is required")),
  });

  const formik = useFormik({
    initialValues: {
      name: planToEdit?.name || "",
      plan_type: planToEdit?.plan_type || "one_month",
      price: planToEdit?.price || "",
      duration_months: planToEdit?.duration_months || 1,
      description: planToEdit?.description || "",
      features: planToEdit?.features || [""],
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
          description: values.description,
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
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit']">
      <div className="flex items-center gap-4">
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
          <h1 className="text-3xl font-bold text-text-primary">
            Edit Subscription Plan
          </h1>
          <p className="text-text-secondary mt-1">
            Modify the details of your subscription tier.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="max-w-[800px]">
          <div className="bg-surface/70 backdrop-blur-lg border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <FormInput
                label="Price (₹)"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                placeholder="e.g. 199"
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
                placeholder="e.g. 1"
                required
              />
            </div>

            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              placeholder="Brief summary of the plan benefits..."
              required
              className="mb-8"
            />

            <div className="space-y-4 mb-10">
              <label className="text-sm font-semibold text-text-primary ml-1">
                Plan Features
              </label>

              <FieldArray name="features">
                {({ push, remove }) => (
                  <div className="flex flex-col gap-4">
                    {formik.values.features.map((_, index) => (
                      <div key={index}>
                        <div className="flex gap-3">
                          <div className="flex items-center justify-center text-primary mt-3.5">
                            <CheckCircle2 size={20} />
                          </div>
                          <input
                            type="text"
                            name={`features.${index}`}
                            value={formik.values.features[index]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g. Unlimited Book Access"
                            className={`flex-1 bg-white dark:bg-slate-900 border ${
                              formik.touched.features?.[index] &&
                              formik.errors.features?.[index]
                                ? "border-rose-500"
                                : "border-slate-200 dark:border-slate-800"
                            } rounded-xl py-3 px-5 outline-hidden focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 shadow-sm`}
                          />
                          {formik.values.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                        {formik.touched.features?.[index] &&
                          formik.errors.features?.[index] && (
                            <p className="text-red-500 text-xs mt-1 ml-8">
                              {formik.errors.features[index]}
                            </p>
                          )}
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        type="button"
                        icon={Plus}
                        onClick={() => push("")}
                        size="md"
                        className="!border-dashed !px-8 hover:!border-primary transition-all"
                      >
                        Add Another Feature
                      </Button>
                    </div>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button type="submit" icon={Save} size="lg" loading={loading}>
                Update Subscription Plan
              </Button>
              <Button
                variant="secondary"
                size="lg"
                type="button"
                onClick={() => navigate("/subscribe")}
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
