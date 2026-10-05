import React from 'react';
import { AuditEvent } from '../types';
import { History, ShieldCheck, Terminal, User, Clock } from 'lucide-react';

interface Props {
  events: AuditEvent[];
}

export const AuditLogView: React.FC<Props> = ({ events }) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Audit Trail & Chain of Custody</h1>
        <p className="text-xs text-slate-400 mt-1">
          Append-only cryptographic ledger tracking every system extraction, mathematical check, and human approval.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Immutable Event Trail ({events.length} records)</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Statutory Retention: 8 Years Compliant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Ref</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{ev.created_at.slice(0, 19).replace('T', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-bold">
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">{ev.actor_name || 'System'}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{ev.entity_type}:{ev.entity_id}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px] truncate max-w-md">
                    {JSON.stringify(ev.details)}
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
