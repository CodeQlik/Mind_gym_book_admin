import React, { useState } from "react";
import FormInput from "../../components/Form/FormInput";
import Toggle from "../../components/Form/Toggle";
import Button from "../../components/UI/Button";
import {
  Save,
  Settings as SettingsIcon,
  Bell,
  Globe,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Settings = () => {
  const [siteName, setSiteName] = useState("Mind Gym Book");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            System Settings
          </h1>
          <p className="text-text-secondary text-sm">
            Configure your dashboard preferences and global application
            settings.
          </p>
        </div>
        <Button onClick={handleSave} icon={Save}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Globe size={16} className="text-primary" />
              General Configuration
            </h3>

            <div className="space-y-6 max-w-xl">
              <FormInput
                label="Application Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Enter site name"
              />

              <FormInput
                label="Support Email"
                defaultValue="support@mindgym.com"
                placeholder="e.g. support@domain.com"
              />

              <FormInput
                label="Default Currency"
                type="select"
                defaultValue="INR"
                options={[
                  { value: "INR", label: "₹ Indian Rupee (INR)" },
                  { value: "USD", label: "$ US Dollar (USD)" },
                  { value: "EUR", label: "€ Euro (EUR)" },
                ]}
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Bell size={16} className="text-primary" />
              Communication
            </h3>

            <div className="space-y-4 max-w-xl">
              <Toggle
                label="Push Notifications"
                description="Enable browser and app notifications"
                checked={notifEnabled}
                onChange={() => setNotifEnabled(!notifEnabled)}
              />
              <div className="h-px bg-border my-2" />
              <Toggle
                label="Email Alerts"
                description="Receive daily summary reports"
                checked={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar/Security Info */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Shield size={16} className="text-primary" />
              Security & status
            </h3>

            <div className="space-y-6">
              <Toggle
                label="Maintenance Mode"
                description="Temporarily disable public access"
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] uppercase font-bold text-text-secondary mb-2 opacity-60">
                  Last Updated
                </p>
                <p className="text-xs font-medium text-text-primary">
                  Feb 26, 2026 at 11:30 PM
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] uppercase font-bold text-text-secondary mb-2 opacity-60">
                  API Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-bold text-success uppercase tracking-wider">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
