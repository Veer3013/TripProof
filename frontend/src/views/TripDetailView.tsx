import React from 'react';
import { Trip, Expense, SuprocProject } from '../types';
import { ArrowLeft, Download, FileText, ShieldCheck, AlertTriangle, CheckCircle2, User, Calendar, MapPin, Receipt } from 'lucide-react';

interface Props {
  trip: Trip;
  project: SuprocProject | null;
  expenses: Expense[];
  onBack: () => void;
  onSelectExpense: (expId: string) => void;
}

export const TripDetailView: React.FC<Props> = ({ trip, project, expenses, onBack, onSelectExpense }) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </button>

        {/* 1-Click Audit Downloads */}
        <div className="flex items-center gap-3">
          <a
            href={`/api/v1/trips/${trip.id}/audit-report.html`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>View Audit Report (HTML)</span>
          </a>

          <a
            href={`/api/v1/trips/${trip.id}/audit-pack`}
            download={`AUDIT_PACK_${trip.id}.zip`}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit Pack (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Trip Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {trip.rfq_reference || 'RFQ-2847'}
              </span>
              <span className="text-xs font-mono text-slate-400">{trip.id}</span>
              <span className="text-xs font-mono text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">{project?.title || 'Suproc Execution Space'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{trip.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl">{trip.purpose}</p>
          </div>

          {/* Roster Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{trip.traveller_name}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{trip.start_date} to {trip.end_date}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{trip.origin} &rarr; {trip.destination}</span>
            </div>
          </div>
        </div>

        {/* Financial Rollup Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 font-mono">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Total Incurred Spend</span>
            <span className="text-lg font-bold text-white">₹{trip.total_spend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Input Tax Credit (Claimable)</span>
            <span className="text-lg font-bold text-emerald-400">₹{trip.itc_claimable_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Blocked GST S.17(5)</span>
            <span className="text-lg font-bold text-rose-400">₹{trip.itc_blocked_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Tax Credits At-Risk</span>
            <span className="text-lg font-bold text-amber-400">₹{trip.itc_at_risk_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Itemized Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Itemized Trip Expenses ({expenses.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Click any row to view & audit in split-screen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">Merchant & GSTIN</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Claimable ITC</th>
                <th className="py-3 px-4 text-right">Blocked GST</th>
                <th className="py-3 px-4 text-center">ITC Status</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => onSelectExpense(exp.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{exp.merchant.name}</div>
                    <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>GSTIN: {exp.merchant.gstin || 'N/A'}</span>
                      {exp.merchant.gstin_checksum_valid ? (
                        <span className="text-emerald-400 font-bold text-[9px]">&#10003; Valid</span>
                      ) : (
                        exp.merchant.gstin && <span className="text-rose-400 font-bold text-[9px]">&#10007; Invalid</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{exp.transaction_date}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {exp.expense_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {exp.original_currency} {exp.original_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    ₹{exp.itc_claimable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-rose-400">
                    ₹{exp.itc_blocked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      exp.itc_status === 'ELIGIBLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      (exp.itc_status === 'PARTIALLY_ELIGIBLE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                    }`}>
                      {exp.itc_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      exp.validation_status === 'AUTO_ACCEPTED' || exp.validation_status === 'APPROVED' ?
                      'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {exp.validation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
