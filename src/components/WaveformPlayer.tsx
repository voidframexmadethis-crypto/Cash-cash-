import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Share2,
  Download,
  ShoppingBag,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Music,
  Sparkles,
  AlertCircle,
  Info,
  Clock,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import { Beat, BeatPack } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface WaveformPlayerProps {
  currentBeat: Beat | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  currencySymbol: string;
  beats: Beat[];
  onPlayToggle: (beat: Beat) => void;
  externalExpandTrigger?: number;
  activeBeatPack?: BeatPack | null;
  beatPackTrackIndex?: number;
  onNextBeatPackTrack?: () => void;
  onExitBeatPackMode?: () => void;
  currentView?: string;
  setCurrentView?: (view: string) => void;
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

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  currentBeat,
  isPlaying,
  setIsPlaying,
  onPrev,
  onNext,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  currencySymbol,
  beats = [],
  onPlayToggle,
  externalExpandTrigger,
  activeBeatPack = null,
  beatPackTrackIndex = 0,
  onNextBeatPackTrack,
  onExitBeatPackMode,
  currentView,
  setCurrentView,
}) => {
  // Core Time & Volume States
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(165);
  
  const [volume, setVolume] = useState<number>(() => {
    const saved = sessionStorage.getItem('cashmere_player_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Player States
  const [isExpandedFullPlayer, setIsExpandedFullPlayer] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<
    'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'seeking' | 'buffering' | 'finished' | 'error' | 'unavailable'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search in beat list table inside expanded player
  const [expandedSearchQuery, setExpandedSearchQuery] = useState('');

  // Canvas Waveform Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingSeek = useRef<boolean>(false);

  // Auto-expand player on external trigger
  useEffect(() => {
    if (externalExpandTrigger && externalExpandTrigger > 0) {
      setIsExpandedFullPlayer(true);
    }
  }, [externalExpandTrigger]);

  // Save session state to Storage
  useEffect(() => {
    sessionStorage.setItem('cashmere_player_volume', volume.toString());
  }, [volume]);

  // Initialize Audio Player Subscription from real Web Audio engine
  useEffect(() => {
    const unsubscribe = audioSynth.subscribe({
      onTimeUpdate: (time, dur) => {
        if (!isDraggingSeek.current) {
          setCurrentTime(time);
        }
        if (dur && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      },
      onEnd: () => {
        onNext();
      },
      onError: (errorMsg) => {
        setErrorMessage(errorMsg || 'Audio file unavailable');
        setPlayerState('unavailable');
        setIsPlaying(false);
      },
      onStateChange: (state) => {
        setPlayerState(state);
        if (state === 'unavailable' || state === 'error') {
          setErrorMessage('Audio file unavailable');
          setIsPlaying(false);
        } else if (state === 'playing' || state === 'ready') {
          setErrorMessage(null);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [onNext, setIsPlaying]);

  // Load and play beat when currentBeat changes
  useEffect(() => {
    if (currentBeat) {
      const audioUrl = currentBeat.audioUrl || currentBeat.iaUrl || `/api/beats/${currentBeat.id}/audio`;

      const timer = setTimeout(() => {
        try {
          if (isPlaying) {
            audioSynth.playBeat(
              currentBeat.id,
              currentBeat.bpm,
              currentBeat.key,
              currentBeat.durationSeconds || 165,
              audioUrl
            );
          } else {
            audioSynth.pauseBeat();
            setPlayerState('paused');
          }
        } catch (err: any) {
          console.warn('[WaveformPlayer] Playback timer notice:', err);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setPlayerState('idle');
    }
  }, [currentBeat?.id, isPlaying]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioSynth.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      audioSynth.setVolume(0);
      setIsMuted(true);
    }
  };

  // Canvas Waveform Renderer
  const drawWaveformOnCanvas = (canvas: HTMLCanvasElement | null, isFull: boolean = false) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = isFull ? 140 : 80;
    const barWidth = isFull ? 4 : 3;
    const gap = (width - barCount * barWidth) / (barCount - 1);
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    const freqData = isPlaying ? audioSynth.getFrequencyData() : new Uint8Array(32);

    for (let i = 0; i < barCount; i++) {
      const barRatio = i / barCount;
      const baseHeightRatio =
        Math.sin(i * 0.12) * 0.32 +
        Math.cos(i * 0.05) * 0.22 +
        0.38 +
        (i % 3 === 0 ? 0.12 : 0);

      const freqIndex = i % (freqData.length || 1);
      const freqBoost = isPlaying ? (freqData[freqIndex] || 0) / 255.0 : 0;

      const h = Math.max(
        6,
        Math.min(height - 4, (baseHeightRatio + freqBoost * 0.45) * height)
      );

      const x = i * (barWidth + gap);
      const y = (height - h) / 2;

      const isPlayed = barRatio <= progressRatio;

      if (isPlayed) {
        ctx.fillStyle = '#00FF66'; // High contrast neon green
      } else {
        ctx.fillStyle = '#11351A'; // Dark forest green
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    let animId: number;
    const render = () => {
      drawWaveformOnCanvas(canvasRef.current, false);
      if (isExpandedFullPlayer) {
        drawWaveformOnCanvas(fullCanvasRef.current, true);
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [currentTime, duration, isPlaying, isExpandedFullPlayer]);

  if (!currentBeat) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSecs = ratio * duration;
    setCurrentTime(targetSecs);
    audioSynth.seek(targetSecs);
  };

  const handleSeekBackward10 = () => {
    audioSynth.seek(Math.max(0, currentTime - 10));
  };

  const handleSeekForward10 = () => {
    audioSynth.seek(Math.min(duration, currentTime + 10));
  };

  const filteredExpandedBeats = beats.filter(b => 
    !expandedSearchQuery.trim() || 
    b.title.toLowerCase().includes(expandedSearchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(expandedSearchQuery.toLowerCase())
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. EXPANDED FULLSCREEN / iPad OVERLAY PLAYER & BEAT LIST                  */}
      {/* ========================================================================= */}
      {isExpandedFullPlayer && (
        <div className="fixed inset-0 z-50 bg-[#0A0B0E] flex flex-col p-4 sm:p-8 text-zinc-100 overflow-y-auto font-sans animate-in fade-in duration-200">
          
          {/* Header Navigation */}
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-900 mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-xl tracking-wider text-white uppercase">
                CASHMERE KID$<span className="text-[#00FF66]">.</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-400 font-bold tracking-widest uppercase">
                PLAYER CONSOLE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsExpandedFullPlayer(false);
                  if (setCurrentView && currentView === 'player') {
                    setCurrentView('home');
                  }
                }}
                className="p-2.5 rounded-full bg-[#111217] border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Minimize Player"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player Core Container */}
          <div className="w-full max-w-7xl mx-auto space-y-8 my-auto">
            
            {/* Top Main Player Card (Matching Image Proportions) */}
            <div className="bg-[#111217] p-6 sm:p-8 rounded-3xl border border-zinc-900 shadow-2xl flex flex-col lg:flex-row items-center gap-8">
              
              {/* Left: Large Square Beat Artwork */}
              <div className="relative aspect-square w-48 sm:w-56 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-2xl group">
                <img
                  src={currentBeat.artworkUrl}
                  alt={currentBeat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {playerState === 'loading' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-[#00FF66] animate-spin" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur border border-zinc-800 rounded text-[9px] font-mono font-bold text-[#00FF66]">
                  {currentBeat.key || 'C Minor'}
                </div>
              </div>

              {/* Center / Right: Metadata, Interactive Waveform & Controls */}
              <div className="flex-1 w-full space-y-5">
                
                {/* Title & Metadata */}
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-brand">{currentBeat.title}</h1>
                  <p className="text-xs sm:text-sm text-zinc-400 font-bold font-sans mt-1 uppercase tracking-wider">
                    Beats • {currentBeat.bpm} BPM • {currentBeat.genre} • Prod. {currentBeat.producerName || 'CASHMERE KID$'}
                  </p>
                </div>

                {/* Large Horizontal Waveform */}
                <div className="space-y-1.5">
                  <div
                    className="relative w-full h-20 cursor-pointer"
                    onClick={handleSeek}
                    title="Click anywhere on waveform to seek track"
                  >
                    <canvas ref={fullCanvasRef} width={800} height={80} className="w-full h-full" />
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-500">
                    <span className="text-[#00FF66]">{formatTime(currentTime)}</span>
                    {errorMessage ? (
                      <span className="text-amber-400 font-extrabold uppercase tracking-wider">{errorMessage}</span>
                    ) : null}
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Transport & Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-900">
                  {/* Transport controls */}
                  <div className="flex items-center gap-3">
                    <IconRewind10 onClick={handleSeekBackward10} />

                    <button
                      onClick={onPrev}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090A0E] text-zinc-400 hover:text-white border border-zinc-850 transition cursor-pointer"
                      title="Previous beat"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-[#00FF66] hover:bg-[#00E676] text-black flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer shrink-0"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current text-black" /> : <Play className="w-6 h-6 fill-current text-black ml-0.5" />}
                    </button>

                    <button
                      onClick={onNext}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090A0E] text-zinc-400 hover:text-white border border-zinc-850 transition cursor-pointer"
                      title="Next beat"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>

                    <IconForward10 onClick={handleSeekForward10} />
                  </div>

                  {/* Volume slider */}
                  <div className="flex items-center gap-3 bg-[#090A0E] px-4 py-2.5 rounded-xl border border-zinc-850">
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
                      className="w-28 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#00FF66]"
                    />
                  </div>

                  {/* Download & Buy */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onFreeDownloadClick(currentBeat)}
                      className="px-5 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-white text-xs font-black uppercase rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4 text-zinc-400" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => onBuyClick(currentBeat)}
                      className="px-6 py-3 bg-[#00FF66] hover:bg-[#00E676] text-black text-xs font-black uppercase rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <ShoppingBag className="w-4 h-4 text-black" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Spacious Beat List Table */}
            <div className="bg-[#111217] rounded-3xl border border-zinc-900 overflow-hidden shadow-xl">
              <div className="p-4 bg-[#090A0E] border-b border-zinc-900 flex items-center justify-between gap-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-brand">CATALOG TRACKLIST ({beats.length})</h3>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    placeholder="Filter list..."
                    value={expandedSearchQuery}
                    onChange={(e) => setExpandedSearchQuery(e.target.value)}
                    className="w-full bg-[#111217] border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00FF66]"
                  />
                </div>
              </div>

              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-900 bg-[#090A0E] text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">TITLE</th>
                    <th className="py-3 px-4 w-20 text-center">BPM</th>
                    <th className="py-3 px-4 w-24 text-center">KEY</th>
                    <th className="py-3 px-4 w-24 text-center">DURATION</th>
                    <th className="py-3 px-4 w-36 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-sans">
                  {filteredExpandedBeats.map((beat, idx) => {
                    const isThisActive = currentBeat.id === beat.id;
                    return (
                      <tr
                        key={beat.id}
                        onClick={() => onPlayToggle(beat)}
                        className={`group transition-all cursor-pointer relative ${
                          isThisActive ? 'bg-[#15191C]/80 font-semibold' : 'hover:bg-zinc-900/40'
                        }`}
                      >
                        <td className="py-3 px-4 text-center relative">
                          {isThisActive && <div className="absolute inset-y-0 left-0 w-1 bg-[#00FF66]" />}
                          <span className={`font-mono text-xs ${isThisActive ? 'text-[#00FF66] font-extrabold' : 'text-zinc-500'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                              <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className={`text-xs font-extrabold truncate ${isThisActive ? 'text-[#00FF66]' : 'text-zinc-200'}`}>
                                {beat.title}
                              </h4>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                Beats · {beat.bpm} BPM
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={isThisActive ? 'text-[#00FF66]' : 'text-zinc-400'}>{beat.bpm}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-zinc-500 font-bold">
                          {beat.key || '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={isThisActive ? 'text-[#00FF66] font-bold' : 'text-zinc-400'}>{beat.duration || '2:45'}</span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => onFreeDownloadClick(beat)} className="p-1.5 text-zinc-400 hover:text-white" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => onShareClick(beat)} className="p-1.5 text-zinc-400 hover:text-white" title="Share">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onBuyClick(beat)} className="p-1.5 text-zinc-400 hover:text-[#00FF66]" title="Buy">
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STICKY BOTTOM PLAYER DOCK (MOBILE, iPAD & DESKTOP)                     */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090A0E]/95 border-t border-zinc-850 backdrop-blur-md px-4 py-3 text-white font-sans shadow-2xl">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Beat Artwork & Meta */}
          <div className="flex items-center gap-3.5 min-w-0 max-w-xs sm:max-w-sm">
            <div
              className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer shrink-0 group"
              onClick={() => {
                setIsExpandedFullPlayer(true);
                if (setCurrentView && currentView !== 'player') {
                  setCurrentView('player');
                }
              }}
            >
              <img src={currentBeat.artworkUrl} alt={currentBeat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              {playerState === 'loading' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#00FF66] animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 
                className="font-extrabold text-sm text-white truncate cursor-pointer hover:text-[#00FF66] transition-colors" 
                onClick={() => {
                  setIsExpandedFullPlayer(true);
                  if (setCurrentView && currentView !== 'player') {
                    setCurrentView('player');
                  }
                }}
              >
                {currentBeat.title}
              </h4>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                {currentBeat.bpm} BPM · {currentBeat.key}
              </p>
            </div>
          </div>

          {/* Middle: Canvas Waveform & Playback Controls */}
          <div className="hidden md:flex flex-1 items-center gap-4 max-w-xl">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-[#111217] hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                title="Previous Beat"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-[#00FF66] hover:bg-[#00E676] text-black flex items-center justify-center shadow-lg cursor-pointer shrink-0 transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current text-black" /> : <Play className="w-5 h-5 fill-current text-black ml-0.5" />}
              </button>

              <button
                onClick={onNext}
                className="p-2 rounded-full bg-[#111217] hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                title="Next Beat"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="relative w-full h-8 cursor-pointer" onClick={handleSeek}>
                <canvas ref={canvasRef} width={400} height={32} className="w-full h-full" />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400">
                <span className="text-[#00FF66]">{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Volume & Expand */}
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 rounded-full bg-[#00FF66] text-black flex items-center justify-center shadow-lg cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current text-black" /> : <Play className="w-5 h-5 fill-current text-black ml-0.5" />}
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onBuyClick(currentBeat)}
              className="px-4 py-2.5 bg-[#00FF66] hover:bg-[#00E676] text-black font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer hidden sm:flex items-center gap-1.5 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>Buy</span>
            </button>

            <button
              onClick={() => setIsExpandedFullPlayer(!isExpandedFullPlayer)}
              className="p-2.5 rounded-xl bg-[#111217] border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
              title="Expand Full Console"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
