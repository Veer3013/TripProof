import React, { useState } from 'react';
import { Shield, Sparkles, Upload, RefreshCw, Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onResetDemo: () => Promise<void>;
  onUploadSuccess: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<Props> = ({ onResetDemo, onUploadSuccess, isLoading }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleDemoClick = async () => {
    await onResetDemo();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.1 }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('trip_id', 'trip_coimbatore_audit_2026');

      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        onUploadSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.2 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      {/* Brand & Platform Connection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">TripProof</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Suproc Native
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Travel Expense & Tax Intelligence Engine</p>
          </div>
        </div>

        {/* Project Breadcrumb Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Project Space:</span>
          <span className="text-slate-200 font-semibold font-mono">RFQ-2847</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-medium truncate max-w-[200px]">Coimbatore Supplier Quality Audit</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* 1-Click Interactive Demo Button */}
        <button
          onClick={handleDemoClick}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 border border-emerald-400/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          )}
          <span>🚀 Run Interactive Demo Pack</span>
        </button>

        {/* Live File Upload Button */}
        <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 cursor-pointer transition-all active:scale-95">
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>{isUploading ? 'Extracting...' : 'Upload Receipt'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {/* Organization / User Avatar */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
            FC
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-semibold text-slate-200 block">Finance Controller</span>
            <span className="text-[10px] text-slate-500 font-mono">Acme Mfg (27AAACA1234A1ZK)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
