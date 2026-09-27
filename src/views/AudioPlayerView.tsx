import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  ShoppingBag,
  Download,
  Share2,
  Heart,
  Music,
  Sliders,
  ListMusic,
  Info,
  Mic,
  Disc,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Beat } from '../types';

interface AudioPlayerViewProps {
  beats: Beat[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail?: (beat: Beat) => void;
  currencySymbol: string;
  favoriteIds?: string[];
  onToggleFavorite?: (beat: Beat) => void;
  onNavigateToBrowse: () => void;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  beats,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  currencySymbol,
  favoriteIds = [],
  onToggleFavorite,
  onNavigateToBrowse,
}) => {
  const activeBeat = currentBeat || beats[0] || null;
  const isFavorite = activeBeat ? favoriteIds.includes(activeBeat.id) : false;

  const [activeTab, setActiveTab] = useState<'queue' | 'info' | 'loop' | 'similar'>('queue');
  const [loopMode, setLoopMode] = useState(false);
  const [loopIn, setLoopIn] = useState(15);
  const [loopOut, setLoopOut] = useState(45);

  // Canvas visualizer waveform
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 64;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const factor = isPlaying ? Math.sin(Date.now() * 0.005 + i * 0.2) * 0.5 + 0.5 : 0.2;
        const barHeight = Math.max(4, (Math.sin(i * 0.3) * 0.4 + 0.5) * height * 0.8 * (isPlaying ? 0.4 + factor * 0.6 : 0.3));
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (i / bars < 0.45) {
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(1, '#6366f1');
        } else {
          gradient.addColorStop(0, '#3f3f46');
          gradient.addColorStop(1, '#18181b');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 3);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  if (!activeBeat) {
    return (
      <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 max-w-xl mx-auto my-12">
        <Music className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-black text-white uppercase tracking-wider">No Beat Selected</h2>
        <p className="text-xs text-zinc-400 font-mono">Select a beat from the catalog to load into the Advanced Audio Player.</p>
        <button
          onClick={onNavigateToBrowse}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
        >
          BROWSE BEATS CATALOG
        </button>
      </div>
    );
  }

  // Similar beats (matching genre or key)
  const similarBeats = beats.filter(
    (b) => b.id !== activeBeat.id && (b.genre === activeBeat.genre || b.key === activeBeat.key)
  ).slice(0, 5);

  return (
    <div className="w-[999px] max-w-full min-h-[875px] mx-auto space-y-8 pb-32 font-sans text-left animate-fadeIn">
      {/* Top Banner / Header Kicker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/60 via-zinc-950 to-zinc-950 border border-purple-500/20 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>ADVANCED AUDIO PLAYER</span>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-purple-900/80 text-purple-300 rounded border border-purple-500/30">
                PRO ENGINE
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              High-Fidelity Stereo Monitoring · Interactive Waveform & Writer Mode
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToBrowse}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Catalog Vault</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Studio Console Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Artwork, Main Transport & Primary Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-850 shadow-2xl">
          {/* Big Spinning Cover Art */}
          <div className="relative aspect-square w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl group">
            <img
              src={activeBeat.artworkUrl}
              alt={activeBeat.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold rounded-lg">
                {activeBeat.bpm} BPM
              </span>
              <span className="px-2.5 py-1 bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-300 font-mono text-xs font-bold rounded-lg">
                {activeBeat.key}
              </span>
            </div>

            {/* Play/Pause Large Overlay Button */}
            <button
              onClick={() => onPlayToggle(activeBeat)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all cursor-pointer group/play"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-950 transition-transform group-hover/play:scale-110">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </div>
            </button>

            {/* Bottom Beat Title overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate drop-shadow-md">
                {activeBeat.title}
              </h2>
              <p className="text-xs text-purple-300 font-medium font-mono mt-0.5 truncate flex items-center gap-1.5">
                <span>{activeBeat.producerName || 'CASHMERE KID$'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
                <span>·</span>
                <span className="text-zinc-300">{activeBeat.genre}</span>
              </p>
            </div>
          </div>

          {/* Interactive Visualizer Canvas */}
          <div className="space-y-2 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>ANALOG SPECTRUM ANALYZER</span>
              </span>
              <span className="text-zinc-500">{isPlaying ? 'STEREO LIVE' : 'PAUSED'}</span>
            </div>
            <canvas ref={canvasRef} width={400} height={48} className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-850" />
          </div>

          {/* Action Buttons: Buy, Download, Share, Favorite */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onBuyClick(activeBeat)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0082ff] hover:bg-[#3399ff] text-white font-extrabold text-xs uppercase rounded-2xl shadow-lg shadow-blue-950/50 transition-all cursor-pointer border border-blue-400/20"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>BUY · {currencySymbol}{activeBeat.pricing.mp3Lease.toFixed(2)}</span>
            </button>

            {activeBeat.freeDownload ? (
              <button
                onClick={() => onFreeDownloadClick(activeBeat)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>FREE DEMO</span>
              </button>
            ) : (
              <button
                onClick={() => onShareClick(activeBeat)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE BEAT</span>
              </button>
            )}
          </div>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(activeBeat)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
              <span>{isFavorite ? 'Saved to Favorites Vault' : 'Save Beat to Favorites'}</span>
            </button>
          )}
        </div>

        {/* Right Column: Interactive Tabs & Studio Tools (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-850 shadow-2xl">
          {/* Navigation Tabs */}
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-xs font-extrabold font-mono">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'queue' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>UP NEXT ({beats.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>BEAT DNA & LICENSING</span>
            </button>
            <button
              onClick={() => setActiveTab('loop')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'loop' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>WRITER MODE</span>
            </button>
          </div>

          {/* Tab 1: Up Next / Catalog Queue */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 pb-2 border-b border-zinc-900">
                <span>CATALOG TRACK LIST</span>
                <span className="text-purple-400">Click any track to stream</span>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
                {beats.map((beat, idx) => {
                  const isThisPlaying = activeBeat.id === beat.id && isPlaying;
                  const isThisActive = activeBeat.id === beat.id;

                  return (
                    <div
                      key={beat.id}
                      onClick={() => onPlayToggle(beat)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isThisActive
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-lg'
                          : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs font-mono font-bold text-zinc-500 shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                          <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover" />
                          <div
                            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                              isThisActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-purple-400 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4
                            className={`text-sm font-extrabold truncate ${
                              isThisActive ? 'text-purple-300' : 'text-zinc-200'
                            }`}
                          >
                            {beat.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            {beat.bpm} BPM · {beat.key} · {beat.genre}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-black text-zinc-300">
                          {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBuyClick(beat);
                          }}
                          className="px-3 py-1.5 bg-[#0082ff] hover:bg-[#3399ff] text-white font-extrabold text-[10px] uppercase rounded-xl transition-all"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Beat DNA & Licensing Specs */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Tempo</span>
                  <span className="text-lg font-black text-white font-mono">{activeBeat.bpm} BPM</span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Musical Key</span>
                  <span className="text-lg font-black text-purple-300 font-mono">{activeBeat.key}</span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Primary Genre</span>
                  <span className="text-xs font-extrabold text-zinc-200 capitalize block truncate mt-1">
                    {activeBeat.genre}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Analog Chain</span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono block truncate mt-1">
                    SSL 4000 G+
                  </span>
                </div>
              </div>

              {/* Sound Tags / Vibes */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-zinc-400 block uppercase">Sound Vibes & Tags</span>
                <div className="flex flex-wrap gap-2">
                  {activeBeat.tags?.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {activeBeat.moods?.map((mood) => (
                    <span key={mood} className="px-3 py-1 bg-purple-950/60 border border-purple-500/30 text-xs font-bold text-purple-300 rounded-full">
                      {mood}
                    </span>
                  ))}
                </div>
              </div>

              {/* Licensing Tiers Card */}
              <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Available Licensing Options</span>
                  <span className="text-xs text-purple-400 font-mono">Instant Digital Contract</span>
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  All purchases include untagged high-quality audio files (MP3/WAV/Stems) and an instant signed license agreement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">MP3 Lease</span>
                      <span className="text-[10px] text-zinc-500 font-mono">100,000 Streams</span>
                    </div>
                    <span className="font-mono font-black text-purple-300 text-sm">{currencySymbol}{activeBeat.pricing.mp3Lease.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">WAV Lease</span>
                      <span className="text-[10px] text-zinc-500 font-mono">500,000 Streams</span>
                    </div>
                    <span className="font-mono font-black text-purple-300 text-sm">{currencySymbol}{activeBeat.pricing.wavLease.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Writer Mode / Rhyme & Verse Loop Tool */}
          {activeTab === 'loop' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-300">
                  <Mic className="w-5 h-5 text-purple-400" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">PRACTICE YOUR VERSE (A-B LOOP)</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  Set custom loop points to continuously repeat 16 bars while writing lyrics, practicing vocal delivery, or freestyling over {activeBeat.title}.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400 font-bold block">Loop Start (Seconds): {loopIn}s</label>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={loopIn}
                      onChange={(e) => setLoopIn(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400 font-bold block">Loop End (Seconds): {loopOut}s</label>
                    <input
                      type="range"
                      min={loopIn + 5}
                      max={180}
                      value={loopOut}
                      onChange={(e) => setLoopOut(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setLoopMode(!loopMode)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loopMode
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-400'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  <span>{loopMode ? 'A-B Verse Loop ACTIVE' : 'Enable 16-Bar Verse Loop'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
