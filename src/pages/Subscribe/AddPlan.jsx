import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2 } from "lucide-react";
import FormInput from "../../components/Form/FormInput";
import TextArea from "../../components/Form/TextArea";
import Button from "../../components/UI/Button";

const AddPlan = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Plan name is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .min(0, "Price cannot be negative")
      .required("Price is required"),
    description: Yup.string().required("Description is required"),
    features: Yup.array()
      .of(Yup.string().required("Feature text is required"))
      .min(1, "At least one feature is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      period: "/month",
      description: "",
      is_premium: false,
      color: "#6366f1",
      features: [""],
    },
    validationSchema,
    onSubmit: (values) => {
      const finalData = {
        ...values,
        features: values.features.filter((f) => f.trim() !== ""),
      };
      console.log("Submitting Plan:", finalData);
      // Add API logic here
      navigate("/subscribe");
    },
  });

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
            Create New Plan
          </h1>
          <p className="text-text-secondary mt-1">
            Design a new subscription tier for your readers.
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
                label="Price (₹)"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                placeholder="e.g. 999"
                required
              />
            </div>

            <TextArea
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              placeholder="Brief summary of the plan benefits..."
              required
              className="mb-8"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary ml-1">
                  Accent Color
                </label>
                <div className="relative flex items-center">
                  <input
                    type="color"
                    name="color"
                    value={formik.values.color}
                    onChange={formik.handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[54px] p-1 cursor-pointer shadow-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 md:mt-8">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="is_premium"
                    name="is_premium"
                    checked={formik.values.is_premium}
                    onChange={formik.handleChange}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-border transition-all checked:bg-primary checked:border-primary"
                  />
                  <svg
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white transition-opacity pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <label
                  htmlFor="is_premium"
                  className="text-sm font-semibold text-text-primary cursor-pointer"
                >
                  Mark as Popular / Featured Plan
                </label>
              </div>
            </div>

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
                    <Button
                      variant="outline"
                      icon={Plus}
                      onClick={() => push("")}
                      fullWidth
                      size="lg"
                      className="!border-dashed !py-5"
                    >
                      Add Another Feature
                    </Button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button type="submit" icon={Save} size="lg">
                Save Subscription Plan
              </Button>
              <Button
                variant="secondary"
                size="lg"
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

export default AddPlan;
