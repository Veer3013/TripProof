import React from 'react';
import {
  LayoutDashboard,
  Plane,
  Receipt,
  FileCheck2,
  AlertOctagon,
  Sliders,
  History,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  reviewCount: number;
  anomalyCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  reviewCount,
  anomalyCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips & Project Spaces', icon: Plane },
    {
      id: 'review',
      label: 'Smart Review Queue',
      icon: FileCheck2,
      badge: reviewCount > 0 ? reviewCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    { id: 'expenses', label: 'Expense Register', icon: Receipt },
    {
      id: 'anomalies',
      label: 'Duplicates & Anomalies',
      icon: AlertOctagon,
      badge: anomalyCount > 0 ? anomalyCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    { id: 'policies', label: 'Tax & Policy Rules', icon: Sliders },
    { id: 'audit', label: 'Audit Trail Ledger', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
          Workspaces & Review
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Export Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-1">
          Accounting Sync
        </div>
        <a
          href="/api/v1/export/accounting.csv"
          download="TRIPPROOF_ACCOUNTING_LEDGER.csv"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all text-center"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Tally / Zoho CSV</span>
        </a>
      </div>
    </aside>
  );
};
