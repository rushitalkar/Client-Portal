"use client";

import { useState, useEffect } from "react";
import api, { ensureDemoLogin } from "@/lib/api";
import { 
  FileCheck, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Lock,
  Plus
} from "lucide-react";

export default function ESignPage() {
  const [documents, setDocuments] = useState([]);
  const [eSignLogs, setESignLogs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Upload Document Modal
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [docForm, setDocForm] = useState({ clientId: "", title: "", category: "Agreements" });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Aadhaar eSign Modal Flow
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [step, setStep] = useState("aadhaar"); // 'aadhaar' | 'otp'
  const [transactionId, setTransactionId] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [submittingEsign, setSubmittingEsign] = useState(false);
  const [signedResult, setSignedResult] = useState(null);

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const fetchDocumentsData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/esign/documents");
      setDocuments(res.data.documents || []);
      setESignLogs(res.data.logs || []);

      try {
        const clientRes = await api.get("/client/list");
        setClients(clientRes.data || []);
      } catch (e) {
        const clientMap = new Map();
        (res.data.documents || []).forEach((d) => {
          if (d.clientId && d.clientId._id) {
            clientMap.set(d.clientId._id, d.clientId);
          }
        });
        setClients(Array.from(clientMap.values()));
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes("token")) {
        const autoToken = await ensureDemoLogin();
        if (autoToken) {
          fetchDocumentsData();
          return;
        }
      }
      console.warn("Failed to load documents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    setUploadingDoc(true);
    setError("");
    try {
      await api.post("/esign/upload", docForm);
      setShowUploadDoc(false);
      setDocForm({ clientId: "", title: "", category: "Agreements" });
      setSuccess("Document created and queued for eSign signature.");
      fetchDocumentsData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleInitAadhaar = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }

    setSubmittingEsign(true);
    setError("");
    try {
      const res = await api.post("/esign/aadhaar/init", {
        documentId: selectedDoc._id,
        clientId: selectedDoc.clientId?._id || selectedDoc.clientId,
        aadhaarNumber,
      });

      setTransactionId(res.data.transactionId);
      setStep("otp");
      setSuccess("OTP sent to mobile number registered with Aadhaar (Test OTP: 123456)");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate Aadhaar eSign verification.");
    } finally {
      setSubmittingEsign(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmittingEsign(true);
    setError("");
    try {
      const res = await api.post("/esign/aadhaar/verify", {
        transactionId,
        otp: otpInput,
      });

      setSignedResult(res.data);
      setSuccess("Aadhaar eSign verified! Document signed with digital audit trail.");
      fetchDocumentsData();
    } catch (err) {
      setError(err.response?.data?.error || "OTP Verification failed. Use test OTP 123456.");
    } finally {
      setSubmittingEsign(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-amber-600" /> Document eSign (Aadhaar OTP)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Request digital signatures on compliance documents, contracts, and tax returns via Aadhaar eSign.
          </p>
        </div>
        <button
          onClick={() => setShowUploadDoc(true)}
          className="btn-primary flex items-center gap-2 text-sm bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" /> Add Document for Signature
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

      {/* Documents Needing Signature Table */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" /> Documents Needing Signature ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <p>No documents currently requiring eSign signature.</p>
            <button
              onClick={() => setShowUploadDoc(true)}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Add a document to test Aadhaar eSign flow
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Document Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date Uploaded</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{doc.title}</td>
                    <td className="p-3 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                        {doc.category || "General"}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{doc.clientId?.name || "Client"}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Today"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setStep("aadhaar");
                          setAadhaarNumber("");
                          setOtpInput("");
                          setSignedResult(null);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Request eSign</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed eSign Audit Logs */}
      {eSignLogs.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Executed eSign Audit Logs ({eSignLogs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Document ID</th>
                  <th className="p-3">Aadhaar (Last 4)</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Signed At</th>
                  <th className="p-3 rounded-r-lg">Signed PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eSignLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">{log.documentId}</td>
                    <td className="p-3 font-bold text-slate-900">XXXX-XXXX-{log.aadhaarLast4}</td>
                    <td className="p-3 font-mono text-xs">{log.ip}</td>
                    <td className="p-3 text-xs">{new Date(log.signedAt).toLocaleString()}</td>
                    <td className="p-3">
                      <a
                        href={log.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Signed PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request eSign Aadhaar Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" /> Aadhaar eSign Verification
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedDoc.title}</div>
              <div className="text-slate-500">Category: {selectedDoc.category || "General"}</div>
            </div>

            {step === "aadhaar" ? (
              <form onSubmit={handleInitAadhaar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> 12-Digit Aadhaar Identification Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="12"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456789012"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEsign}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    {submittingEsign ? "Sending OTP..." : "Send Aadhaar OTP"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Transaction ID: <code className="font-bold font-mono">{transactionId}</code>
                  <p className="mt-1">Enter test OTP <strong>123456</strong> to complete signing.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Enter 6-Digit Mobile OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono font-bold text-lg tracking-widest outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("aadhaar")}
                    className="btn-secondary text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEsign}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submittingEsign ? "Verifying..." : "Verify & Sign Document"}</span>
                  </button>
                </div>
              </form>
            )}

            {signedResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs space-y-2">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Document Signed Successfully
                </div>
                <p>Digital signature record ID: {signedResult.logId}</p>
                <a
                  href={signedResult.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-bold text-emerald-700 underline"
                >
                  Download Signed Document →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Add Document for Signature
              </h3>
              <button
                onClick={() => setShowUploadDoc(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Client
                </label>
                <select
                  required
                  value={docForm.clientId}
                  onChange={(e) => setDocForm({ ...docForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
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
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Master Service Agreement"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Agreements">Agreements & Contracts</option>
                  <option value="Tax Compliance">Tax Compliance & Filings</option>
                  <option value="NDAs">NDA & Security</option>
                  <option value="Onboarding">Client Onboarding</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDoc(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {uploadingDoc ? "Saving..." : "Add Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
