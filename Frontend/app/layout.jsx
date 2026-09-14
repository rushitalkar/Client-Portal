"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Receipt, 
  FileCheck, 
  Calendar, 
  Palette, 
  FileCode2, 
  LogOut,
  Sparkles
} from "lucide-react";
import { clearAuthToken } from "@/lib/api";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("userRole"));
      setSubdomain(localStorage.getItem("subdomain") || "");
    }
  }, [pathname]);

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Business ", href: "/business/dashboard", icon: Building2, roles: ["business"] },
    { name: "Client ", href: "/client/dashboard", icon: Users, roles: ["client"] },
    { name: "Tally ", href: "/tally", icon: FileCode2 },
    { name: "Invoices & WhatsApp", href: "/invoices/send", icon: Receipt },
    { name: "eSign ", href: "/esign", icon: FileCheck },
    { name: "GST ", href: "/workflows", icon: Calendar },
    { name: "White Label", href: "/white-label", icon: Palette },
  ];

  return (
    <html lang="en">
      <head>
        <title>Client Portal - Multi-Tenant SaaS</title>
        <meta name="description" content="Multi-tenant client portal and SaaS application" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight text-indigo-400">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <span>ClientPortal<span className="text-white">SaaS</span></span>
                </Link>
                {subdomain && (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Subdomain: {subdomain}
                  </span>
                )}
              </div>

              <nav className="hidden md:flex items-center space-x-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-center space-x-1.5 pl-1 pr-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center space-x-3">
                {!role ? (
                  <div className="flex items-center space-x-2">
                    <Link href="/business/login" className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Business Portal
                    </Link>
                    <Link href="/client/login" className="text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium border border-slate-700 transition-colors">
                      Client Login
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs capitalize font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      Role: {role}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-xs bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-2.5 py-1.5 rounded transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile subnav */}
          <div className="md:hidden overflow-x-auto border-t border-slate-800 py-2 px-4 flex space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-300 bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
          <p>© 2026 Multi-tenant Client Portal & SaaS Platform. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
