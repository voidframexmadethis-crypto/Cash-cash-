import React from 'react';
import { Radio, CheckCircle, FileText, Calendar, Archive, Play, Download, ShoppingBag, DollarSign, Activity, Sparkles } from 'lucide-react';
import { Beat, SaleRecord } from '../../types';

interface CommandCenterStatsProps {
  beats: Beat[];
  salesRecords: SaleRecord[];
  leadsCount: number;
  currencySymbol: string;
}

export const CommandCenterStats: React.FC<CommandCenterStatsProps> = ({
  beats,
  salesRecords,
  leadsCount,
  currencySymbol,
}) => {
  const totalBeats = beats.length;
  const publishedBeats = beats.filter((b) => b.published !== false && !(b as any).isArchived && !(b as any).isScheduled);
  const draftBeats = beats.filter((b) => b.published === false && !(b as any).isArchived && !(b as any).isScheduled);
  const scheduledBeats = beats.filter((b) => (b as any).isScheduled || ((b as any).uploadStatus === 'SCHEDULED'));
  const archivedBeats = beats.filter((b) => (b as any).isArchived);

  const totalPlays = beats.reduce((sum, b) => sum + (b.playCount || 0), 0);
  const totalDownloads = beats.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const completedSales = salesRecords.filter((s) => s.status === 'Completed');
  const totalPurchases = completedSales.length;
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.amount, 0);

  const stats = [
    {
      id: 'total_beats',
      label: 'TOTAL BEATS',
      value: totalBeats,
      sublabel: `${publishedBeats.length} Live on Store`,
      icon: Radio,
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-950/20',
    },
    {
      id: 'published',
      label: 'PUBLISHED',
      value: publishedBeats.length,
      sublabel: 'Publicly Listen & Buy',
      icon: CheckCircle,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
    },
    {
      id: 'drafts',
      label: 'DRAFTS',
      value: draftBeats.length,
      sublabel: 'Private / In-Progress',
      icon: FileText,
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
    },
    {
      id: 'scheduled',
      label: 'SCHEDULED',
      value: scheduledBeats.length,
      sublabel: 'Future Releases',
      icon: Calendar,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
    },
    {
      id: 'archived',
      label: 'ARCHIVED',
      value: archivedBeats.length,
      sublabel: 'Deactivated Tracks',
      icon: Archive,
      accent: 'text-zinc-400',
      border: 'border-zinc-800',
      bg: 'bg-zinc-900/40',
    },
    {
      id: 'total_plays',
      label: 'TOTAL PLAYS',
      value: totalPlays > 0 ? totalPlays.toLocaleString() : '0',
      sublabel: totalPlays > 0 ? 'Verified Audio Streams' : 'No plays yet',
      icon: Play,
      accent: 'text-purple-300',
      border: 'border-purple-500/30',
      bg: 'bg-purple-950/30',
    },
    {
      id: 'total_downloads',
      label: 'TOTAL DOWNLOADS',
      value: totalDownloads > 0 ? totalDownloads.toLocaleString() : '0',
      sublabel: totalDownloads > 0 ? `${leadsCount} Leads Logged` : 'No downloads yet',
      icon: Download,
      accent: 'text-cyan-300',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
    },
    {
      id: 'total_purchases',
      label: 'TOTAL PURCHASES',
      value: totalPurchases > 0 ? totalPurchases.toLocaleString() : '0',
      sublabel: totalPurchases > 0 ? 'Confirmed Orders' : 'No purchases yet',
      icon: ShoppingBag,
      accent: 'text-emerald-300',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
    },
    {
      id: 'total_revenue',
      label: 'TOTAL REVENUE',
      value: `${currencySymbol}${totalRevenue.toFixed(2)}`,
      sublabel: totalRevenue > 0 ? '100% Producer Kept' : 'No sales yet',
      icon: DollarSign,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/40 ring-1 ring-emerald-500/20',
      bg: 'bg-emerald-950/30',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              FEATURE 38 · DASHBOARD COMMAND CENTER
            </h3>
          </div>
          <h2 className="text-xl sm:text-2xl font-brand font-black text-white uppercase tracking-tight mt-0.5">
            PRODUCER CONTROL AT A GLANCE
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className={`p-4 rounded-2xl border ${st.border} ${st.bg} space-y-1.5 transition-all text-left font-sans flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">
                  {st.label}
                </span>
                <Icon className={`w-4 h-4 ${st.accent} shrink-0`} />
              </div>
              <div>
                <div className={`text-2xl font-mono font-black ${st.accent} tracking-tight`}>
                  {st.value}
                </div>
                <div className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                  {st.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
