import React from 'react';
import { Trip } from '../types';
import { Plane, Layers, Calendar, User, ShieldCheck, Download, ChevronRight } from 'lucide-react';

interface Props {
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
}

export const TripsView: React.FC<Props> = ({ trips, onSelectTrip }) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Trips & Project Spaces</h1>
          <p className="text-xs text-slate-400 mt-1">
            Every travel expense is mapped to an active Suproc Project Space, RFQ, or Supplier Audit.
          </p>
        </div>
      </div>

      {/* Trips Register Table / Cards */}
      <div className="space-y-4">
        {trips.map((trip) => {
          const burnPct = Math.min(100, Math.round((trip.total_spend / trip.budget_limit) * 100));
          return (
            <div
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {trip.rfq_reference || 'RFQ-2847'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{trip.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {trip.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{trip.title}</h2>
                  <p className="text-xs text-slate-400 max-w-2xl">{trip.purpose}</p>
                </div>

                {/* Financial Summary Pill */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-right">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Spend</span>
                    <span className="font-bold text-white">₹{trip.total_spend.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">ITC Claimable</span>
                    <span className="font-bold text-emerald-400">₹{trip.itc_claimable_total.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Blocked GST</span>
                    <span className="font-bold text-rose-400">₹{trip.itc_blocked_total.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Receipts</span>
                    <span className="font-bold text-slate-200">{trip.expense_count} files</span>
                  </div>
                </div>
              </div>

              {/* Roster & Details Row */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 font-medium">{trip.traveller_name}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{trip.start_date} to {trip.end_date}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-slate-500" />
                    <span>{trip.origin} &rarr; {trip.destination}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span>Open Trip Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
