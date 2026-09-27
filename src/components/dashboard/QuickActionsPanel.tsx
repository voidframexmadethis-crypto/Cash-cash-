import React from 'react';
import { Plus, Layers, Store, DollarSign, Play, Sparkles, ChevronRight, ArrowUpRight } from 'lucide-react';

interface QuickActionsPanelProps {
  onOpenUploader: () => void;
  onOpenCollections: () => void;
  onEditStore: () => void;
  onViewSales: () => void;
  onOpenAudioPlayer?: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onOpenUploader,
  onOpenCollections,
  onEditStore,
  onViewSales,
  onOpenAudioPlayer,
}) => {
  const quickActions = [
    {
      id: 'upload',
      title: 'UPLOAD BEAT',
      description: 'Add new MP3/M4A masters, artwork & pricing',
      icon: Plus,
      color: 'from-purple-600 via-violet-600 to-indigo-600',
      textColor: 'text-white',
      borderColor: 'border-purple-500/40',
      action: onOpenUploader,
      badge: 'Drop New Beat',
    },
    {
      id: 'collections',
      title: 'CREATE COLLECTION',
      description: 'Group instrumentals into themed albums & playlists',
      icon: Layers,
      color: 'from-blue-600 via-indigo-600 to-purple-600',
      textColor: 'text-white',
      borderColor: 'border-blue-500/40',
      action: onOpenCollections,
      badge: 'Curation',
    },
    {
      id: 'edit_store',
      title: 'EDIT STORE',
      description: 'Configure banner, producer profile, and custom links',
      icon: Store,
      color: 'from-violet-600 to-purple-800',
      textColor: 'text-white',
      borderColor: 'border-violet-500/40',
      action: onEditStore,
      badge: 'Brand Portal',
    },
    {
      id: 'view_sales',
      title: 'VIEW SALES',
      description: 'Inspect transaction ledgers, receipts & customers',
      icon: DollarSign,
      color: 'from-emerald-600 via-teal-600 to-emerald-800',
      textColor: 'text-white',
      borderColor: 'border-emerald-500/40',
      action: onViewSales,
      badge: 'Live Escrow',
    },
    {
      id: 'open_player',
      title: 'OPEN AUDIO PLAYER',
      description: 'Launch the high-fidelity waveform transport dock',
      icon: Play,
      color: 'from-cyan-600 via-blue-600 to-indigo-700',
      textColor: 'text-white',
      borderColor: 'border-cyan-500/40',
      action: () => {
        if (onOpenAudioPlayer) onOpenAudioPlayer();
      },
      badge: 'HQ Waveform',
    },
  ];

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 text-left font-sans">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              FEATURE 45 · QUICK ACTIONS DASHBOARD
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            EXECUTIVE CONTROL SHORTCUTS
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {quickActions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.action}
              className={`group p-5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border ${act.borderColor} hover:border-purple-400 text-left transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer relative overflow-hidden shadow-lg active:scale-98`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {act.badge}
                </span>
              </div>

              <div>
                <h4 className="font-brand font-black text-sm text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors flex items-center justify-between">
                  <span>{act.title}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
