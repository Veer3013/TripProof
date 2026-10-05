import React, { useState } from 'react';
import { Expense } from '../types';
import { Search, Filter, ShieldCheck, ShieldAlert, FileText, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onSelectExpense: (expId: string) => void;
}

export const ExpensesView: React.FC<Props> = ({ expenses, onSelectExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [itcFilter, setItcFilter] = useState('ALL');

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.merchant.gstin && e.merchant.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || e.expense_type === categoryFilter;
    const matchesItc = itcFilter === 'ALL' || e.itc_status === itcFilter;

    return matchesSearch && matchesCategory && matchesItc;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Expense Register</h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable, audit-grade financial ledger with statutory tax breakdown and GST validation flags.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search merchant, GSTIN, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="lodging">Lodging</option>
            <option value="airfare">Airfare</option>
            <option value="cab">Cab / Taxi</option>
            <option value="meals">Meals & Food</option>
            <option value="parking">Parking</option>
          </select>

          {/* ITC Filter */}
          <select
            value={itcFilter}
            onChange={(e) => setItcFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All ITC Statuses</option>
            <option value="ELIGIBLE">ITC Eligible</option>
            <option value="PARTIALLY_ELIGIBLE">Partially Eligible</option>
            <option value="BLOCKED">Blocked S.17(5)</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">Expense ID</th>
                <th className="py-3 px-4">Merchant & GSTIN</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Claimable ITC</th>
                <th className="py-3 px-4 text-right">Blocked GST</th>
                <th className="py-3 px-4 text-center">ITC Status</th>
                <th className="py-3 px-4 text-center">Audit Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => onSelectExpense(exp.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{exp.id.slice(0, 14)}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{exp.merchant.name}</div>
                    <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>GSTIN: {exp.merchant.gstin || 'N/A'}</span>
                      {exp.merchant.gstin_checksum_valid ? (
                        <span className="text-emerald-400 font-bold text-[9px] flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Luhn OK
                        </span>
                      ) : (
                        exp.merchant.gstin && (
                          <span className="text-rose-400 font-bold text-[9px] flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" /> Checksum Fail
                          </span>
                        )
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
