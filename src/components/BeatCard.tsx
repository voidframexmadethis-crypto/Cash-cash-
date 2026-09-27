import React from 'react';
import { Play, Pause, Download, ShoppingBag, Share2, CheckCircle2, Sparkles, Volume2, Heart, Zap } from 'lucide-react';
import { Beat } from '../types';

interface BeatCardProps {
  beat: Beat;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail: (beat: Beat) => void;
  currencySymbol: string;
  isFavorite?: boolean;
  onToggleFavorite?: (beat: Beat) => void;
}

export const BeatCard: React.FC<BeatCardProps> = ({
  beat,
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
      className={`group relative flex flex-col bg-zinc-950/80 backdrop-blur-xl rounded-3xl overflow-hidden border transition-all duration-300 text-left font-sans ${
        isCurrent
          ? 'border-purple-500 bg-purple-950/20 shadow-2xl shadow-purple-950/80 ring-1 ring-purple-500/60'
          : 'border-zinc-850/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/30'
      }`}
    >
      {/* Artwork Container - Primary Visual Anchor */}
      <div
        className="relative aspect-square w-full bg-zinc-900 overflow-hidden cursor-pointer group/art"
        onClick={() => onViewDetail(beat)}
      >
        <img
          src={beat.artworkUrl}
          alt={beat.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover/art:scale-105 ${
            isThisPlaying ? 'scale-105' : ''
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
          }}
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/20 to-transparent opacity-60 group-hover/art:opacity-80 transition-opacity" />

        {/* Active Track Indicator (Pulse Badge) */}
        {isCurrent && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-purple-500/50 text-purple-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <Volume2 className={`w-3 h-3 ${isThisPlaying ? 'animate-bounce text-purple-400' : ''}`} />
            <span>{isThisPlaying ? 'NOW PLAYING' : 'PAUSED'}</span>
          </div>
        )}

        {/* Top Right: Heart & Key Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(beat);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-950/90 border-rose-500 text-rose-400'
                  : 'bg-black/70 border-zinc-800 text-zinc-400 hover:text-white hover:bg-black/90'
              }`}
              title={isFavorite ? 'Remove from Saved Vault' : 'Save Beat to Favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
            {beat.key}
          </div>
        </div>

        {/* Centered Play / Pause Control Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayToggle(beat);
          }}
          className={`absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-10 cursor-pointer ${
            isThisPlaying
              ? 'bg-purple-600 text-white scale-110 ring-4 ring-purple-400/40 opacity-100'
              : 'bg-white/95 text-zinc-950 hover:bg-purple-500 hover:text-white opacity-0 group-hover/art:opacity-100 group-hover/art:scale-105 sm:opacity-90'
          }`}
          aria-label={isThisPlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
        >
          {isThisPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Badges: Featured or Free Download */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {beat.featured && (
            <div className="px-2 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-200 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Featured</span>
            </div>
          )}
          {beat.freeDownload && (
            <div className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[9px] font-extrabold uppercase tracking-widest">
              FREE DOWNLOAD
            </div>
          )}
        </div>
      </div>

      {/* Beat Details Body */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Title */}
          <div className="flex items-center gap-2">
            {isThisPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-1 py-0.5 rounded bg-purple-950/80 border border-purple-500/40" title="Now Playing">
                <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-2.5" />
                <span className="w-0.5 bg-purple-300 rounded-full animate-pulse h-3 delay-75" />
                <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-2 delay-150" />
              </div>
            )}
            <h3
              onClick={() => onViewDetail(beat)}
              className="font-extrabold text-base text-white hover:text-purple-300 cursor-pointer transition-colors line-clamp-1"
            >
              {beat.title}
            </h3>
          </div>

          {/* Producer Name & Verified Badge */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
            <span>{beat.producerName || 'CASHMERE KID$'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950 shrink-0" />
          </div>

          {/* Clean Unboxed Metadata: BPM · Key · Duration */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 pt-1">
            <span>{beat.bpm} BPM</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{beat.key}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{beat.duration}</span>
          </div>

          {/* Tags / Subgenres */}
          {beat.tags && beat.tags.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 truncate pt-0.5 font-medium">
              {beat.tags.slice(0, 3).map((t) => (
                <span key={t} className="hover:text-purple-400 cursor-pointer">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Primary Actions */}
        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
          {/* Price display */}
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              {beat.freeDownload ? 'Free / Lease' : 'MP3 Lease'}
            </span>
            <span className="text-sm font-black font-mono text-white">
              {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {beat.freeDownload && (
              <button
                onClick={() => onFreeDownloadClick(beat)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white border border-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Free Download"
                aria-label="Free Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onShareClick(beat)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors shrink-0 hidden sm:block cursor-pointer"
              title="Share Beat"
              aria-label="Share Beat"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onBuyClick(beat)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-950 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BUY BEAT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
