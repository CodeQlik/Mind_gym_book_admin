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
      text: "text-indigo-600",
      lightBg: "bg-indigo-600/10",
      border: "border-indigo-600",
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      lightBg: "bg-emerald-500/10",
      border: "border-emerald-500",
    },
  };

  const getPlanColor = (index) => {
    const types = ["primary", "indigo", "emerald"];
    return colorClasses[types[index % types.length]];
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in font-['Outfit']">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Subscription Plans
          </h1>
          <p className="text-text-secondary mt-1">
            Choose the perfect plan to unlock the full potential of Mind Gym.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/subscribe/add")}>
          Add New Plan
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading &&
          plans.map((plan, index) => {
            const colors = plan.colorType
              ? colorClasses[plan.colorType]
              : getPlanColor(index);
            const isPremium = plan.isPremium || plan.plan_type === "one_year"; // Or any logic
            return (
              <div
                key={plan.id || plan.name}
                className={`group bg-surface/70 backdrop-blur-lg rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isPremium
                    ? `border-2 ${colors.border}`
                    : "border border-border"
                }`}
              >
                {isPremium && (
                  <div
                    className={`absolute top-8 right-[-35px] text-white px-10 py-1 rotate-45 text-[0.7rem] font-black tracking-widest shadow-lg ${colors.bg}`}
                  >
                    POPULAR
                  </div>
                )}

                <div className="flex justify-end gap-2 absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-y-[-10px] group-hover:translate-y-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/subscribe/edit/${plan.id}`);
                    }}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-primary hover:bg-primary hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer border border-white/20"
                    title="Edit Plan"
                  >
                    <Edit size={18} />
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
                          deletePlan(plan.id),
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
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer border border-white/20"
                    title="Delete Plan"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-10">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors.lightBg} ${colors.text}`}
                  >
                    <Zap size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 italic">
                    {plan.name}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-medium line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-text-primary tracking-tight">
                      ₹{plan.price}
                    </span>
                    <span className="text-text-secondary font-bold italic text-sm">
                      {plan.duration_months === 1
                        ? "/month"
                        : `/${plan.duration_months} months`}
                    </span>
                  </div>
                </div>

                <div className="flex-1 mb-10">
                  <ul className="space-y-4">
                    {(plan.features || []).map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-bold text-text-primary"
                      >
                        <CheckCircle2
                          size={20}
                          className="text-emerald-500 shrink-0"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                      <li className="text-text-secondary text-sm italic font-medium">
                        Full access included
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  variant={isPremium ? "primary" : "secondary"}
                  className="w-full"
                  size="lg"
                >
                  Get Started with {plan.name}
                </Button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Subscribe;
