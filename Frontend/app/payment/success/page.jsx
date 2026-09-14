"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { CheckCircle2, AlertCircle, ArrowLeft, Receipt } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const invoiceId = searchParams.get("invoice_id");

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionId || invoiceId) {
      verifyStripePayment();
    } else {
      setLoading(false);
    }
  }, [sessionId, invoiceId]);

  const verifyStripePayment = async () => {
    try {
      const res = await api.post("/invoice/verify-payment", {
        sessionId,
        invoiceId,
      });

      setPaymentData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-6 p-8 shadow-xl border-emerald-200">
      {loading ? (
        <div className="py-8 space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">Verifying Stripe Payment Status...</p>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Verification Pending</h2>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Payment Successful!</h2>
            <p className="text-sm text-slate-600">
              Your payment has been verified and synced with MongoDB database.
            </p>
          </div>

          {paymentData?.invoice && (
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-bold text-slate-900">{paymentData.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">${paymentData.invoice.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Status:</span>
                <span className="font-bold uppercase text-emerald-700">{paymentData.invoice.status}</span>
              </div>
              {sessionId && (
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Stripe Session ID:</span>
                  <span className="truncate max-w-[200px] text-slate-700">{sessionId}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/invoices/send"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Go to Invoices
            </Link>
            <Link
              href="/"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto my-12 text-center space-y-6">
      <Suspense fallback={
        <div className="card p-8 text-center py-12 text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading payment status...</p>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
