import React, { useState } from 'react';
import { Sliders, Shield, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PolicyConfigView: React.FC = () => {
  const [mealCap, setMealCap] = useState(2000);
  const [hotelCap, setHotelCap] = useState(5000);
  const [prohibitAlcohol, setProhibitAlcohol] = useState(true);
  const [requireGstin, setRequireGstin] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Tax & Corporate Policy Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure deterministic thresholds, Section 17(5) statutory tax blocks, and spend caps for the organization.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Policy configurations updated and synced to Suproc Project Spaces.</span>
        </div>
      )}

      {/* Rules Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Rule 1: Daily Meal Cap */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Daily Meal Allowance (Per Diem Cap)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Food & dining expenses exceeding this amount will automatically trigger an approval exception.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">₹</span>
            <input
              type="number"
              value={mealCap}
              onChange={(e) => setMealCap(Number(e.target.value))}
              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Rule 2: Nightly Hotel Cap */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Maximum Hotel Room Nightly Tariff</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hotel rooms exceeding this rate per night require explicit project manager authorization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">₹</span>
            <input
              type="number"
              value={hotelCap}
              onChange={(e) => setHotelCap(Number(e.target.value))}
              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Rule 3: Alcohol Prohibition */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Strict Alcohol & Minibar Prohibition</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically flag beer, wine, and liquor line items on hotel folios and dining bills for deduction.
            </p>
          </div>
          <input
            type="checkbox"
            checked={prohibitAlcohol}
            onChange={(e) => setProhibitAlcohol(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Rule 4: Mandatory Corporate GSTIN for ITC */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Mandatory Corporate GSTIN Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Require the buyer's company GSTIN on all lodging and airfare receipts before claiming Input Tax Credits.
            </p>
          </div>
          <input
            type="checkbox"
            checked={requireGstin}
            onChange={(e) => setRequireGstin(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save & Enforce Policy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
