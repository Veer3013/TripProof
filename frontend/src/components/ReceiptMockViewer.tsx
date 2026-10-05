import React from 'react';
import { Expense } from '../types';
import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Building2, MapPin, Receipt, ShieldCheck } from 'lucide-react';

interface Props {
  expense: Expense;
  focusedField: string | null;
}

export const ReceiptMockViewer: React.FC<Props> = ({ expense, focusedField }) => {
  const isMerchantFocused = focusedField === 'merchant_name' || focusedField === 'merchant_gstin';
  const isDateFocused = focusedField === 'transaction_date';
  const isAmountFocused = focusedField === 'original_amount' || focusedField === 'subtotal';
  const isTaxFocused = focusedField === 'tax_total' || focusedField === 'tax_lines';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Viewer Top Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-300">
            {expense.document_id ? `${expense.document_id}.pdf` : `${expense.id}_source.pdf`}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {expense.expense_type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Conf: <span className="text-emerald-400 font-bold">{(expense.document_confidence * 100).toFixed(0)}%</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Simulated High-Fidelity Document Canvas */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white text-slate-900 rounded-lg shadow-xl p-6 relative font-sans text-xs border border-slate-300">
          
          {/* Header Bounding Box: Merchant & Tax ID */}
          <div className={`border-2 p-3 rounded transition-all duration-300 relative ${
            isMerchantFocused ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/40' : 'border-dashed border-slate-300 hover:border-slate-400'
          }`}>
            {isMerchantFocused && (
              <span className="absolute -top-2.5 left-2 bg-amber-500 text-white text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                Extracted Merchant & GSTIN
              </span>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">{expense.merchant.name}</h2>
                <p className="text-[11px] text-slate-600 mt-0.5">{expense.merchant.address || 'Commercial Business Area, India'}</p>
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-semibold text-slate-700">GSTIN:</span>
                  <span className={`px-1 rounded font-bold ${expense.merchant.gstin_checksum_valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {expense.merchant.gstin || 'UNREGISTERED'}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">TAX INVOICE</span>
                <span className="text-xs font-semibold text-slate-800">{expense.invoice_number || 'INV-2026-001'}</span>
              </div>
            </div>
          </div>

          {/* Sub-header Bounding Box: Date, PNR, Buyer */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className={`border-2 p-2 rounded transition-all duration-300 relative ${
              isDateFocused ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40' : 'border-dashed border-slate-300'
            }`}>
              {isDateFocused && (
                <span className="absolute -top-2.5 left-2 bg-amber-500 text-white text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase">
                  Txn Date
                </span>
              )}
              <span className="text-[10px] text-slate-500 block">Invoice Date:</span>
              <span className="font-mono font-bold text-slate-800">{expense.transaction_date}</span>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-2 rounded">
              <span className="text-[10px] text-slate-500 block">Billed To (Buyer):</span>
              <span className="font-semibold text-slate-800 truncate block">
                {expense.buyer.company_name || 'Individual Traveller'}
              </span>
              <span className="font-mono text-[10px] text-slate-600 block">
                {expense.buyer.gstin ? `GSTIN: ${expense.buyer.gstin}` : '❌ NO BUYER GSTIN'}
              </span>
            </div>
          </div>

          {/* Line Items Table with Tax Split Bounding Boxes */}
          <div className={`border-2 p-2.5 rounded transition-all duration-300 relative my-3 ${
            isTaxFocused ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40' : 'border-dashed border-slate-300'
          }`}>
            {isTaxFocused && (
              <span className="absolute -top-2.5 left-2 bg-amber-500 text-white text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase">
                Tax Breakdown & Line Items
              </span>
            )}
            <table className="w-full text-left border-collapse font-sans text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                  <th className="py-1">Description</th>
                  <th className="py-1 text-center">HSN/SAC</th>
                  <th className="py-1 text-right">Taxable</th>
                  <th className="py-1 text-right">GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expense.tax_lines.length > 0 ? (
                  expense.tax_lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 font-medium text-slate-800">
                        {line.description}
                        {line.itc_eligibility !== 'ELIGIBLE' && (
                          <span className="ml-1 text-[9px] font-mono px-1 rounded bg-rose-100 text-rose-700 font-bold">
                            S.17(5) Blocked
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-center font-mono text-slate-500">{line.hsn_sac || '—'}</td>
                      <td className="py-1.5 text-right font-mono font-medium">Rs {line.taxable_amount.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono font-medium">
                        Rs {(line.cgst_amount + line.sgst_amount + line.igst_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-1.5 font-medium text-slate-800">{expense.merchant.name} Charge</td>
                    <td className="py-1.5 text-center font-mono text-slate-500">—</td>
                    <td className="py-1.5 text-right font-mono">Rs {expense.subtotal.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-mono">Rs {expense.tax_total.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total Bounding Box */}
          <div className={`border-2 p-3 rounded transition-all duration-300 relative mt-3 flex justify-between items-center ${
            isAmountFocused ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-400/40' : 'border-dashed border-slate-300'
          }`}>
            {isAmountFocused && (
              <span className="absolute -top-2.5 left-2 bg-emerald-600 text-white text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase">
                Grand Total Verified
              </span>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount Paid</span>
              <span className="text-[10px] text-slate-500 font-mono">
                Subtotal: Rs {expense.subtotal.toFixed(2)} + Tax: Rs {expense.tax_total.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-extrabold text-slate-950">
                {expense.original_currency} {expense.original_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Verification Watermark */}
          <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Luhn Mod-36 Cryptographically Verified
            </span>
            <span>Suproc IDP Engine</span>
          </div>

        </div>
      </div>
    </div>
  );
};
