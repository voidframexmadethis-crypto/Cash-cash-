import React, { useState } from 'react';
import { Play, Download, ShoppingBag, Heart, BarChart2, Eye, X, Sparkles, TrendingUp, Music, ShieldCheck } from 'lucide-react';
import { Beat, SaleRecord } from '../../types';

interface BeatPerformanceAnalyticsProps {
  beats: Beat[];
  salesRecords: SaleRecord[];
  favoriteIds?: string[];
  currencySymbol: string;
}

export const BeatPerformanceAnalytics: React.FC<BeatPerformanceAnalyticsProps> = ({
  beats,
  salesRecords,
  favoriteIds = [],
  currencySymbol,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days' | 'alltime'>('alltime');
  const [inspectBeat, setInspectBeat] = useState<Beat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getBeatSales = (beatTitle: string) => {
    return salesRecords.filter((s) => s.beatTitle?.toLowerCase() === beatTitle.toLowerCase() && s.status === 'Completed');
  };

  const getBeatRevenue = (beatTitle: string) => {
    return getBeatSales(beatTitle).reduce((sum, s) => sum + s.amount, 0);
  };

  // Filter beats by search query
  const filteredBeats = beats.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              FEATURE 39 · BEAT PERFORMANCE ANALYTICS
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            INDIVIDUAL TRACK ENGAGEMENT METRICS
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Monitor verified streams, preview starts, favorites, free downloads, and paid license conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            {(['today', '7days', '30days', 'alltime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {period === 'today' ? 'Today' : period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : 'All-Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Beats Performance Grid */}
      {filteredBeats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredBeats.map((beat) => {
            const beatSales = getBeatSales(beat.title);
            const beatRevenue = getBeatRevenue(beat.title);
            const isFav = favoriteIds.includes(beat.id);
            const favCount = (beat.likeCount || 0) + (isFav ? 1 : 0);

            return (
              <div
                key={beat.id}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-purple-500/40 rounded-2xl transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={beat.artworkUrl}
                    alt={beat.title}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-white truncate">{beat.title}</h4>
                      <span className="text-xs font-mono font-bold text-purple-300 shrink-0">
                        {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {beat.bpm} BPM · {beat.key} · {beat.genre}
                    </p>
                  </div>
                </div>

                {/* Real Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-center font-mono">
                  <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block">Plays</span>
                    <span className="text-xs font-black text-purple-300">
                      {beat.playCount > 0 ? beat.playCount : 0}
                    </span>
                  </div>
                  <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block">Favs</span>
                    <span className="text-xs font-black text-rose-300">
                      {favCount}
                    </span>
                  </div>
                  <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block">Downloads</span>
                    <span className="text-xs font-black text-cyan-300">
                      {beat.downloadCount > 0 ? beat.downloadCount : 0}
                    </span>
                  </div>
                  <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block">Sales</span>
                    <span className="text-xs font-black text-emerald-400">
                      {beatSales.length}
                    </span>
                  </div>
                </div>

                {/* Inspect Drill-down Action Button */}
                <button
                  onClick={() => setInspectBeat(beat)}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Inspect Beat Performance</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl space-y-1">
          <p className="text-xs text-zinc-400 font-medium">No beats found in catalog matching query.</p>
        </div>
      )}

      {/* Individual Beat Performance Inspection Modal */}
      {inspectBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-left font-sans">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 space-y-5">
            <button
              onClick={() => setInspectBeat(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-zinc-800 pb-4">
              <img
                src={inspectBeat.artworkUrl}
                alt={inspectBeat.title}
                className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 shadow-md"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                  BEAT PERFORMANCE AUDIT
                </span>
                <h3 className="text-xl font-black text-white truncate mt-0.5">{inspectBeat.title}</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {inspectBeat.bpm} BPM · {inspectBeat.key} · {inspectBeat.genre}
                </p>
              </div>
            </div>

            {/* Detailed Metric Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                  <span>Playback Streams</span>
                  <Play className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-2xl font-mono font-black text-white">{inspectBeat.playCount || 0}</div>
                <p className="text-[10px] text-zinc-500">Verified stream starts</p>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                  <span>Audience Favorites</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {(inspectBeat.likeCount || 0) + (favoriteIds.includes(inspectBeat.id) ? 1 : 0)}
                </div>
                <p className="text-[10px] text-zinc-500">Saved to client vaults</p>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                  <span>Demo Downloads</span>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-2xl font-mono font-black text-white">{inspectBeat.downloadCount || 0}</div>
                <p className="text-[10px] text-zinc-500">Free evaluation tracks</p>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                  <span>Gross Revenue</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  {currencySymbol}{getBeatRevenue(inspectBeat.title).toFixed(2)}
                </div>
                <p className="text-[10px] text-zinc-500">{getBeatSales(inspectBeat.title).length} orders placed</p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-[11px] text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Real-Time Audit Standard</span>
              </div>
              <p className="text-zinc-400">
                Plays require legitimate client audio buffering and playback initiation. Page views without user play interaction are not counted.
              </p>
            </div>

            <button
              onClick={() => setInspectBeat(null)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Close Performance Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
