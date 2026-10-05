import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { ReceiptMockViewer } from '../components/ReceiptMockViewer';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save,
  Check,
  Building2,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  expenses: Expense[];
  onUpdateExpense: (id: string, payload: any) => Promise<Expense>;
  onApproveExpense: (id: string, notes?: string) => Promise<void>;
  onRejectExpense: (id: string, reason?: string) => Promise<void>;
  selectedExpenseId?: string | null;
}

export const ReviewQueueView: React.FC<Props> = ({
  expenses,
  onUpdateExpense,
  onApproveExpense,
  onRejectExpense,
  selectedExpenseId
}) => {
  const reviewQueue = expenses.filter(e => e.validation_status === 'NEEDS_REVIEW');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form State for Active Expense
  const [merchantName, setMerchantName] = useState('');
  const [merchantGstin, setMerchantGstin] = useState('');
  const [txnDate, setTxnDate] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxTotal, setTaxTotal] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Select expense based on prop or index
  const activeExpense = (selectedExpenseId
    ? expenses.find(e => e.id === selectedExpenseId)
    : reviewQueue[currentIndex]) || reviewQueue[0] || expenses[0];

  useEffect(() => {
    if (activeExpense) {
      setMerchantName(activeExpense.merchant.name || '');
      setMerchantGstin(activeExpense.merchant.gstin || '');
      setTxnDate(activeExpense.transaction_date || '');
      setAmount(activeExpense.original_amount || 0);
      setSubtotal(activeExpense.subtotal || 0);
      setTaxTotal(activeExpense.tax_total || 0);
      setNotes(activeExpense.review_notes || '');
    }
  }, [activeExpense]);

  if (!activeExpense) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Review Queue is Completely Clean!</h2>
        <p className="text-xs text-slate-400">
          All travel expenses and folios have been mathematically verified and approved for the Suproc ERP Core.
        </p>
      </div>
    );
  }

  const handleFieldChange = async (field: string, value: any) => {
    const payload: any = { [field]: value };
    setIsSaving(true);
    try {
      await onUpdateExpense(activeExpense.id, payload);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    await onApproveExpense(activeExpense.id, notes);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.3 }
    });
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReject = async () => {
    await onRejectExpense(activeExpense.id, notes || 'Rejected during compliance audit');
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Review Queue Subheader */}
      <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Smart Review Queue ({reviewQueue.length} Pending)
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono">
            Item {currentIndex + 1} of {Math.max(reviewQueue.length, 1)}: <strong className="text-slate-200">{activeExpense.id}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(reviewQueue.length - 1, prev + 1))}
            disabled={currentIndex >= reviewQueue.length - 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 6 Columns: Interactive Document Viewer with Bounding Boxes */}
        <div className="lg:col-span-6 p-4 border-r border-slate-800 h-full overflow-hidden">
          <ReceiptMockViewer expense={activeExpense} focusedField={focusedField} />
        </div>

        {/* Right 6 Columns: Smart Audit & Correction Form */}
        <div className="lg:col-span-6 p-6 overflow-y-auto space-y-5 bg-slate-900/40">
          
          {/* Anomaly & Compliance Alerts Banner */}
          {activeExpense.anomaly_flags.length > 0 && (
            <div className="space-y-2">
              {activeExpense.anomaly_flags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    flag.severity === 'ERROR'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold uppercase text-[10px] tracking-wider block">
                      {flag.code}
                    </span>
                    <p className="font-medium leading-relaxed">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Section 1: Merchant & GSTIN Checksum */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                1. Supplier & Tax Identity
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">
                AI Conf: {((activeExpense.field_confidences?.merchant_name || 0.95) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Merchant / Supplier Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onFocus={() => setFocusedField('merchant_name')}
                  onChange={(e) => {
                    setMerchantName(e.target.value);
                    handleFieldChange('merchant_name', e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-slate-400 font-medium">Supplier GSTIN (15-digit)</label>
                  {activeExpense.merchant.gstin_checksum_valid ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Luhn Mod-36 OK
                    </span>
                  ) : (
                    activeExpense.merchant.gstin && (
                      <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Checksum Fail
                      </span>
                    )
                  )}
                </div>
                <input
                  type="text"
                  value={merchantGstin}
                  onFocus={() => setFocusedField('merchant_gstin')}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setMerchantGstin(val);
                    handleFieldChange('merchant_gstin', val);
                  }}
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none ${
                    activeExpense.merchant.gstin_checksum_valid ? 'border-emerald-600 text-emerald-300' : 'border-rose-600 text-rose-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Form Section 2: Transaction & Amounts */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                2. Transaction Details & Currency
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">
                Math Check: {activeExpense.deterministic_math_passed ? '✅ PASSED' : '❌ MISMATCH'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Transaction Date</label>
                <input
                  type="date"
                  value={txnDate}
                  onFocus={() => setFocusedField('transaction_date')}
                  onChange={(e) => {
                    setTxnDate(e.target.value);
                    handleFieldChange('transaction_date', e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Subtotal (Taxable)</label>
                <input
                  type="number"
                  step="0.01"
                  value={subtotal}
                  onFocus={() => setFocusedField('subtotal')}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSubtotal(val);
                    handleFieldChange('subtotal', val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Grand Total ({activeExpense.original_currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onFocus={() => setFocusedField('original_amount')}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setAmount(val);
                    handleFieldChange('original_amount', val);
                  }}
                  className="w-full bg-slate-950 border border-emerald-600 rounded-lg px-3 py-2 text-xs font-mono font-extrabold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Section 3: Tax Line Itemization & S.17(5) Splits */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                3. Input Tax Credit (ITC) Statutory Splits
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                activeExpense.itc_status === 'ELIGIBLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {activeExpense.itc_status}
              </span>
            </div>

            <div className="space-y-2">
              {activeExpense.tax_lines.map((tl, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-200 block">{tl.description}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Taxable: ₹{tl.taxable_amount.toFixed(2)} • CGST: ₹{tl.cgst_amount.toFixed(2)} • SGST: ₹{tl.sgst_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold block ${
                      tl.itc_eligibility === 'ELIGIBLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {tl.itc_eligibility === 'ELIGIBLE' ? 'Claimable ITC' : 'Blocked S.17(5)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Tax Rollup */}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">Claimable Tax Credit: ₹{activeExpense.itc_claimable.toFixed(2)}</span>
              <span className="text-rose-400">Blocked Tax: ₹{activeExpense.itc_blocked.toFixed(2)}</span>
            </div>
          </div>

          {/* Review Notes Input */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Reviewer Audit Explanation / Note</label>
            <input
              type="text"
              placeholder="e.g. Verified hotel invoice with desk; deducted minibar charges."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Approval Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleReject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Expense</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Post to Suproc ERP</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
