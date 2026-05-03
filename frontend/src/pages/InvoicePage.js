import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const InvoicePage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getInvoice(bookingId)
      .then(r => setInvoice(r.data.data))
      .catch(() => toast.error('Invoice not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="min-h-screen mesh-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" /></div>;
  if (!invoice) return <div className="min-h-screen mesh-bg flex items-center justify-center text-white/40">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      {/* Controls */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2">
          ← Back
        </button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          🖨 Print Invoice
        </button>
      </div>

      {/* Invoice — light theme for print readability */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/20 border border-[#00d4ff]/30 flex items-center justify-center text-2xl">
                ❄️
              </div>
              <div>
                <p className="font-bold text-xl">Full Care AC Tech</p>
                <p className="text-white/50 text-sm">Professional AC Services</p>
                <p className="text-white/30 text-xs mt-0.5">Karachi, Pakistan · 0300-FULLCARE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl text-[#00d4ff]">INVOICE</p>
              <p className="text-white/50 text-sm mt-1">{invoice.invoiceNumber}</p>
              <p className="text-white/30 text-xs">{new Date(invoice.generatedAt).toLocaleDateString('en-PK', { dateStyle:'long' })}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Billed to / Service Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-slate-900">{invoice.issuedTo?.name}</p>
              <p className="text-sm text-slate-500">{invoice.issuedTo?.email}</p>
              <p className="text-sm text-slate-500">{invoice.issuedTo?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Service Info</p>
              <p className="text-sm text-slate-600">Booking: <span className="font-bold text-slate-900">{invoice.bookingNumber}</span></p>
              <p className="text-sm text-slate-600">Date: <span className="font-bold text-slate-900">{new Date(invoice.scheduledDate).toLocaleDateString('en-PK')}</span></p>
              <p className="text-sm text-slate-600">Time: <span className="font-bold text-slate-900">{invoice.scheduledTime}</span></p>
              {invoice.technician && <p className="text-sm text-slate-600">Tech: <span className="font-bold text-slate-900">{invoice.technician?.user?.name}</span></p>}
            </div>
          </div>

          {/* Completed badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-emerald-600">✅</span>
            <span className="text-sm text-emerald-700 font-semibold">Service Completed Successfully</span>
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 text-slate-400 font-bold text-xs uppercase tracking-wide">Description</th>
                <th className="text-right py-3 text-slate-400 font-bold text-xs uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-4">
                  <p className="font-bold text-slate-900">{invoice.service?.name}</p>
                  <p className="text-xs text-slate-400">{invoice.service?.category} · {invoice.service?.duration} minutes</p>
                </td>
                <td className="py-4 text-right font-bold text-slate-900">Rs. {invoice.subtotal?.toLocaleString()}</td>
              </tr>
              {invoice.discount > 0 && (
                <tr className="border-b border-slate-50">
                  <td className="py-2 text-emerald-600">Discount</td>
                  <td className="py-2 text-right text-emerald-600">- Rs. {invoice.discount?.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900">
                <td className="pt-4 font-bold text-xl text-slate-900">Total</td>
                <td className="pt-4 text-right font-bold text-2xl text-blue-600">Rs. {invoice.total?.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payment info */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-800 capitalize">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status</span>
              <span className={`font-semibold capitalize ${invoice.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {invoice.paymentStatus}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="font-bold text-slate-700 mb-1">Thank you for choosing Full Care AC Tech!</p>
            <p className="text-xs text-slate-400">For queries: info@fullcareac.com · 0300-FULLCARE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
