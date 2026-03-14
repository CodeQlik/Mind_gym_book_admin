import React, { useState, useEffect } from "react";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import {
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import settingApi from "../../api/settingApi";

const Settings = () => {
  const [formData, setFormData] = useState({
    site_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    copyright_text: "",
  });
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingApi.getSettings();
      if (response.success) {
        setFormData({
          site_name: response.data.site_name || "",
          contact_email: response.data.contact_email || "",
          contact_phone: response.data.contact_phone || "",
          address: response.data.address || "",
          copyright_text: response.data.copyright_text || "",
        });
        setPreviews({
          logo: response.data.logo?.url || null,
          favicon: response.data.favicon?.url || null,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "logo") {
        setLogo(file);
        setPreviews((prev) => ({ ...prev, logo: URL.createObjectURL(file) }));
      } else {
        setFavicon(file);
        setPreviews((prev) => ({ ...prev, favicon: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (logo) data.append("logo", logo);
      if (favicon) data.append("favicon", favicon);

      const response = await settingApi.updateSettings(data);
      if (response.success) {
        toast.success("Settings updated successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">Loading Settings...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            General Settings
          </h1>
          <p className="text-text-secondary text-sm">
            Manage your website's basic information and branding.
          </p>
        </div>
        <Button onClick={handleSave} icon={Save} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Globe size={16} className="text-primary" />
            Website Info
          </h3>
          
          <FormInput
            label="Site Name"
            name="site_name"
            value={formData.site_name}
            onChange={handleChange}
            placeholder="Enter site name"
          />

          <FormInput
            label="Copyright Text"
            name="copyright_text"
            value={formData.copyright_text}
            onChange={handleChange}
            placeholder="e.g. © 2026 Mind Gym Book"
            icon={FileText}
          />
        </div>

        {/* Contact Information */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Mail size={16} className="text-primary" />
            Contact Details
          </h3>

          <FormInput
            label="Contact Email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            placeholder="support@domain.com"
            icon={Mail}
          />

          <FormInput
            label="Contact Phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="+1 234 567 890"
            icon={Phone}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Address</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-text-secondary">
                <MapPin size={18} />
              </span>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary transition-colors min-h-[100px]"
                placeholder="Enter physical address"
              />
            </div>
          </div>
        </div>

        {/* Branding (Logo & Favicon) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Upload size={16} className="text-primary" />
            Branding Assets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Logo Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                Website Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden bg-background">
                  {previews.logo ? (
                    <img src={previews.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload size={24} className="mx-auto text-text-secondary opacity-40 mb-2" />
                      <span className="text-[10px] text-text-secondary font-medium">No Logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 cursor-pointer transition-all"
                  >
                    <Upload size={14} />
                    Choose New Logo
                  </label>
                  <p className="text-[10px] text-text-secondary">Recommended size: 512x512px (PNG/SVG)</p>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                Favicon (Browser Icon)
              </label>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden bg-background">
                  {previews.favicon ? (
                    <img src={previews.favicon} alt="Favicon Preview" className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload size={20} className="mx-auto text-text-secondary opacity-40 mb-1" />
                      <span className="text-[9px] text-text-secondary font-medium">No Icon</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    id="favicon-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "favicon")}
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 cursor-pointer transition-all"
                  >
                    <Upload size={14} />
                    Choose Favicon
                  </label>
                  <p className="text-[10px] text-text-secondary">Recommended size: 32x32px or 64x64px</p>
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
