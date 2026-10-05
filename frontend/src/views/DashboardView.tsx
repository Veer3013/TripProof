import React from 'react';
import { DashboardSummary, Expense, Trip } from '../types';
import {
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  Receipt,
  Plane,
  ChevronRight
} from 'lucide-react';

interface Props {
  summary: DashboardSummary | null;
  expenses: Expense[];
  trips: Trip[];
  onNavigate: (tab: string, tripId?: string) => void;
}

export const DashboardView: React.FC<Props> = ({ summary, expenses, trips, onNavigate }) => {
  if (!summary) return <div className="p-8 text-center text-slate-500">Loading Dashboard KPIs...</div>;

  const recentExceptions = expenses.filter(e => e.validation_status === 'NEEDS_REVIEW').slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
              Live Suproc Execution Rail
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400 font-mono">Tenant: Acme Manufacturing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Travel Expense Intelligence Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated tax auditing, Luhn Mod-36 GSTIN verification, and project budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('review')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Audit Review Queue ({summary.pending_review_count})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Travel Spend</span>
            <Receipt className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              ₹{summary.total_spend_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {summary.active_trips_count} Active Project Trips</span>
          </div>
        </div>

        {/* Claimable Tax Credits (ITC) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ITC Claimable (Verified)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              ₹{summary.itc_eligible_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Rule 46 & Section 17(5) Verified
          </div>
        </div>

        {/* Tax at Risk (Missing GSTIN / Invalid Checksum) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tax Credits At-Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-400">
              ₹{summary.itc_at_risk_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-300/80">
            Missing buyer GSTIN or Checksum fail
          </div>
        </div>

        {/* Exceptions & Review Items */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Exceptions Requiring Review</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {summary.pending_review_count}
            </span>
            <span className="text-xs text-slate-500">items</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-300/80">
            {summary.duplicate_count} duplicates • {summary.policy_violation_count} policy hits
          </div>
        </div>
      </div>

      {/* Active Project Trips & Recent Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Trips linked to Suproc RFQs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Project Trips</h2>
              <p className="text-xs text-slate-400">Linked to Suproc Project Spaces & Sourcing RFQs</p>
            </div>
            <button
              onClick={() => onNavigate('trips')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => {
              const burnPercentage = Math.min(100, Math.round((trip.total_spend / trip.budget_limit) * 100));
              return (
                <div
                  key={trip.id}
                  onClick={() => onNavigate('trips', trip.id)}
                  className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          {trip.rfq_reference || 'RFQ-2847'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-200">{trip.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Traveller: <span className="text-slate-300 font-medium">{trip.traveller_name}</span> • Dates: <span className="font-mono text-slate-400">{trip.start_date} to {trip.end_date}</span>
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-white">₹{trip.total_spend.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500 block">of ₹{trip.budget_limit.toLocaleString('en-IN')} limit</span>
                    </div>
                  </div>

                  {/* Budget Burn Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Budget Utilization ({burnPercentage}%)</span>
                      <span className="text-emerald-400">Claimable ITC: ₹{trip.itc_claimable_total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          burnPercentage > 90 ? 'bg-rose-500' : (burnPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${burnPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: High-Priority Review Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Action Required</h2>
              <p className="text-xs text-slate-400">Sorted by Money-at-Risk</p>
            </div>
            <button
              onClick={() => onNavigate('review')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Review All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentExceptions.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onNavigate('review')}
                className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 truncate max-w-[150px]">{exp.merchant.name}</span>
                  <span className="font-mono font-bold text-xs text-white">₹{exp.original_amount.toLocaleString('en-IN')}</span>
                </div>
                
                {exp.anomaly_flags.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{exp.anomaly_flags[0].message}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Tax split & math audit required
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
