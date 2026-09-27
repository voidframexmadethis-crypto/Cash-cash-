import React from 'react';
import { Play, Pause, Download, ShoppingCart, Share2, Heart, Check } from 'lucide-react';
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
      onClick={() => onViewDetail && onViewDetail(beat)}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-3xl border transition-all duration-300 text-left font-sans cursor-pointer ${
        isCurrent
          ? 'bg-purple-950/30 border-purple-500/80 shadow-2xl shadow-purple-950/60 ring-1 ring-purple-500/40'
          : 'bg-zinc-950/70 border-zinc-850/80 hover:bg-zinc-900/60 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-950/20'
      }`}
    >
      {/* Left side: Artwork, Play button, Title, Genres */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Square Artwork with overlay play button */}
        <div
          className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onPlayToggle(beat);
          }}
        >
          <img
            src={beat.artworkUrl}
            alt={beat.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
            }}
          />

          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 text-white fill-current" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Title and Genres/Vibe right below it */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
              {beat.title}
            </h4>
            {beat.featured && (
              <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 rounded border border-purple-800/30 shrink-0">
                Featured
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium truncate">
            {beat.moods?.slice(0, 2).join(', ') || beat.genre}
          </p>
        </div>
      </div>

      {/* Middle-right: BPM & Vibe Tags */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 min-w-[200px] justify-between sm:justify-start">
        {/* BPM display */}
        <div className="text-sm font-semibold text-zinc-300 font-mono">
          {beat.bpm} BPM
        </div>

        {/* Tags / Mood badges as shown in image */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {beat.genre && (
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300 capitalize">
              {beat.genre.toLowerCase()}
            </span>
          )}
          {beat.tags?.slice(0, 1).map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Favorite, Free Download & Buy button */}
      <div className="flex items-center gap-2.5 justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(beat)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500 hover:text-white hover:border-zinc-700'
            }`}
            title={isFavorite ? 'Remove from Saved Vault' : 'Save Beat to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        <button
          onClick={() => onShareClick(beat)}
          className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-colors cursor-pointer"
          title="Share Beat"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* CRITICAL: Free Download button as requested by the user */}
        {beat.freeDownload && (
          <button
            onClick={() => onFreeDownloadClick(beat)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-black/40"
            title="Download Free Tagged Demo"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">FREE</span>
          </button>
        )}

        {/* Premium Bright Blue Buy Button as shown in uploaded image */}
        <button
          onClick={() => onBuyClick(beat)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0082ff] hover:bg-[#3399ff] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-950/50 transition-all active:scale-95 cursor-pointer border border-blue-400/20"
        >
          <ShoppingCart className="w-3.5 h-3.5 fill-current" />
          <span>{currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};
