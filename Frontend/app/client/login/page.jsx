"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "@/lib/api";
import { Users, Globe, Mail, KeyRound, ArrowRight } from "lucide-react";

export default function ClientLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subdomain: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/client/login", formData);

      if (res.data.token) {
        setAuthToken(res.data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem("userRole", "client");
          localStorage.setItem("subdomain", formData.subdomain);
          localStorage.setItem("clientId", res.data.clientId);
          localStorage.setItem("businessId", res.data.businessId);
        }
        router.push("/client/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Client login failed. Verify subdomain, email, and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Client Portal Login</h2>
          <p className="text-sm text-slate-600">
            Sign in with your company subdomain and client credentials
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> Business Subdomain
            </label>
            <div className="flex items-center">
              <input
                type="text"
                name="subdomain"
                required
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="acme"
                className="w-full px-3 py-2 border border-slate-300 rounded-l-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 rounded-r-lg">
                .clientportal.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Client Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="client@company.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>{loading ? "Signing in..." : "Enter Client Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
