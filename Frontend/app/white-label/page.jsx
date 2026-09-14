"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Palette, Globe, Image as ImageIcon, Mail, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export default function WhiteLabelPage() {
  const [formData, setFormData] = useState({
    subdomain: "acme",
    customDomain: "portal.acmecorp.com",
    logoUrl: "https://via.placeholder.com/150",
    primaryColor: "#4f46e5",
    emailFrom: "noreply@acmecorp.com",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSubdomain = localStorage.getItem("subdomain");
      if (savedSubdomain) {
        setFormData((prev) => ({ ...prev, subdomain: savedSubdomain }));
        fetchWhiteLabel(savedSubdomain);
      }
    }
  }, []);

  const fetchWhiteLabel = async (subdomain) => {
    try {
      const res = await api.get(`/business/white-label?subdomain=${subdomain}`);
      if (res.data) {
        setFormData((prev) => ({
          ...prev,
          customDomain: res.data.customDomain || prev.customDomain,
          logoUrl: res.data.logoUrl || prev.logoUrl,
          primaryColor: res.data.primaryColor || prev.primaryColor,
        }));
      }
    } catch (err) {
      console.warn("Could not load business white-label settings:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/business/white-label", formData);
      setSuccess("White-label settings saved and published successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save white-label settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-7 h-7 text-teal-600" /> White-Label Customization
        </h1>
        <p className="text-sm text-slate-600">
          Rebrand the client portal with your custom domain, business logo, primary accent colors, and custom email dispatch headers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Settings */}
        <div className="card space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Branding & Domain Settings
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" /> Custom Domain
              </label>
              <input
                type="text"
                required
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="portal.yourcompany.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Logo Image URL
              </label>
              <input
                type="url"
                required
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://yourcompany.com/logo.png"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-500" /> Primary Color Hex
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email From Sender Address
              </label>
              <input
                type="email"
                required
                value={formData.emailFrom}
                onChange={(e) => setFormData({ ...formData, emailFrom: e.target.value })}
                placeholder="invoices@yourcompany.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
            >
              {loading ? "Saving Settings..." : "Save White-Label Config"}
            </button>
          </form>

          {/* CNAME Instructions */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 text-xs border border-slate-800">
            <h3 className="font-bold text-teal-400 uppercase tracking-wide">DNS CNAME Setup Instructions</h3>
            <p>To point your custom domain ({formData.customDomain}) to the SaaS platform:</p>
            <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] space-y-1 text-slate-300">
              <p>Type: <strong>CNAME</strong></p>
              <p>Host/Name: <strong>portal</strong></p>
              <p>Value/Points to: <strong>cname.clientportal.com</strong></p>
            </div>
          </div>
        </div>

        {/* Live Login Page Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" /> Live Branded Login Preview
          </h2>

          <div className="card p-8 space-y-6 border-2 border-slate-200 bg-white shadow-lg">
            <div className="text-center space-y-3">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Company Logo"
                  className="max-h-12 mx-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Your+Logo";
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl text-white font-bold text-xl flex items-center justify-center mx-auto" style={{ backgroundColor: formData.primaryColor }}>
                  {formData.subdomain?.[0]?.toUpperCase() || "B"}
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900">
                Sign in to {formData.customDomain || `${formData.subdomain}.clientportal.com`}
              </h3>
              <p className="text-xs text-slate-500">Powered by White-Label Multi-Tenant Engine</p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                disabled
                placeholder="client@company.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
              <button
                type="button"
                className="w-full text-white font-medium py-2.5 rounded-lg text-sm transition-all"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Enter Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
