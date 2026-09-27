import React from 'react';
import { Sparkles, Play, Pause, ShoppingBag, Eye, Dna, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Beat } from '../types';
import { findSmartBeatPairings } from '../utils/beatDna';

interface SmartBeatPairingSectionProps {
  currentBeat: Beat;
  catalog: Beat[];
  isPlaying?: boolean;
  activePlayingBeatId?: string;
  onPlayToggle: (beat: Beat) => void;
  onSelectBeat: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  currencySymbol: string;
}

export const SmartBeatPairingSection: React.FC<SmartBeatPairingSectionProps> = ({
  currentBeat,
  catalog,
  isPlaying = false,
  activePlayingBeatId,
  onPlayToggle,
  onSelectBeat,
  onBuyClick,
  currencySymbol,
}) => {
  const pairings = findSmartBeatPairings(currentBeat, catalog, 4);

  if (pairings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
              FEATURE 47 · SMART BEAT PAIRING™
            </span>
            <h3 className="text-sm font-brand font-black text-white uppercase tracking-wider">
              SIMILAR SONIC DNA (RECOMMENDED)
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 font-medium">
          Harmonic & Tempo Aligned
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {pairings.map(({ beat, compatibilityPercent, matchReasons }) => {
          const isThisTrackPlaying = isPlaying && activePlayingBeatId === beat.id;

          return (
            <div
              key={beat.id}
              className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-purple-500/40 rounded-2xl transition-all space-y-3 flex flex-col justify-between group"
            >
              {/* Top: Artwork, Title, Match Badge */}
              <div className="flex items-center gap-3">
                <div
                  className="relative w-12 h-12 rounded-xl bg-zinc-950 overflow-hidden cursor-pointer shrink-0 border border-zinc-800 group/art"
                  onClick={() => onSelectBeat(beat)}
                >
                  <img
                    src={beat.artworkUrl}
                    alt={beat.title}
                    className="w-full h-full object-cover transition-transform group-hover/art:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayToggle(beat);
                    }}
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity cursor-pointer ${
                      isThisTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover/art:opacity-100'
                    }`}
                  >
                    {isThisTrackPlaying ? (
                      <Pause className="w-5 h-5 text-purple-400 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4
                      onClick={() => onSelectBeat(beat)}
                      className="font-extrabold text-sm text-white hover:text-purple-300 truncate cursor-pointer"
                    >
                      {beat.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-black shrink-0">
                      {compatibilityPercent}% DNA MATCH
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {beat.bpm} BPM · {beat.key} · {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Match Reasons Tags */}
              <div className="flex flex-wrap gap-1">
                {matchReasons.map((reason, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 font-medium"
                  >
                    ✓ {reason}
                  </span>
                ))}
              </div>

              {/* Actions: Quick View & Buy */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-850/80">
                <button
                  onClick={() => onSelectBeat(beat)}
                  className="flex-1 py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Quick View</span>
                </button>

                <button
                  onClick={() => onBuyClick(beat)}
                  className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 shadow cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
