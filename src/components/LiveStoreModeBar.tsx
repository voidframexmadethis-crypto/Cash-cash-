import React from 'react';
import { Sparkles, Monitor, Tablet, Smartphone, LogOut, Edit, Store, Layers, Music, Eye, ShieldCheck, Zap } from 'lucide-react';

interface LiveStoreModeBarProps {
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onExitLiveMode: () => void;
  onEditStore: () => void;
  currentView?: string;
}

export const LiveStoreModeBar: React.FC<LiveStoreModeBarProps> = ({
  deviceMode,
  setDeviceMode,
  onExitLiveMode,
  onEditStore,
  currentView,
}) => {
  return (
    <div className="sticky top-0 z-50 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-purple-500/40 px-3 sm:px-6 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-left font-sans animate-fadeIn">
      {/* Left: Mode Badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-xl text-white font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/80">
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
          <span>LIVE STORE MODE</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
          Customer-Facing Experience · Real Data
        </span>
      </div>

      {/* Center: Device Simulation Viewport Toggles */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => setDeviceMode('desktop')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            deviceMode === 'desktop'
              ? 'bg-purple-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Desktop View (Full Width)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          onClick={() => setDeviceMode('tablet')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            deviceMode === 'tablet'
              ? 'bg-purple-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="iPad / Tablet View (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">iPad</span>
        </button>

        <button
          onClick={() => setDeviceMode('mobile')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            deviceMode === 'mobile'
              ? 'bg-purple-600 text-white shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Mobile View (390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* Right: Quick Editor Jump & Exit Mode */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEditStore}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-300 hover:text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Edit Store Profile / Portal"
        >
          <Store className="w-3.5 h-3.5 text-purple-400" />
          <span>Edit Store</span>
        </button>

        <button
          onClick={onExitLiveMode}
          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-200 hover:text-red-300 border border-zinc-700 hover:border-red-500/40 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Live Mode</span>
        </button>
      </div>
    </div>
  );
};
