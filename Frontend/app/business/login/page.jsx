"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "@/lib/api";
import { Building2, KeyRound, Mail, Globe, ArrowRight, CheckCircle } from "lucide-react";

export default function BusinessLogin() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    ownerEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        const res = await api.post("/business/register", formData);
        setSuccess("Business registered successfully! Please sign in.");
        setIsRegister(false);
      } else {
        const res = await api.post("/business/login", {
          subdomain: formData.subdomain,
          ownerEmail: formData.ownerEmail,
          password: formData.password,
        });

        if (res.data.token) {
          setAuthToken(res.data.token);
          if (typeof window !== "undefined") {
            localStorage.setItem("userRole", "business");
            localStorage.setItem("subdomain", formData.subdomain);
            localStorage.setItem("businessId", res.data.businessId);
          }
          router.push("/business/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isRegister ? "Register Business" : "Business Owner Login"}
          </h2>
          <p className="text-sm text-slate-600">
            {isRegister
              ? "Create your business portal with custom subdomain"
              : "Access your business dashboard and client directory"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Subdomain
            </label>
            <div className="flex items-center">
              <input
                type="text"
                name="subdomain"
                required
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="acme"
                className="w-full px-3 py-2 border border-slate-300 rounded-l-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 rounded-r-lg">
                .clientportal.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Owner Email
            </label>
            <input
              type="email"
              name="ownerEmail"
              required
              value={formData.ownerEmail}
              onChange={handleChange}
              placeholder="owner@acme.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
          >
            <span>{loading ? "Processing..." : isRegister ? "Create Business" : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            {isRegister
              ? "Already have a business? Sign in here"
              : "Need a business account? Register new business"}
          </button>
        </div>
      </div>
    </div>
  );
}
