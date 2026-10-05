import React from 'react';
import { Expense } from '../types';
import { AlertOctagon, Copy, AlertTriangle, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onSelectExpense: (expId: string) => void;
  onRejectExpense: (id: string, reason?: string) => Promise<void>;
}

export const AnomaliesView: React.FC<Props> = ({ expenses, onSelectExpense, onRejectExpense }) => {
  const duplicates = expenses.filter(e => e.duplicate_status !== 'CLEAN');
  const policyViolations = expenses.filter(e => e.policy_status === 'VIOLATION');
  const taxAtRisk = expenses.filter(e =>
    (!e.buyer.is_buyer_gstin_present || !e.merchant.gstin_checksum_valid) && ['lodging', 'airfare'].includes(e.expense_type)
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Fraud, Duplicates & Compliance Hub</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated multi-vector duplicate detection, policy cap enforcement, and tax credit risk containment.
        </p>
      </div>

      {/* 1. Multi-Vector Duplicates Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">Cross-Channel & Exact Duplicates ({duplicates.length})</h2>
        </div>

        {duplicates.length === 0 ? (
          <p className="text-xs text-slate-500">No duplicate claims detected across all channels.</p>
        ) : (
          <div className="space-y-3">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px] uppercase">
                      {dup.duplicate_status}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-bold">{dup.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {dup.merchant.name} — ₹{dup.original_amount.toLocaleString('en-IN')} on {dup.transaction_date}
                  </h3>
                  <p className="text-xs text-rose-300">
                    {dup.anomaly_flags.find(f => f.code === 'DUPLICATE_CLAIM_MATCH')?.message || 'Duplicate claim matched.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectExpense(dup.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    View in Audit Form
                  </button>
                  <button
                    onClick={() => onRejectExpense(dup.id, 'Duplicate expense claim')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                  >
                    Reject Duplicate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Policy Violations Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Policy Violations & Threshold Breaches ({policyViolations.length})</h2>
        </div>

        <div className="space-y-3">
          {policyViolations.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
                    POLICY BREACH
                  </span>
                  <span className="font-semibold text-xs text-slate-200">{exp.merchant.name}</span>
                  <span className="font-mono text-xs text-slate-400">({exp.transaction_date})</span>
                </div>
                <div className="space-y-0.5">
                  {exp.anomaly_flags.map((f, i) => (
                    <p key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                      <span>•</span> {f.message}
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectExpense(exp.id)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Resolve in Review Queue
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Lost Tax Credit (ITC) Traps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">Input Tax Credit (ITC) Leakage Alerts ({taxAtRisk.length})</h2>
        </div>

        <div className="space-y-3">
          {taxAtRisk.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px]">
                    MISSING CORPORATE GSTIN
                  </span>
                  <span className="font-semibold text-xs text-slate-200">{exp.merchant.name}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Bill issued in personal name: <strong className="text-slate-300">{exp.buyer.company_name || 'Individual'}</strong>.
                  Forfeited tax credit: <strong className="text-rose-400 font-mono">₹{exp.tax_total.toFixed(2)}</strong>.
                </p>
              </div>

              <button
                onClick={() => onSelectExpense(exp.id)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Audit & Chase Invoice
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
