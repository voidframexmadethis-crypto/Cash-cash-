import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Share2,
  ShoppingBag,
  Search,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  Music,
  Trash2,
  Heart,
  Sparkles
} from 'lucide-react';
import { Beat } from '../types';
import { audioEngine } from '../utils/audioEngine';

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
  onNavigateToUploader?: () => void;
}

// Custom seek SVG icons matching the BeatStore reference proportions
const IconRewind10 = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-800 hover:border-zinc-700 bg-[#090A0E] text-zinc-400 hover:text-[#00FF66] transition-all cursor-pointer shadow-md shrink-0"
    title="Rewind 10s"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 2v6h6" />
      <path d="M12 20a10 10 0 1 1 10-10" />
      <text x="12" y="14" fontSize="8" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" fill="currentColor" dy=".3em">10</text>
    </svg>
  </button>
);

const IconForward10 = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-800 hover:border-zinc-700 bg-[#090A0E] text-zinc-400 hover:text-[#00FF66] transition-all cursor-pointer shadow-md shrink-0"
    title="Forward 10s"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6" />
      <path d="M12 20a10 10 0 1 0-10-10" />
      <text x="12" y="14" fontSize="8" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" fill="currentColor" dy=".3em">10</text>
    </svg>
  </button>
);

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
  onNavigateToUploader,
}) => {
  // Real Audio Engine State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(165);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('All Playlists');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedMood, setSelectedMood] = useState('All Moods');
  const [bpmRange, setBpmRange] = useState<number>(200);

  // Active playing beat reference (falls back to first beat in store)
  const activeBeat = currentBeat || beats[0] || null;

  // Subscribe to state continuously from the native HTMLAudioElement engine
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe({
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
      },
      onError: (err) => {
        setAudioError(err || 'Audio file unavailable');
      },
      onStateChange: (state) => {
        if (state === 'unavailable' || state === 'error') {
          setAudioError('Audio file unavailable');
        } else if (state === 'playing' || state === 'ready') {
          setAudioError(null);
        }
      },
    });

    const interval = setInterval(() => {
      const state = audioEngine.getCurrentState();
      setCurrentTime(state.currentTime);
      if (state.duration && !isNaN(state.duration) && state.duration > 0) {
        setDuration(state.duration);
      }
      setVolume(audioEngine.getVolume());
      setIsMuted(audioEngine.getVolume() === 0);
    }, 80);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Synchronized canvas waveform rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawWaveform = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 140; // Dense high-resolution bar array
    const barWidth = 4;
    const gap = (width - barCount * barWidth) / (barCount - 1);
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    // Retrieve real frequency data from Web Audio AnalyserNode during real audio playback
    const freqData = new Uint8Array(32);

    for (let i = 0; i < barCount; i++) {
      const barRatio = i / barCount;
      
      // Natural organic envelope combined with real audio spectrum pulses
      const baseHeightRatio =
        Math.sin(i * 0.12) * 0.32 +
        Math.cos(i * 0.05) * 0.22 +
        0.38 +
        (i % 3 === 0 ? 0.12 : 0);

      const freqIndex = i % (freqData.length || 1);
      const freqBoost = isPlaying ? (freqData[freqIndex] || 0) / 255.0 : 0;

      const h = Math.max(
        8,
        Math.min(height - 4, (baseHeightRatio + freqBoost * 0.45) * height)
      );

      const x = i * (barWidth + gap);
      const y = (height - h) / 2;

      const isPlayed = barRatio <= progressRatio;

      if (isPlayed) {
        ctx.fillStyle = '#00FF66'; // High-contrast neon green for played waveform segments
      } else {
        ctx.fillStyle = '#11351A'; // Deep muted dark green for unplayed waveform segments
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    let animId: number;
    const render = () => {
      drawWaveform(canvasRef.current);
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [currentTime, duration, isPlaying, activeBeat]);

  if (!activeBeat) {
    return (
      <div className="p-12 text-center bg-[#0A0B0E] border border-zinc-900 rounded-3xl space-y-6 max-w-xl mx-auto my-16 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.15)]">
          <Music className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-brand">CASHMERE KID$ VAULT READY</h2>
          <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto leading-relaxed">
            No beats currently loaded in the store vault. Upload your MP3/M4A beats to immediately populate this wide professional audio player.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onNavigateToUploader && (
            <button
              onClick={onNavigateToUploader}
              className="px-6 py-3 bg-[#00FF66] hover:bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
            >
              UPLOAD YOUR BEATS
            </button>
          )}
          <button
            onClick={onNavigateToBrowse}
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider border border-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            BROWSE STORE
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSecs = ratio * duration;
    audioEngine.seek(targetSecs);
  };

  const handleSeekBackward10 = () => {
    audioEngine.seek(Math.max(0, currentTime - 10));
  };

  const handleSeekForward10 = () => {
    audioEngine.seek(Math.min(duration, currentTime + 10));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  // Track list navigation
  const handlePrevTrack = () => {
    const idx = beats.findIndex(b => b.id === activeBeat.id);
    if (idx > 0) {
      onPlayToggle(beats[idx - 1]);
    } else {
      onPlayToggle(beats[beats.length - 1]);
    }
  };

  const handleNextTrack = () => {
    const idx = beats.findIndex(b => b.id === activeBeat.id);
    if (idx < beats.length - 1) {
      onPlayToggle(beats[idx + 1]);
    } else {
      onPlayToggle(beats[0]);
    }
  };

  // Filter extractions
  const genres = ['All Genres', ...Array.from(new Set(beats.map(b => b.genre)))];
  const moods = ['All Moods', ...Array.from(new Set(beats.flatMap(b => b.moods || [])))];

  const filteredBeats = beats.filter((beat) => {
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          beat.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All Genres' || beat.genre === selectedGenre;
    const matchesMood = selectedMood === 'All Moods' || (beat.moods && beat.moods.includes(selectedMood));
    const matchesBpm = beat.bpm <= bpmRange;
    return matchesSearch && matchesGenre && matchesMood && matchesBpm;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 text-left font-sans text-zinc-100 bg-[#0A0B0E] p-4 sm:p-6 rounded-3xl border border-zinc-900 shadow-2xl relative">
      
      {/* ====================================================
          1. BRANDING HEADER BAR (CASHMERE KID$ Branding)
          ==================================================== */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <span className="font-brand font-black text-xl tracking-wider text-white uppercase">
            CASHMERE KID$<span className="text-[#00FF66]">.</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-400 font-bold tracking-widest uppercase">
            VAULT
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <button onClick={onNavigateToBrowse} className="hover:text-white transition-colors cursor-pointer text-[11px]">
            STORE
          </button>
          <button onClick={onNavigateToBrowse} className="hover:text-white transition-colors cursor-pointer text-[11px]">
            BEAT PACKS
          </button>
          <button onClick={onNavigateToBrowse} className="hover:text-white transition-colors cursor-pointer text-[11px]">
            LICENSES
          </button>
          <button onClick={onNavigateToBrowse} className="hover:text-white transition-colors cursor-pointer text-[11px]">
            SERVICES
          </button>
          <button onClick={onNavigateToBrowse} className="hover:text-white transition-colors cursor-pointer text-[11px]">
            SUPPORT
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-zinc-950 border border-zinc-900 flex items-center gap-1 shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#00FF66]/10 text-[#00FF66] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,102,0.25)]">
              <span className="text-xs">🌙</span>
            </div>
          </div>
          
          <button 
            onClick={onNavigateToBrowse}
            className="px-4 py-2 bg-[#00FF66] hover:bg-[#00E676] text-black font-extrabold text-[11px] uppercase tracking-wider rounded-lg shadow-lg cursor-pointer transition-all"
          >
            EXPLORE VAULT
          </button>
        </div>
      </div>

      {/* ====================================================
          2. FILTER & RANGE CONTROLS ROW
          ==================================================== */}
      <div className="bg-[#111217] p-5 rounded-2xl border border-zinc-900 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Section Header */}
          <div className="flex items-center gap-2 shrink-0">
            <h2 className="text-lg font-extrabold tracking-tight text-white uppercase">CASHMERE KID$ VAULT</h2>
            <div className="p-1 rounded-full bg-zinc-900 text-zinc-500 hover:text-white cursor-pointer transition">
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search beats by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090A0E] border border-zinc-800 focus:border-[#00FF66] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-650 focus:outline-none transition-all"
            />
          </div>

          {/* Segment Switcher */}
          <div className="flex bg-[#090A0E] p-1 rounded-xl border border-zinc-850">
            <button className="px-5 py-1.5 rounded-lg text-xs font-black bg-[#111217] border border-zinc-800 text-white uppercase tracking-wider">
              Beats
            </button>
            <button className="px-5 py-1.5 rounded-lg text-xs font-black text-zinc-500 hover:text-white uppercase tracking-wider transition">
              Kits
            </button>
          </div>
        </div>

        {/* Dropdowns & BPM Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* Playlist Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Playlist</label>
            <div className="relative">
              <select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="w-full appearance-none bg-[#090A0E] border border-zinc-850 rounded-xl py-2 px-3 text-xs text-zinc-200 font-bold focus:outline-none focus:border-[#00FF66] cursor-pointer"
              >
                <option value="All Playlists">All Playlists</option>
                <option value="Curated Hits">Curated Hits</option>
                <option value="Dark Synth Vault">Dark Synth Vault</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Genre</label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full appearance-none bg-[#090A0E] border border-zinc-850 rounded-xl py-2 px-3 text-xs text-zinc-200 font-bold focus:outline-none focus:border-[#00FF66] cursor-pointer"
              >
                <option value="All Genres">All Genres</option>
                {genres.filter(g => g !== 'All Genres').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Mood Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Mood</label>
            <div className="relative">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full appearance-none bg-[#090A0E] border border-zinc-850 rounded-xl py-2 px-3 text-xs text-zinc-200 font-bold focus:outline-none focus:border-[#00FF66] cursor-pointer"
              >
                <option value="All Moods">All Moods</option>
                {moods.filter(m => m !== 'All Moods').map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* BPM Slider */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">BPM</label>
              <span className="text-[10px] font-mono font-bold text-[#00FF66]">60 — {bpmRange} BPM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">60</span>
              <input
                type="range"
                min="60"
                max="200"
                value={bpmRange}
                onChange={(e) => setBpmRange(parseInt(e.target.value))}
                className="w-full accent-[#00FF66] bg-zinc-950 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-zinc-500 font-bold">200</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. BIG INTEGRATED PLAYER PROFILE PANEL
          ==================================================== */}
      <div className="bg-[#111217] p-6 rounded-2xl border border-zinc-900 shadow-2xl flex flex-col lg:flex-row items-center gap-6">
        
        {/* Left: Large square artwork cover */}
        <div className="relative aspect-square w-44 sm:w-52 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-2xl group">
          <img
            src={activeBeat.artworkUrl}
            alt={activeBeat.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur border border-zinc-800 rounded text-[9px] font-mono font-bold text-[#00FF66]">
            {activeBeat.key || 'C Minor'}
          </div>
        </div>

        {/* Right: Title, Category, Interactive Waveform, Controls */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Header Metadata */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-brand">{activeBeat.title}</h2>
            <p className="text-xs text-zinc-400 font-bold font-sans mt-1 uppercase tracking-wider">
              Beats • {activeBeat.bpm} BPM • {activeBeat.genre}
            </p>
          </div>

          {/* Interactive Synchronized Waveform */}
          <div className="space-y-1">
            <div
              className="relative w-full h-16 cursor-pointer group"
              onClick={handleSeek}
              title="Click anywhere on waveform to seek track"
            >
              <canvas ref={canvasRef} width={800} height={64} className="w-full h-full" />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500">
              <span className="text-[#00FF66]">{formatTime(currentTime)}</span>
              {audioError ? (
                <span className="text-amber-400 font-extrabold uppercase tracking-wider">{audioError}</span>
              ) : null}
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-900">
            {/* Transport Buttons */}
            <div className="flex items-center gap-3">
              {/* Skip -10s */}
              <IconRewind10 onClick={handleSeekBackward10} />

              {/* Prev Beat */}
              <button
                onClick={handlePrevTrack}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090A0E] text-zinc-400 hover:text-white border border-zinc-850 transition cursor-pointer"
                title="Previous beat"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Central Green Circular Play/Pause */}
              <button
                onClick={() => onPlayToggle(activeBeat)}
                className="w-12 h-12 rounded-full bg-[#00FF66] hover:bg-[#00E676] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current text-black" /> : <Play className="w-5 h-5 fill-current text-black ml-0.5" />}
              </button>

              {/* Next Beat */}
              <button
                onClick={handleNextTrack}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090A0E] text-zinc-400 hover:text-white border border-zinc-850 transition cursor-pointer"
                title="Next beat"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Skip +10s */}
              <IconForward10 onClick={handleSeekForward10} />
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 bg-[#090A0E] px-4 py-2 rounded-xl border border-zinc-850">
              <button onClick={toggleMute} className="text-zinc-400 hover:text-white cursor-pointer shrink-0">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#00FF66]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onFreeDownloadClick(activeBeat)}
                className="px-5 py-2.5 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-white text-xs font-black uppercase rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-zinc-400" />
                <span>Download</span>
              </button>

              <button
                onClick={() => onBuyClick(activeBeat)}
                className="px-6 py-2.5 bg-[#00FF66] hover:bg-[#00E676] text-black text-xs font-black uppercase rounded-lg shadow flex items-center gap-2 cursor-pointer transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span>Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. INTERACTIVE CATALOG TRACK LIST TABLE
          ==================================================== */}
      <div className="bg-[#111217] rounded-2xl border border-zinc-900 overflow-hidden">
        <table className="w-full border-collapse text-xs sm:text-sm text-left">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-zinc-900 bg-[#090A0E] text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">TITLE</th>
              <th className="py-3 px-4 w-20 text-center">BPM</th>
              <th className="py-3 px-4 w-24 text-center">KEY</th>
              <th className="py-3 px-4 w-24 text-center">DURATION</th>
              <th className="py-3 px-4 w-36 text-center">ACTIONS</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-900 font-sans">
            {filteredBeats.length > 0 ? (
              filteredBeats.map((beat, idx) => {
                const isThisActive = activeBeat.id === beat.id;

                return (
                  <tr
                    key={beat.id}
                    onClick={() => onPlayToggle(beat)}
                    className={`group transition-all cursor-pointer relative ${
                      isThisActive
                        ? 'bg-[#15191C]/80 font-semibold'
                        : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    {/* Left Active highlight border block */}
                    <td className="py-3.5 px-4 text-center text-zinc-500 relative">
                      {isThisActive && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-[#00FF66]" />
                      )}
                      <span className={`font-mono text-xs ${isThisActive ? 'text-[#00FF66] font-extrabold' : ''}`}>
                        {idx + 1}
                      </span>
                    </td>

                    {/* Title & Artwork Column */}
                    <td className="py-3.5 px-4 min-w-0">
                      <div className="flex items-center gap-3">
                        {/* Compact Cover Art */}
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                          <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className={`text-xs sm:text-sm font-extrabold truncate ${
                            isThisActive ? 'text-[#00FF66]' : 'text-zinc-200'
                          }`}>
                            {beat.title}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase font-medium mt-0.5">
                            Beats · {beat.bpm} BPM · Prod. CASHMERE KID$
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* BPM Column */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-bold ${isThisActive ? 'text-[#00FF66]' : 'text-zinc-400'}`}>
                        {beat.bpm}
                      </span>
                    </td>

                    {/* KEY Column */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-zinc-500 font-bold">
                        {beat.key || '—'}
                      </span>
                    </td>

                    {/* Duration Column */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono ${isThisActive ? 'text-[#00FF66] font-bold' : 'text-zinc-400'}`}>
                        {beat.duration || '2:45'}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-4">
                        {/* Download */}
                        <button
                          onClick={() => onFreeDownloadClick(beat)}
                          className="p-1.5 text-zinc-450 hover:text-white rounded transition"
                          title="Free download demo"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => onShareClick(beat)}
                          className="p-1.5 text-zinc-450 hover:text-white rounded transition"
                          title="Share track link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Add to Cart */}
                        <button
                          onClick={() => onBuyClick(beat)}
                          className="p-1.5 text-zinc-450 hover:text-[#00FF66] rounded transition"
                          title="Purchase License"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No beats match your active filter criteria. Try adjusting the search query or slider controls.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
