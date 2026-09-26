import React from 'react';
import { Play, Pause, Download, ShoppingBag, Share2, CheckCircle2, Volume2, Heart } from 'lucide-react';
import { Beat } from '../types';

interface BeatRowProps {
  beat: Beat;
  index: number;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail?: (beat: Beat) => void;
  currencySymbol: string;
  isFavorite?: boolean;
  onToggleFavorite?: (beat: Beat) => void;
}

export const BeatRow: React.FC<BeatRowProps> = ({
  beat,
  index,
  isPlaying,
  isCurrent,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  currencySymbol,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const isThisPlaying = isCurrent && isPlaying;

  return (
    <div
      className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 ${
        isCurrent
          ? 'bg-purple-950/30 border-purple-500/80 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40'
          : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900/60 hover:border-zinc-800'
      }`}
    >
      {/* Index, Artwork & Play Button */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="w-5 text-center text-xs font-mono font-extrabold text-zinc-500 group-hover:text-purple-400 shrink-0">
          {index + 1}
        </span>

        <div
          className="relative group/thumb shrink-0 cursor-pointer w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
          onClick={() => onViewDetail && onViewDetail(beat)}
        >
          <img
            src={beat.artworkUrl}
            alt={beat.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
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
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 text-purple-400 fill-current" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Title, Producer & Clean Unboxed Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isThisPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-1 py-0.5 rounded bg-purple-950/80 border border-purple-500/40" title="Now Playing">
                <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-2.5" />
                <span className="w-0.5 bg-purple-300 rounded-full animate-pulse h-3 delay-75" />
                <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-2 delay-150" />
              </div>
            )}
            <h4
              onClick={() => onViewDetail && onViewDetail(beat)}
              className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors truncate cursor-pointer"
            >
              {beat.title}
            </h4>
            {beat.featured && (
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-purple-900/80 text-purple-200 rounded border border-purple-400/30 shrink-0">
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 font-medium">
            <span className="text-purple-300 font-semibold">{beat.producerName || 'CASHMERE KID$'}</span>
            <CheckCircle2 className="w-3 h-3 text-purple-400 fill-purple-950 shrink-0" />
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono text-zinc-300">{beat.bpm} BPM</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono text-zinc-300">{beat.key}</span>
            <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">·</span>
            <span className="font-mono text-zinc-400 hidden sm:inline">{beat.genre}</span>
          </div>
        </div>
      </div>

      {/* Tags (Desktop) */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 w-44 truncate font-medium">
        {beat.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right pr-2 hidden sm:block">
          <span className="text-xs font-black font-mono text-white block">
            {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium">MP3 Lease</span>
        </div>

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(beat)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isFavorite
                ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
            }`}
            title={isFavorite ? 'Remove from Saved Vault' : 'Save Beat to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {beat.freeDownload && (
          <button
            onClick={() => onFreeDownloadClick(beat)}
            className="p-2.5 text-zinc-300 hover:text-purple-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
            title="Free Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onShareClick(beat)}
          className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors hidden sm:block"
          title="Share Beat"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onBuyClick(beat)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};
