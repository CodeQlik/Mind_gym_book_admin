import React from "react";

const Settings = () => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit']">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">
            Configure your dashboard preferences and account.
          </p>
        </div>
      </div>

      <div className="bg-surface/70 backdrop-blur-lg border border-white/10 p-8 rounded-[2.5rem] shadow-xl max-w-2xl">
        <div className="space-y-8 mb-10">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              General Settings
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-semibold text-text-primary">
                  Site Name
                </span>
                <input
                  type="text"
                  defaultValue="Mind Gym Book"
                  className="bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-2.5 px-4 outline-hidden transition-all text-sm font-medium text-text-primary sm:w-64"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  Enable Notifications
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 border-none cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
