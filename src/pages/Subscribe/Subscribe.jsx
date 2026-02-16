import React from "react";
import { Zap, CheckCircle2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";

const Subscribe = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Starter",
      price: "₹499",
      period: "/month",
      description: "Perfect for individuals starting their reading journey.",
      features: [
        "Access to 500+ Books",
        "Standard PDF Viewing",
        "Basic Analytics",
      ],
      colorType: "primary",
      isPremium: false,
    },
    {
      name: "Pro Premium",
      price: "₹999",
      period: "/month",
      description: "Our most popular plan for avid readers.",
      features: [
        "Unlimited Books",
        "Premium PDF Viewer",
        "Offline Downloads",
        "Advanced Analytics",
        "Early Access",
      ],
      colorType: "indigo",
      isPremium: true,
    },
    {
      name: "Enterprise",
      price: "₹4999",
      period: "/month",
      description: "For institutions and large reading clubs.",
      features: [
        "Everything in Pro",
        "Bulk User Management",
        "Custom Branding",
        "API Access",
        "24/7 Support",
      ],
      colorType: "emerald",
      isPremium: false,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const colors = colorClasses[plan.colorType];
          return (
            <div
              key={plan.name}
              className={`bg-surface/70 backdrop-blur-lg rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.isPremium
                  ? `border-2 ${colors.border}`
                  : "border border-border"
              }`}
            >
              {plan.isPremium && (
                <div
                  className={`absolute top-8 right-[-35px] text-white px-10 py-1 rotate-45 text-[0.7rem] font-black tracking-widest shadow-lg ${colors.bg}`}
                >
                  POPULAR
                </div>
              )}

              <div className="mb-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors.lightBg} ${colors.text}`}
                >
                  <Zap size={28} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2 italic">
                  {plan.name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  {plan.description}
                </p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-text-primary tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-text-secondary font-bold italic text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="flex-1 mb-10">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm font-bold text-text-primary"
                    >
                      <CheckCircle2
                        size={20}
                        className="text-emerald-500 shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.isPremium ? "primary" : "secondary"}
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
