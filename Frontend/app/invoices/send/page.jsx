"use client";

import { useState, useEffect } from "react";
import api, { ensureDemoLogin } from "@/lib/api";
import { 
  Receipt, 
  Send, 
  CreditCard, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ExternalLink,
  Plus
} from "lucide-react";

export default function SendInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Upload Invoice Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    clientId: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
  });
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Send WhatsApp Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invoices/list");
      setInvoices(res.data || []);

      try {
        const clientRes = await api.get("/client/list");
        setClients(clientRes.data || []);
      } catch (e) {
        // Fallback extract unique clients if client endpoint fails
        const clientMap = new Map();
        (res.data || []).forEach((inv) => {
          if (inv.clientId && inv.clientId._id) {
            clientMap.set(inv.clientId._id, inv.clientId);
          }
        });
        setClients(Array.from(clientMap.values()));
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to fetch invoices.";
      if (errMsg.toLowerCase().includes("token")) {
        const autoToken = await ensureDemoLogin();
        if (autoToken) {
          const retryRes = await api.get("/invoices/list");
          setInvoices(retryRes.data || []);
          return;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadInvoice = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("clientId", uploadForm.clientId);
      formData.append("invoiceNumber", uploadForm.invoiceNumber);
      formData.append("amount", uploadForm.amount);
      formData.append("dueDate", uploadForm.dueDate);
      if (invoiceFile) formData.append("file", invoiceFile);

      await api.post("/invoices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowUploadModal(false);
      setUploadForm({ clientId: "", invoiceNumber: "", amount: "", dueDate: "" });
      setInvoiceFile(null);
      setSuccessMsg("Invoice created and uploaded successfully.");
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload invoice.");
    } finally {
      setUploading(false);
    }
  };

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setSendingWhatsapp(true);
    setError("");
    setDispatchResult(null);

    try {
      const res = await api.post("/invoice/send-whatsapp", {
        invoiceId: selectedInvoice._id,
        phone: whatsappPhone,
        paymentMethod,
      });

      setDispatchResult(res.data);
      setSuccessMsg(`WhatsApp dispatch sent to ${res.data.recipientPhone || whatsappPhone}!`);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send WhatsApp message.");
    } finally {
      setSendingWhatsapp(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" /> Invoices & Payment Links
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate Stripe Checkout Links, UPI QR links, and send PDF invoices over WhatsApp.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Upload Invoice PDF
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Invoices Table */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" /> Invoice Directory ({invoices.length})
          </h2>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <p>No invoices created yet.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Click here to upload your first invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Invoice #</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{inv.clientId?.name || "Client"}</td>
                    <td className="p-3 font-bold text-slate-900">${inv.amount}</td>
                    <td className="p-3 text-xs text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setWhatsappPhone(inv.clientId?.phone || "");
                          setDispatchResult(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WhatsApp Dispatch Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Payment Dispatch
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1 text-sm border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Invoice #{selectedInvoice.invoiceNumber}</span>
                <span className="text-indigo-600">${selectedInvoice.amount}</span>
              </div>
              <p className="text-xs text-slate-500">
                Client: {selectedInvoice.clientId?.name || "Customer"} ({selectedInvoice.clientId?.email})
              </p>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Recipient Phone Number (WhatsApp)
                </label>
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Link Gateway Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === "stripe"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" /> Stripe Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === "upi"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-purple-600" /> UPI QR Direct
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWhatsapp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingWhatsapp ? "Generating & Sending..." : "Dispatch on WhatsApp"}</span>
                </button>
              </div>
            </form>

            {/* Live Generated Payment Links Preview */}
            {dispatchResult && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-xs border border-slate-800">
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> WhatsApp Dispatch Success
                  </span>
                </div>
                <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <p><strong>Recipient:</strong> {dispatchResult.recipientPhone}</p>
                  <p className="truncate">
                    <strong>Stripe Checkout URL:</strong>{" "}
                    <a
                      href={dispatchResult.paymentLink?.stripeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 underline"
                    >
                      {dispatchResult.paymentLink?.stripeLink}
                    </a>
                  </p>
                  <p className="truncate">
                    <strong>UPI Link:</strong> {dispatchResult.paymentLink?.upiLink}
                  </p>
                </div>
                <div className="pt-1">
                  <a
                    href={dispatchResult.paymentLink?.stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-semibold transition-colors"
                  >
                    <span>Test Open Stripe Checkout</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Upload New Invoice PDF
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUploadInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Client
                </label>
                <select
                  required
                  value={uploadForm.clientId}
                  onChange={(e) => setUploadForm({ ...uploadForm, clientId: e.target.value })}
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
                  Invoice Number
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.invoiceNumber}
                  onChange={(e) => setUploadForm({ ...uploadForm, invoiceNumber: e.target.value })}
                  placeholder="INV-2026-001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={uploadForm.amount}
                  onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                  placeholder="250.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={uploadForm.dueDate}
                  onChange={(e) => setUploadForm({ ...uploadForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Invoice PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setInvoiceFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-300 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary text-sm"
                >
                  {uploading ? "Saving..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
