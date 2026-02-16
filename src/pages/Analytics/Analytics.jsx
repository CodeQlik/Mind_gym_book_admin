import React from "react";

const Analytics = () => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-['Outfit']">
            Advanced Analytics
          </h1>
          <p className="text-text-secondary mt-1">
            Deep dive into your data and performance metrics.
          </p>
        </div>
      </div>
      <div className="bg-surface/70 backdrop-blur-lg border border-white/10 p-10 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4 font-['Outfit']">
          Detailed Reports Coming Soon
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          We're working on more comprehensive analytics charts for Mind Gym.
          Stay tuned for deeper insights!
        </p>
      </div>
    </div>
  );
};

export default Analytics;
