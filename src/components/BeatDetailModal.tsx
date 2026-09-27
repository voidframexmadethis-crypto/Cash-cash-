import React, { useState } from 'react';
import { X, Play, Pause, Download, ShoppingBag, Share2, CheckCircle2, Music, Sparkles, Heart, Zap, Dna, Info } from 'lucide-react';
import { Beat } from '../types';
import { BeatDnaPanel } from './BeatDnaPanel';
import { SmartBeatPairingSection } from './SmartBeatPairingSection';

interface BeatDetailModalProps {
  beat: Beat | null;
  beats?: Beat[];
  isOpen: boolean;
  isPlaying: boolean;
  isCurrent: boolean;
  onClose: () => void;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  currencySymbol: string;
  isFavorite?: boolean;
  onToggleFavorite?: (beat: Beat) => void;
  onSelectBeat?: (beat: Beat) => void;
  onUpdateBeat?: (beat: Beat) => void;
}

export const BeatDetailModal: React.FC<BeatDetailModalProps> = ({
  beat,
  beats = [],
  isOpen,
  isPlaying,
  isCurrent,
  onClose,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  currencySymbol,
  isFavorite = false,
  onToggleFavorite,
  onSelectBeat,
  onUpdateBeat,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'dna' | 'similar'>('details');

  if (!isOpen || !beat) return null;

  const isThisPlaying = isCurrent && isPlaying;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col md:flex-row max-h-[92vh] text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-800 transition-colors cursor-pointer"
          title="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Large Hi-Res Artwork & Quick Player */}
        <div className="md:w-5/12 relative bg-zinc-900 aspect-square md:aspect-auto overflow-hidden group flex flex-col justify-between">
          <img
            src={beat.artworkUrl}
            alt={beat.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/30 to-transparent" />

          {/* Top Info Badges */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800 text-white text-xs font-mono font-bold">
              {beat.key}
            </div>
            {beat.freeDownload && (
              <div className="px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>FREE DEMO</span>
              </div>
            )}
          </div>

          {/* Centered Play Control Button */}
          <button
            onClick={() => onPlayToggle(beat)}
            className="relative z-10 m-auto w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all border border-purple-400/50 cursor-pointer"
            aria-label={isThisPlaying ? 'Pause' : 'Play'}
          >
            {isThisPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Bottom Audio Info */}
          <div className="relative z-10 p-4 text-xs font-mono text-zinc-300 bg-black/60 backdrop-blur-md">
            <span>{beat.bpm} BPM</span>
            <span className="mx-2 text-zinc-500">·</span>
            <span>{beat.genre}</span>
            <span className="mx-2 text-zinc-500">·</span>
            <span>{beat.duration}</span>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs (Details, Beat DNA, Smart Pairings) */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between space-y-5 overflow-y-auto">
          <div className="space-y-4">
            {/* Header: Title & Producer */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-wider">
                <span>{beat.genre}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                {beat.title}
              </h2>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold pt-0.5">
                <span>PROD. {beat.producerName || 'CASHMERE KID$'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
              </div>
            </div>

            {/* View Mode Navigation Tabs */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1 text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'details' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Track Specs
              </button>
              <button
                onClick={() => setActiveTab('dna')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'dna' ? 'bg-purple-600 text-white shadow' : 'text-purple-300 hover:text-white'
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>Beat DNA™</span>
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'similar' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Smart Pairings</span>
              </button>
            </div>

            {/* TAB 1: Track Specs */}
            {activeTab === 'details' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Technical Specs Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-900 text-xs font-mono">
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase">TEMPO</span>
                    <span className="font-extrabold text-white text-sm">{beat.bpm} BPM</span>
                  </div>
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase">KEY</span>
                    <span className="font-extrabold text-white text-sm">{beat.key}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase">DURATION</span>
                    <span className="font-extrabold text-white text-sm">{beat.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Production Description
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {beat.description || 'Mastered 24-bit high-fashion instrumental crafted by CASHMERE KID$. Ready for vocal recording and digital commercial release.'}
                  </p>
                </div>

                {/* Tags */}
                {beat.tags && beat.tags.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Sound Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {beat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Feature 46 Beat DNA Panel */}
            {activeTab === 'dna' && (
              <div className="animate-fadeIn">
                <BeatDnaPanel
                  beat={beat}
                  isEditable={true}
                  onSaveDna={onUpdateBeat}
                />
              </div>
            )}

            {/* TAB 3: Feature 47 Smart Beat Pairing */}
            {activeTab === 'similar' && (
              <div className="animate-fadeIn">
                <SmartBeatPairingSection
                  currentBeat={beat}
                  catalog={beats}
                  isPlaying={isPlaying}
                  activePlayingBeatId={isCurrent ? beat.id : undefined}
                  onPlayToggle={onPlayToggle}
                  onSelectBeat={(selected) => {
                    if (onSelectBeat) onSelectBeat(selected);
                  }}
                  onBuyClick={(b) => {
                    onClose();
                    onBuyClick(b);
                  }}
                  currencySymbol={currencySymbol}
                />
              </div>
            )}
          </div>

          {/* Pricing & Commercial Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {beat.freeDownload ? 'Free Tagged Demo · Leases Starting At' : 'MP3 Lease Starting At'}
              </span>
              <span className="text-2xl font-mono font-black text-white">
                {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onBuyClick(beat);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>BUY BEAT / CHOOSE LICENSE</span>
              </button>

              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(beat)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-950 border-rose-500 text-rose-400'
                      : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}

              {beat.freeDownload && (
                <button
                  onClick={() => {
                    onClose();
                    onFreeDownloadClick(beat);
                  }}
                  className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Free Tagged Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onShareClick(beat);
                }}
                className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl transition-colors cursor-pointer"
                title="Share Beat"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
