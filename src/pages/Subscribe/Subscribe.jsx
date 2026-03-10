import React from "react";
import { Zap, CheckCircle2, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPlans, deletePlan } from "../../store/slices/planSlice";
import { toast } from "react-hot-toast";

const Subscribe = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.plans);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const colorClasses = {
    primary: {
      bg: "bg-primary",
      text: "text-primary",
      lightBg: "bg-primary/10",
      border: "border-primary",
    },
    indigo: {
      bg: "bg-indigo-600",
      text: "text-primary",
      lightBg: "bg-indigo-600/10",
      border: "border-indigo-600",
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-success",
      lightBg: "bg-success-surface",
      border: "border-emerald-500",
    },
  };

  const getPlanColor = (index) => {
    const types = ["primary", "indigo", "emerald"];
    return colorClasses[types[index % types.length]];
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Manage your service tiers and pricing.
          </p>
        </div>
        <Button
          icon={Plus}
          size="md"
          onClick={() => navigate("/subscribe/add")}
        >
          Add New Plan
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && Array.isArray(plans) && plans.length > 0
          ? plans.map((plan, index) => {
              const colors =
                plan && plan.colorType && colorClasses[plan.colorType]
                  ? colorClasses[plan.colorType]
                  : getPlanColor(index);
              const isPremium =
                plan && (plan.isPremium || plan.plan_type === "one_year");
              return (
                <div
                  key={plan ? plan.id || plan.name : index}
                  className={`group bg-surface border rounded-2xl p-8 flex flex-col relative transition-all duration-300 hover:shadow-md min-h-[440px] ${
                    isPremium
                      ? `border-primary/50 ring-1 ring-primary/10 shadow-sm shadow-primary/5`
                      : "border-border"
                  }`}
                >
                  {isPremium && (
                    <div
                      className={`absolute top-4 right-4 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${colors.bg}`}
                    >
                      POPULAR
                    </div>
                  )}

                  <div className="flex justify-end gap-1.5 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/subscribe/edit/${plan?.id}`);
                      }}
                      className="p-2 rounded-lg bg-background border border-border text-text-primary hover:text-primary transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this plan?",
                          )
                        ) {
                          const resultAction = await dispatch(
                            deletePlan(plan?.id),
                          );
                          if (deletePlan.fulfilled.match(resultAction)) {
                            toast.success("Plan deleted successfully");
                          } else {
                            toast.error(
                              resultAction.payload || "Failed to delete plan",
                            );
                          }
                        }
                      }}
                      className="p-2 rounded-lg bg-background border border-border text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-8">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors.lightBg} ${colors.text}`}
                    >
                      <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {plan?.name}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                      {plan?.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-text-primary">
                          ₹{plan?.price}
                        </span>
                        <span className="text-text-secondary font-medium text-xs">
                          / {plan?.duration_months} month
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/10">
                          <span>
                            Max {plan?.device_limit || 1} Device
                            {plan?.device_limit > 1 ? "s" : ""}
                          </span>
                        </div>
                        {plan?.is_ad_free && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 size={10} />
                            <span>Ad-Free</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-2.5">
                      {(() => {
                        const features = Array.isArray(plan?.features)
                          ? plan.features
                          : typeof plan?.features === "string" &&
                              plan.features.trim().startsWith("[")
                            ? (() => {
                                try {
                                  const parsed = JSON.parse(plan.features);
                                  return Array.isArray(parsed) ? parsed : [];
                                } catch (e) {
                                  return [plan.features];
                                }
                              })()
                            : plan?.features
                              ? [plan.features]
                              : [];

                        if (features.length === 0) {
                          return (
                            <li className="text-text-secondary text-sm italic">
                              Full access included
                            </li>
                          );
                        }

                        return features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-text-primary"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-success mt-0.5 shrink-0"
                            />
                            <span>{feature}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>

                  <Button
                    variant={isPremium ? "primary" : "secondary"}
                    className="w-full"
                    size="md"
                  >
                    Manage {plan?.name}
                  </Button>
                </div>
              );
            })
          : !loading && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-surface border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 text-text-secondary/20">
                  <Zap size={32} />
                </div>
                <p className="text-text-primary font-bold">No Plans Active</p>
                <p className="text-text-secondary text-sm mt-1 max-w-[200px]">
                  You haven't added any subscription plans yet.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate("/subscribe/add")}
                  className="mt-6"
                >
                  Create First Plan
                </Button>
              </div>
            )}
      </div>
    </div>
  );
};

export default Subscribe;
