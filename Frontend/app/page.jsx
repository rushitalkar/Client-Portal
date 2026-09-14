"use client";

import Link from "next/link";
import { 
  Building2, 
  Users, 
  Receipt, 
  FileCheck, 
  Calendar, 
  Palette, 
  FileCode2, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const portalOptions = [
    {
      title: "Business Management Portal",
      subtitle: "For Business Owners & Service Providers",
      desc: "Register your business subdomain, add new clients, auto-generate login credentials, and assign project deliverables.",
      href: "/business/login",
      dashboardHref: "/business/dashboard",
      icon: Building2,
      badge: "Business Role",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      btnColor: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      title: "Client Portal",
      subtitle: "For Clients & End Customers",
      desc: "Sign in with your company subdomain to view active projects, real-time progress bars, due dates, and status updates.",
      href: "/client/login",
      dashboardHref: "/client/dashboard",
      icon: Users,
      badge: "Client Role",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      btnColor: "bg-emerald-600 hover:bg-emerald-700",
    },
  ];

  const features = [
    {
      title: "Invoices & Stripe Payment Links",
      desc: "Upload PDF invoices, generate live Stripe Checkout payment links, and dispatch notifications over WhatsApp.",
      href: "/invoices/send",
      icon: Receipt,
      iconBg: "bg-indigo-500",
    },
    {
      title: "Tally ERP / Prime XML Sync",
      desc: "Upload Tally XML voucher exports to automatically parse invoices, GST tax breakdowns (18%), and e-invoice QR codes.",
      href: "/tally",
      icon: FileCode2,
      iconBg: "bg-purple-500",
    },
    {
      title: "Document eSign (Aadhaar OTP)",
      desc: "Request digital signatures on compliance contracts using 12-digit Aadhaar verification and 2-step OTP verification.",
      href: "/esign",
      icon: FileCheck,
      iconBg: "bg-amber-500",
    },
    {
      title: "GST Compliance Workflows",
      desc: "Statutory calendar for Indian GST return deadlines (GSTR-1, GSTR-3B) with automated project creation 3 days prior.",
      href: "/workflows",
      icon: Calendar,
      iconBg: "bg-rose-500",
    },
    {
      title: "White-Label Portal Branding",
      desc: "Rebrand your client portal with custom domains, custom business logo, primary accent color palette, and live preview.",
      href: "/white-label",
      icon: Palette,
      iconBg: "bg-teal-500",
    },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-5 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Multi-Tenant Client Portal & Enterprise SaaS Platform</span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl leading-tight">
          Manage Clients, Invoices & Stripe Payments Seamlessly
        </h1>

        <p className="text-base text-slate-600 leading-relaxed">
          A full-stack multi-tenant platform equipped with custom subdomains, Stripe Checkout payment links, WhatsApp dispatch, Tally XML import, Aadhaar eSign, and automated GST compliance workflows.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/business/login"
            className="w-full sm:w-auto btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Access Business Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/client/login"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Client Portal Login</span>
          </Link>
        </div>
      </div>

      {/* Main Portals Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Select Your Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Choose an option below to enter your workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {portalOptions.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="card border-2 hover:border-indigo-300 transition-all shadow-md hover:shadow-lg flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{p.subtitle}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Link
                    href={p.href}
                    className={`w-full text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${p.btnColor}`}
                  >
                    <span>Sign In to {p.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={p.dashboardHref}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1 transition-colors text-center"
                  >
                    View Dashboard Directly →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Modules Grid */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Platform Features & Tools</h2>
          <p className="text-xs text-slate-500">All tools are live and connected to the backend API</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                href={f.href}
                className="group card hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center ${f.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Feature →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Platform Capabilities Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-6 h-6" /> Enterprise Multi-Tenant Architecture
          </h3>
          <p className="text-sm text-slate-300">
            Built strictly according to developer build sheet specification with Node.js/Express, MongoDB, and Next.js (App Router).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold text-sm">Stripe Payment Gateway</strong>
              Generates Stripe Checkout links, handles webhooks, and updates payment status in MongoDB (`paid`).
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold text-sm">WhatsApp & Tally Sync</strong>
              Sends invoice PDFs and payment links over WhatsApp. Parses Tally XML exports into invoices with GST QR codes.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold text-sm">Aadhaar eSign & GST Rules</strong>
              2-step Aadhaar OTP signature flow and automated project creation 3 days before statutory GST return dates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
