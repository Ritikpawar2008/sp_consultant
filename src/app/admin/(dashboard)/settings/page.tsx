"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

interface SiteSettings {
  business_name?: string;
  tagline?: string;
  business_description?: string;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  service_area?: string;
  office_address?: string;
  map_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  footer_text?: string;
  copyright_text?: string;
  [key: string]: string | undefined;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setSettings(data.data || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save settings");

      setSuccess("Settings saved successfully.");
      await fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
      
      // Auto-hide success message
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Site Settings</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage business information and website-wide contact details.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#126ce5] text-white rounded-xl text-sm font-bold hover:bg-[#0e5bc0] shadow-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? <Icon name="spinner" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <Icon name="alert-circle" className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <Icon name="check" className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Forms Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Icon name="spinner" className="w-6 h-6 animate-spin mb-2" />
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
            {/* Business Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#09295a]">Business Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Company Name</label>
                  <input
                    type="text"
                    name="business_name"
                    value={settings.business_name || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="e.g. S.P. Consultant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={settings.tagline || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="e.g. Your Trust, Our Responsibility"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Business Description</label>
                  <textarea
                    rows={4}
                    name="business_description"
                    value={settings.business_description || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-y"
                    placeholder="Short description for SEO and general usage..."
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#09295a]">Social Links</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Facebook URL</label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={settings.facebook_url || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Instagram URL</label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={settings.instagram_url || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={settings.linkedin_url || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#09295a]">Contact Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Primary Phone</label>
                    <input
                      type="text"
                      name="primary_phone"
                      value={settings.primary_phone || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. +91 8605998053"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Secondary Phone</label>
                    <input
                      type="text"
                      name="secondary_phone"
                      value={settings.secondary_phone || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. contact@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Service Area</label>
                  <input
                    type="text"
                    name="service_area"
                    value={settings.service_area || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="e.g. Palghar, Virar & surrounding areas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Office Address</label>
                  <textarea
                    rows={3}
                    name="office_address"
                    value={settings.office_address || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-y"
                    placeholder="Full office address..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Google Maps URL</label>
                  <input
                    type="url"
                    name="map_url"
                    value={settings.map_url || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Website / Footer */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#09295a]">Website & Footer</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Footer Text</label>
                  <textarea
                    rows={3}
                    name="footer_text"
                    value={settings.footer_text || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Copyright Text</label>
                  <input
                    type="text"
                    name="copyright_text"
                    value={settings.copyright_text || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    placeholder="© 2026 S.P Consultant. All rights reserved."
                  />
                </div>
              </div>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
