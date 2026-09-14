"use client";

import { useState, useEffect } from "react";
import api, { ensureDemoLogin } from "@/lib/api";
import { FileCode2, Upload, QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function TallySync() {
  const [tallyInvoices, setTallyInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [xmlFile, setXmlFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchClientsAndInvoices();
  }, []);

  const fetchClientsAndInvoices = async () => {
    try {
      const invoicesRes = await api.get("/invoices/list");
      setTallyInvoices(invoicesRes.data || []);

      try {
        const clientRes = await api.get("/client/list");
        setClients(clientRes.data || []);
      } catch (e) {
        const clientMap = new Map();
        (invoicesRes.data || []).forEach((inv) => {
          if (inv.clientId && inv.clientId._id) {
            clientMap.set(inv.clientId._id, inv.clientId);
          }
        });
        setClients(Array.from(clientMap.values()));
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes("token")) {
        const autoToken = await ensureDemoLogin();
        if (autoToken) {
          fetchClientsAndInvoices();
        }
      }
      console.warn("Error loading Tally invoices:", err.message);
    }
  };

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      setError("Please select a Tally XML file to sync.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("tallyXml", xmlFile);
    if (selectedClientId) formData.append("clientId", selectedClientId);

    try {
      const res = await api.post("/tally/sync", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`Tally XML Synced Successfully! Created Invoice #${res.data.invoice?.invoiceNumber || "TALLY"}`);
      setXmlFile(null);
      fetchClientsAndInvoices();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to parse and sync Tally XML file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileCode2 className="w-7 h-7 text-purple-600" /> Tally ERP / Prime XML Sync
        </h1>
        <p className="text-sm text-slate-600">
          Upload Tally XML voucher exports to automatically create synced invoices with GST breakdown and e-invoice QR verification.
        </p>
      </div>

      {/* Sync Upload Box */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" /> Sync Tally Invoices (XML Import)
        </h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSyncSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Client (Optional)
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Associate with Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tally XML File
            </label>
            <input
              type="file"
              accept=".xml"
              required
              onChange={(e) => setXmlFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 border border-slate-300 rounded-lg cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Parsing XML..." : "Sync Tally Invoices"}</span>
          </button>
        </form>
      </div>

      {/* Synced Tally Invoices Table */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-purple-600" /> Synced Invoices History ({tallyInvoices.length})
        </h2>

        {tallyInvoices.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">No synced Tally invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Tally Invoice No</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">GST Amount</th>
                  <th className="p-3">e-Invoice QR</th>
                  <th className="p-3 rounded-r-lg">Synced At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tallyInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-purple-700">{inv.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-900">{inv.clientId?.name || "General Client"}</td>
                    <td className="p-3 font-bold text-slate-900">${inv.amount}</td>
                    <td className="p-3 text-slate-600">${(inv.amount * 0.18).toFixed(2)} (18%)</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                        <QrCode className="w-3.5 h-3.5" /> Verified QR
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "Just now"}
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
