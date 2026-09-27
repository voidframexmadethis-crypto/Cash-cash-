import React, { useState } from 'react';
import { Flame, Sparkles, TrendingUp, Play, Download, ShoppingBag, Heart, Info, Eye, X, Award } from 'lucide-react';
import { Beat, SaleRecord } from '../../types';

interface TopPerformingBeatsProps {
  beats: Beat[];
  salesRecords: SaleRecord[];
  favoriteIds?: string[];
  currencySymbol: string;
}

export const TopPerformingBeats: React.FC<TopPerformingBeatsProps> = ({
  beats,
  salesRecords,
  favoriteIds = [],
  currencySymbol,
}) => {
  const [inspectBeatData, setInspectBeatData] = useState<{
    beat: Beat;
    score: number;
    plays: number;
    favs: number;
    downloads: number;
    purchases: number;
    revenue: number;
  } | null>(null);

  // Calculate real composite engagement scores
  const beatsWithEngagement = beats.map((b) => {
    const plays = b.playCount || 0;
    const downloads = b.downloadCount || 0;
    const isFav = favoriteIds.includes(b.id);
    const favs = (b.likeCount || 0) + (isFav ? 1 : 0);
    const beatSales = salesRecords.filter((s) => s.beatTitle?.toLowerCase() === b.title.toLowerCase() && s.status === 'Completed');
    const purchases = beatSales.length;
    const revenue = beatSales.reduce((sum, s) => sum + s.amount, 0);

    // Weighted Formula: 1pt per stream, 2pts per favorite, 3pts per download, 10pts per purchase
    const score = (plays * 1) + (favs * 2) + (downloads * 3) + (purchases * 10);

    return {
      beat: b,
      score,
      plays,
      favs,
      downloads,
      purchases,
      revenue,
    };
  });

  // Sort descending by composite score
  const sortedByEngagement = [...beatsWithEngagement]
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              FEATURE 41 · TOP-PERFORMING BEAT DETECTION
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            HIGH-ENGAGEMENT TRACK SIGNALS
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Algorithmic activity detection based on verified plays, saves, demo downloads, and commercial licensing.
          </p>
        </div>

        {/* Formula Explanation Badge */}
        <div className="px-3 py-1.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Weight: 1x Play · 2x Fav · 3x Download · 10x Purchase</span>
        </div>
      </div>

      {sortedByEngagement.length > 0 ? (
        <div className="space-y-3">
          {sortedByEngagement.map((item, index) => (
            <div
              key={item.beat.id}
              className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  #{index + 1}
                </div>

                <img
                  src={item.beat.artworkUrl}
                  alt={item.beat.title}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/20 shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                  }}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white truncate">{item.beat.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30 font-mono font-bold">
                      {item.score} PTS
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {item.plays} plays · {item.favs} favs · {item.downloads} downloads · {item.purchases} sales
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {currencySymbol}{item.revenue.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-zinc-500 block">Total Beat Gross</span>
                </div>

                <button
                  onClick={() => setInspectBeatData(item)}
                  className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
          <Flame className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No High-Engagement Signals Yet</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            As visitors stream tracks, add favorites, and purchase licenses, top-performing tracks will be ranked transparently here.
          </p>
        </div>
      )}

      {/* Underlying Score Breakdown Modal */}
      {inspectBeatData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-left font-sans">
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 space-y-5">
            <button
              onClick={() => setInspectBeatData(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-zinc-800 pb-4">
              <img
                src={inspectBeatData.beat.artworkUrl}
                alt={inspectBeatData.beat.title}
                className="w-14 h-14 rounded-2xl object-cover border border-amber-500/30"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  ENGAGEMENT FORMULA AUDIT
                </span>
                <h3 className="text-lg font-black text-white truncate mt-0.5">{inspectBeatData.beat.title}</h3>
                <p className="text-xs font-mono text-amber-300 font-bold">
                  Total Score: {inspectBeatData.score} Points
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Stream Plays (1 pt each):</span>
                <span className="font-bold text-white">{inspectBeatData.plays} × 1 = +{inspectBeatData.plays * 1} pts</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Audience Favorites (2 pts each):</span>
                <span className="font-bold text-rose-300">{inspectBeatData.favs} × 2 = +{inspectBeatData.favs * 2} pts</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Demo Downloads (3 pts each):</span>
                <span className="font-bold text-cyan-300">{inspectBeatData.downloads} × 3 = +{inspectBeatData.downloads * 3} pts</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">License Purchases (10 pts each):</span>
                <span className="font-bold text-emerald-400">{inspectBeatData.purchases} × 10 = +{inspectBeatData.purchases * 10} pts</span>
              </div>
            </div>

            <button
              onClick={() => setInspectBeatData(null)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
