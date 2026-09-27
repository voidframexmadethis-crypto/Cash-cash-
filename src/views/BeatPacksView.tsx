import React, { useState } from 'react';
import { Package, Play, Pause, Download, ShoppingBag, ShieldCheck, CheckCircle2, Mail, ArrowRight, Music, Sliders, Radio } from 'lucide-react';
import { Beat, BeatPack } from '../types';

interface BeatPacksViewProps {
  beatPacks: BeatPack[];
  beats: Beat[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onAddBeatPackToCart: (pack: BeatPack) => void;
  currencySymbol: string;
  onLeadCaptured?: (email: string, beat: Beat) => void;
  onPlayBeatPack?: (pack: BeatPack, startIndex?: number) => void;
  activeBeatPack?: BeatPack | null;
}

export const BeatPacksView: React.FC<BeatPacksViewProps> = ({
  beatPacks,
  beats,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onAddBeatPackToCart,
  currencySymbol,
  onLeadCaptured,
  onPlayBeatPack,
  activeBeatPack = null,
}) => {
  const [downloadEmails, setDownloadEmails] = useState<{ [packId: string]: string }>({});
  const [downloadSuccess, setDownloadSuccess] = useState<{ [packId: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'premium' | 'free'>('all');

  const filteredPacks = beatPacks.filter((pack) => {
    if (activeTab === 'premium') return pack.price > 0;
    if (activeTab === 'free') return pack.price === 0;
    return true;
  });

  const handleDownloadSubmit = (e: React.FormEvent, pack: BeatPack) => {
    e.preventDefault();
    const email = downloadEmails[pack.id];
    if (!email || !email.includes('@')) return;

    // Capture the leads for all beats in the pack
    if (onLeadCaptured) {
      pack.beatIds.forEach((id) => {
        const beatObj = beats.find((b) => b.id === id);
        if (beatObj) {
          onLeadCaptured(email, beatObj);
        }
      });
    }

    setDownloadSuccess((prev) => ({ ...prev, [pack.id]: true }));
    // Reset after a few seconds
    setTimeout(() => {
      setDownloadSuccess((prev) => ({ ...prev, [pack.id]: false }));
      setDownloadEmails((prev) => ({ ...prev, [pack.id]: '' }));
    }, 6000);
  };

  return (
    <div className="space-y-16 py-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION & EDITORIAL BRAND STATEMENT */}
      <div className="space-y-6 text-center max-w-3xl mx-auto pt-4 pb-8">
        <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-[0.25em] block">
          CURATED BULK MASTER TAPES
        </span>
        <h1 className="text-4xl sm:text-6xl font-brand font-black text-white uppercase tracking-tight leading-none">
          BEAT PACKS
        </h1>
        <div className="h-0.5 w-16 bg-gradient-to-r from-purple-500 to-transparent mx-auto"></div>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans font-medium max-w-2xl mx-auto">
          Multi-instrumental bundles designed for comprehensive studio sessions. Secure complete album sequences and cohesive sonic palettes with a single professional license.
        </p>

        {/* Spacious Interactive Segmented Tab Filter Controls */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl max-w-xs mx-auto mt-8">
          {(['all', 'premium', 'free'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40 font-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN PACKS GRID */}
      {filteredPacks.length > 0 ? (
        <div className="space-y-24">
          {filteredPacks.map((pack) => {
            // Find full beat objects inside this pack
            const packBeats = pack.beatIds
              .map((id) => beats.find((b) => b.id === id))
              .filter((b): b is Beat => !!b);

            return (
              <div
                key={pack.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-b border-zinc-900 pb-20 last:border-0 last:pb-0"
              >
                {/* Left Column: Glamorous Oversized Art Work */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800 group">
                    <img
                      src={pack.artworkUrl}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Floating Price Badge */}
                    <div className="absolute top-6 right-6 px-4 py-2 bg-black/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl">
                      <span className="font-mono text-xs font-black text-purple-300 uppercase tracking-widest">
                        {pack.price > 0 ? `${currencySymbol}${pack.price.toFixed(2)}` : 'COMPLIMENTARY'}
                      </span>
                    </div>

                    {/* Metadata Overlay - Clean and Unboxed */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-zinc-300 font-mono">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Package className="w-4 h-4 text-purple-400" />
                        {packBeats.length} MASTER FILES
                      </span>
                      <span>CURATED IN {new Date(pack.createdDate || '').getFullYear() || '2026'}</span>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                      Includes standard high-fidelity audio leasing agreement, vocal master tagging exemptions, and royalty-split agreements.
                    </p>
                  </div>
                </div>

                {/* Right Column: Dynamic Editorial Details & Audio Previews */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest block">
                      MASTER BUNDLE COMPILATION
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight">
                        {pack.name}
                      </h2>

                      {onPlayBeatPack && (
                        <button
                          onClick={() => onPlayBeatPack(pack, 0)}
                          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 ${
                            activeBeatPack?.id === pack.id && isPlaying
                              ? 'bg-purple-600 text-white border border-purple-400 shadow-purple-950/80 animate-pulse'
                              : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400/40'
                          }`}
                        >
                          <Radio className="w-4 h-4 text-purple-200" />
                          <span>{activeBeatPack?.id === pack.id && isPlaying ? 'SAMPLER PLAYING (45s Radio)' : 'PLAY PACK SAMPLER (45s Radio)'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans font-medium max-w-xl">
                      {pack.description}
                    </p>
                  </div>

                  {/* Beats list within pack - Live Dynamic Playback Integration */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-900 pb-2">
                      INCLUDED INSTRUMENTALS ({packBeats.length})
                    </h3>

                    <div className="divide-y divide-zinc-900">
                      {packBeats.map((beat) => {
                        const isCurrentPlaying = currentBeat?.id === beat.id && isPlaying;
                        return (
                          <div
                            key={beat.id}
                            className="py-3 flex items-center justify-between gap-4 group transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <button
                                onClick={() => onPlayToggle(beat)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
                                  isCurrentPlaying
                                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800/80 text-purple-300'
                                }`}
                              >
                                {isCurrentPlaying ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 pl-0.5" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                  {beat.title}
                                </h4>
                                {/* Clean static metadata with separators */}
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                                  <span>{beat.bpm} BPM</span>
                                  <span aria-hidden="true" className="text-zinc-800">·</span>
                                  <span>{beat.key}</span>
                                  <span aria-hidden="true" className="text-zinc-800">·</span>
                                  <span className="text-purple-400/80">{beat.genre}</span>
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-zinc-500 font-semibold">{beat.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchasing & Free Email-Lead Call-To-Action Actions */}
                  <div className="pt-4 border-t border-zinc-900">
                    {pack.price > 0 ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <button
                          onClick={() => onAddBeatPackToCart(pack)}
                          className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-purple-950/20 flex items-center justify-center gap-2.5 transition-all group cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>ADD PACK TO CART — {currencySymbol}{pack.price.toFixed(2)}</span>
                        </button>
                        
                        <span className="text-[10px] font-mono text-zinc-500 text-center sm:text-left leading-relaxed max-w-xs font-medium">
                          Secure instant uncompressed zip download containing wav masters and licensing documents.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-md">
                        {downloadSuccess[pack.id] ? (
                          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-3 animate-fadeIn">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="text-xs font-medium">
                              <p className="font-bold text-white">ZIP FILE SENT TO YOUR INBOX!</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">We've delivered the untagged high-fidelity download links secure archive to your email address.</p>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={(e) => handleDownloadSubmit(e, pack)} className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider block">
                                SECURE COMPLIMENTARY DOWNLOAD
                              </label>
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                Provide your professional artist email address to unlock instant untagged beat files from this package.
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                  type="email"
                                  required
                                  placeholder="artist@recordlabel.com"
                                  value={downloadEmails[pack.id] || ''}
                                  onChange={(e) =>
                                    setDownloadEmails((prev) => ({ ...prev, [pack.id]: e.target.value }))
                                  }
                                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                              </div>
                              <button
                                type="submit"
                                className="px-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-zinc-900/20 border border-zinc-900 rounded-3xl max-w-lg mx-auto space-y-4">
          <Package className="w-12 h-12 text-zinc-700 mx-auto" />
          <h2 className="font-brand font-black text-white text-lg tracking-wider">NO PACKS IN THIS SHELF</h2>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto font-medium">
            Cashmere Kid$ has not currently categorised any bulk compilations in this category. Check the standard Beats section for single licenses.
          </p>
        </div>
      )}
    </div>
  );
};
