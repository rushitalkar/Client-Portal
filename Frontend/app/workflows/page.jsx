"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Calendar, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FolderPlus } from "lucide-react";

export default function WorkflowsPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [triggeringAuto, setTriggeringAuto] = useState(false);

  useEffect(() => {
    fetchWorkflowDeadlines();
  }, []);

  const fetchWorkflowDeadlines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/workflows/gst-deadlines");
      setDeadlines(res.data.schedules || []);

      // Fetch projects & clients for current workflow status
      const projectsRes = await api.get("/projects/list");
      setCreatedProjects(projectsRes.data || []);

      const clientMap = new Map();
      (projectsRes.data || []).forEach((p) => {
        if (p.clientId && p.clientId._id) {
          clientMap.set(p.clientId._id, p.clientId);
        }
      });
      setClients(Array.from(clientMap.values()));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch GST workflow deadlines.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAutoProjects = async () => {
    setTriggeringAuto(true);
    setError("");
    setSuccess("");
    try {
      const businessId = typeof window !== "undefined" ? localStorage.getItem("businessId") : "";
      const firstClient = clients[0]?._id || "";

      if (!firstClient) {
        setError("Please add at least one client in Business Dashboard before auto-triggering GST projects.");
        setTriggeringAuto(false);
        return;
      }

      const res = await api.get(`/workflows/gst-deadlines?autoCreate=true&businessId=${businessId}&clientId=${firstClient}`);
      setSuccess(`Automated Compliance Engine activated! Created ${res.data.createdProjects?.length || 0} projects scheduled 3 days before GST deadlines.`);
      fetchWorkflowDeadlines();
    } catch (err) {
      setError("Failed to auto-create deadline projects.");
    } finally {
      setTriggeringAuto(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-rose-600" /> GST Statutory Compliance Workflows
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Statutory calendar for Indian GST returns & automated project creation 3 days before due dates.
          </p>
        </div>
        <button
          onClick={handleTriggerAutoProjects}
          disabled={triggeringAuto}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Sparkles className={`w-4 h-4 ${triggeringAuto ? "animate-spin" : ""}`} />
          <span>{triggeringAuto ? "Triggering Engine..." : "Auto-Create GST Projects (-3 Days)"}</span>
        </button>
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

      {/* Deadlines Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deadlines.map((d) => (
          <div key={d.returnType} className="card bg-white border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 uppercase">
                {d.frequency}
              </span>
              <span className="text-xs text-slate-500 font-semibold">-3 Days Auto Trigger</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{d.returnType}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Due Date: {d.dueDate}</p>
            </div>
            <div className="pt-2 text-xs text-slate-600 border-t border-slate-100 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Target: {d.dueDay}th of the month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Generated Workflow Projects Table */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-rose-600" /> Automated Compliance Projects ({createdProjects.length})
        </h2>

        {createdProjects.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">
            No compliance projects active. Click "Auto-Create GST Projects" above to automatically generate tasks 3 days prior to filing deadlines.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Workflow Task</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {createdProjects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{p.title}</td>
                    <td className="p-3 font-medium text-slate-800">{p.clientId?.name || "All Clients"}</td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString() : "Statutory"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-rose-600 h-2 rounded-full"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                        {p.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
