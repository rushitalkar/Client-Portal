"use client";

import { useState, useEffect } from "react";
import api, { ensureDemoLogin } from "@/lib/api";
import { 
  Users, 
  UserPlus, 
  Key, 
  FolderPlus, 
  Briefcase, 
  Copy, 
  Check, 
  Phone, 
  Mail,
  AlertCircle
} from "lucide-react";

export default function BusinessDashboard() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Client Form Modal
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "" });
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submittingClient, setSubmittingClient] = useState(false);

  // Add Project Form Modal
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    clientId: "",
    title: "",
    description: "",
    deadline: "",
  });
  const [submittingProject, setSubmittingProject] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const clientsRes = await api.get("/client/list");
      setClients(clientsRes.data || []);

      const projectsRes = await api.get("/projects/list");
      setProjects(projectsRes.data || []);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to load dashboard data. Please log in.";
      if (errMsg.toLowerCase().includes("token")) {
        const autoToken = await ensureDemoLogin();
        if (autoToken) {
          const clientsRes = await api.get("/client/list");
          setClients(clientsRes.data || []);
          const projectsRes = await api.get("/projects/list");
          setProjects(projectsRes.data || []);
          return;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSubmittingClient(true);
    setError("");
    try {
      const res = await api.post("/client/register", clientForm);
      if (res.data.plainPassword) {
        setGeneratedPassword(res.data.plainPassword);
      }
      setClientForm({ name: "", email: "", phone: "" });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register client.");
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmittingProject(true);
    setError("");
    try {
      await api.post("/projects/create", projectForm);
      setShowAddProject(false);
      setProjectForm({ clientId: "", title: "", description: "", deadline: "" });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project.");
    } finally {
      setSubmittingProject(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Business Management Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Register client accounts, assign password credentials, and monitor project workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddClient(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
          <button
            onClick={() => setShowAddProject(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FolderPlus className="w-4 h-4" /> Create Project
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Password Alert Banner */}
      {generatedPassword && (
        <div className="p-5 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 text-base">
              <Key className="w-5 h-5 text-amber-600" /> Client Registered Successfully!
            </h3>
            <button
              onClick={() => setGeneratedPassword(null)}
              className="text-xs text-amber-700 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-sm text-amber-800">
            Share these plain text login credentials with your client so they can access their dashboard:
          </p>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-amber-200 max-w-md">
            <code className="text-lg font-mono font-bold text-indigo-600 flex-1">
              {generatedPassword}
            </code>
            <button
              onClick={() => copyToClipboard(generatedPassword)}
              className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Password"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Registered Clients Table */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Registered Clients ({clients.length})
          </h2>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <p>No clients registered yet.</p>
            <button
              onClick={() => setShowAddClient(true)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Click here to register your first client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Client Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="p-3 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || "N/A"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setProjectForm((prev) => ({ ...prev, clientId: c._id }));
                          setShowAddProject(true);
                        }}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded font-medium border border-indigo-200"
                      >
                        + Add Project
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Projects Overview */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" /> Active Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-sm">No active projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p._id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900">{p.title}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                    p.status === "completed"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : p.status === "in-progress"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{p.description || "No description provided."}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-1 flex items-center justify-between border-t border-slate-200">
                  <span>Client: <strong>{p.clientId?.name || "Unassigned"}</strong></span>
                  <span>Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Register Client Account
              </h3>
              <button
                onClick={() => setShowAddClient(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Client Full Name
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Suresh Kumar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="xyz@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+91234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClient}
                  className="btn-primary text-sm"
                >
                  {submittingClient ? "Generating..." : "Register & Generate Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" /> Create Client Project
              </h3>
              <button
                onClick={() => setShowAddProject(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Client
                </label>
                <select
                  required
                  value={projectForm.clientId}
                  onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Website Redesign & Audit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project deliverables and timeline"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className="btn-primary text-sm"
                >
                  {submittingProject ? "Saving..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
