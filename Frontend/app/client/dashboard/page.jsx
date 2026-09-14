"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Briefcase, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects/list");
      setProjects(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch projects. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-emerald-600" /> My Projects
        </h1>
        <p className="text-sm text-slate-600">
          Track real-time progress, deadlines, and status updates for your assigned deliverables.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your project list...</div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12 text-slate-500 space-y-2">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No Projects Found</p>
          <p className="text-xs">Projects assigned to your account will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const statusConfig = {
              completed: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", label: "Completed" },
              "in-progress": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", label: "In Progress" },
              pending: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", label: "Pending" },
            };

            const status = statusConfig[p.status] || statusConfig.pending;

            return (
              <div
                key={p._id}
                className="card flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{p.title}</h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border uppercase shrink-0 ${status.bg} ${status.text} ${status.border}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.description || "No specific project details available."}
                  </p>
                </div>

                <div className="pt-6 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Completion Status</span>
                      <span className="text-indigo-600">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${p.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : "Flexible"}
                    </span>
                    {p.status === "completed" && (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
