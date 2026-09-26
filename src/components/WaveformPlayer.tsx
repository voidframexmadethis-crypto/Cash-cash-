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
  Heart,
  Sliders,
  X,
  Maximize2,
  Minimize2,
  Repeat,
  CheckCircle2,
  Music,
  Sparkles,
  Mic,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Beat } from '../types';
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
}

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
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(165);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLiked, setIsLiked] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [pitchShift, setPitchShift] = useState(0); // -2 to +2 semitones
  const [tempoMultiplier, setTempoMultiplier] = useState(1.0); // 0.9x to 1.1x
  const [isWatermarkActive, setIsWatermarkActive] = useState(true);
  const [showAuditionControls, setShowAuditionControls] = useState(false);
  const [isExpandedFullPlayer, setIsExpandedFullPlayer] = useState(false);
  const [playerState, setPlayerState] = useState<
    'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'seeking' | 'buffering' | 'finished' | 'error' | 'unavailable'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (externalExpandTrigger && externalExpandTrigger > 0) {
      setIsExpandedFullPlayer(true);
    }
  }, [externalExpandTrigger]);

  // --- COMMENT & TABS STATE (BEATSTARS LAYOUT) ---
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'related' | 'comments'>('related');
  const [commentsMap, setCommentsMap] = useState<
    Record<string, Array<{ id: string; author: string; text: string; date: string }>>
  >({
    'beat-1': [
      { id: 'c1', author: 'Drake Fan 808', text: 'This 808 glide on Valentino Velvet is insane 🔥', date: '2 hours ago' },
      { id: 'c2', author: 'Metro Vibe', text: 'Just bought the Unlimited lease, recording verses now!', date: '1 day ago' },
    ],
    'beat-2': [
      { id: 'c3', author: 'CyberRapper', text: 'Tokyo Nighthawk energy is next level 🏎️⚡', date: '3 hours ago' },
    ],
  });

  const handlePostComment = () => {
    if (!commentInput.trim() || !currentBeat) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'You (Verified Artist)',
      text: commentInput.trim(),
      date: 'Just now',
    };
    setCommentsMap((prev) => ({
      ...prev,
      [currentBeat.id]: [newComment, ...(prev[currentBeat.id] || [])],
    }));
    setCommentInput('');
  };

  const activeComments = (currentBeat && commentsMap[currentBeat.id]) || [
    { id: 'c-default', author: 'VIP Artist', text: 'Southside & Metro vibes are crazy on this one! 💯', date: '5 hours ago' },
  ];

  // --- WRITE A VERSE LISTENING MODE ---
  const [writeVerseMode, setWriteVerseMode] = useState(false);
  const [loopInTime, setLoopInTime] = useState(15);
  const [loopOutTime, setLoopOutTime] = useState(45);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      audioSynth.setCallbacks(
        (time, dur) => {
          setCurrentTime(time);
          setDuration(dur || 165);

          // Handle Write A Verse Loop
          if (writeVerseMode && isPlaying && time >= loopOutTime) {
            audioSynth.seek(loopInTime);
            setCurrentTime(loopInTime);
            return;
          }

          if (time >= (dur || 165) && !isLooping && !writeVerseMode) {
            setPlayerState('finished');
          }
        },
        () => {
          if (isLooping && currentBeat) {
            audioSynth.seek(0);
            setCurrentTime(0);
          } else if (!writeVerseMode) {
            // Continuous Listening Queue Autoplay
            setCurrentTime(0);
            onNext();
          }
        }
      );
    } catch (err) {
      setPlayerState('error');
      setErrorMessage('Audio engine initialization error.');
    }
  }, [setIsPlaying, isLooping, currentBeat, onNext, writeVerseMode, loopInTime, loopOutTime, isPlaying]);

  useEffect(() => {
    if (currentBeat) {
      setPlayerState('loading');
      setErrorMessage(null);

      const timer = setTimeout(() => {
        try {
          if (isPlaying) {
            setPlayerState('playing');
            audioSynth.playBeat(
              currentBeat.id,
              currentBeat.bpm,
              currentBeat.key,
              currentBeat.durationSeconds || 165
            );
          } else {
            setPlayerState('paused');
            audioSynth.pauseBeat();
          }
        } catch (err) {
          setPlayerState('error');
          setErrorMessage('Playback stream error. Please try again.');
        }
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setPlayerState('idle');
    }
  }, [currentBeat, isPlaying]);

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

  const handlePitchChange = (semitones: number) => {
    setPitchShift(semitones);
    audioSynth.setPitchShift(semitones);
  };

  const handleTempoChange = (multiplier: number) => {
    setTempoMultiplier(multiplier);
    audioSynth.setTempoMultiplier(multiplier);
  };

  // Render Canvas Waveform with Write A Verse loop range highlight
  const drawWaveformOnCanvas = (canvas: HTMLCanvasElement | null, isFull: boolean = false) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = isFull ? 120 : 80;
    const barWidth = isFull ? 4 : 3;
    const gap = (width - barCount * barWidth) / (barCount - 1);
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    const loopInRatio = duration > 0 ? loopInTime / duration : 0;
    const loopOutRatio = duration > 0 ? loopOutTime / duration : 1;

    // Draw Write A Verse Loop Highlight Region
    if (writeVerseMode) {
      const startX = loopInRatio * width;
      const endX = loopOutRatio * width;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.fillRect(startX, 0, Math.max(2, endX - startX), height);

      // Loop In marker line
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(startX, 0, 2, height);

      // Loop Out marker line
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(endX - 2, 0, 2, height);
    }

    const freqData = isPlaying ? audioSynth.getFrequencyData() : new Uint8Array(32);

    for (let i = 0; i < barCount; i++) {
      const barRatio = i / barCount;
      const baseHeightRatio =
        Math.sin(i * 0.15) * 0.35 +
        Math.cos(i * 0.08) * 0.25 +
        0.35 +
        (i % 3 === 0 ? 0.15 : 0);

      const freqIndex = i % (freqData.length || 1);
      const freqBoost = (freqData[freqIndex] || 0) / 255.0;

      const h = Math.max(
        6,
        Math.min(height - 4, (baseHeightRatio + freqBoost * 0.45) * height)
      );

      const x = i * (barWidth + gap);
      const y = (height - h) / 2;

      const isPlayed = barRatio <= progressRatio;

      if (isPlayed) {
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, '#f3e8ff');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#6b21a8');
        ctx.fillStyle = grad;
      } else {
        if (writeVerseMode && barRatio >= loopInRatio && barRatio <= loopOutRatio) {
          ctx.fillStyle = '#581c87';
        } else {
          ctx.fillStyle = '#27272a';
        }
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, 2);
      ctx.fill();

      // Playhead line
      if (Math.abs(barRatio - progressRatio) < 1 / barCount) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + barWidth / 2 - 1, 0, 2, height);
      }
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
  }, [currentTime, duration, isPlaying, isExpandedFullPlayer, writeVerseMode, loopInTime, loopOutTime]);

  if (!currentBeat) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSecs = ratio * duration;
    setPlayerState('seeking');
    setCurrentTime(targetSecs);
    audioSynth.seek(targetSecs);
    setTimeout(() => {
      setPlayerState(isPlaying ? 'playing' : 'paused');
    }, 100);
  };

  return (
    <>
      {/* Full Player Overlay Modal (BeatStars Interface) */}
      {isExpandedFullPlayer && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0c] flex flex-col p-4 sm:p-8 text-zinc-100 overflow-y-auto font-sans animate-fadeIn">
          {/* Top Header Navigation */}
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-brand font-black text-white text-base sm:text-lg uppercase tracking-wider">
                CASHMERE KID$ VAULT PLAYER
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setWriteVerseMode(!writeVerseMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  writeVerseMode
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>WRITE A VERSE MODE</span>
              </button>

              <button
                onClick={() => setIsExpandedFullPlayer(false)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Close Player"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Hero Player Card (BeatStars Section) */}
          <div className="max-w-6xl mx-auto w-full bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl">
            {/* Top Info Block: Artwork + Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
              {/* Artwork */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-xl group">
                <img
                  src={currentBeat.artworkUrl}
                  alt={currentBeat.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Track Details */}
              <div className="flex-1 space-y-3 min-w-0 w-full">
                {/* Title row with Purple Play Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                    {currentBeat.title} | Cashmere Kid$ Type Beat 2026
                  </h1>
                </div>

                {/* Producer Handle */}
                <div className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">
                  {currentBeat.producerName || 'CASHMEREKID'}
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-zinc-800/90 text-zinc-200 font-bold border border-zinc-700/60">
                    BPM {currentBeat.bpm}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-800/90 text-zinc-200 font-bold border border-zinc-700/60">
                    ♫ {currentBeat.key}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400 font-medium border border-zinc-700/60">
                    {currentBeat.releaseDate || 'September 25, 2026'}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {currentBeat.description || `${currentBeat.title} | Southside Type Beat 2026`}
                </p>

                {/* Action Buttons & Tag Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Purchase Button */}
                  <button
                    onClick={() => {
                      setIsExpandedFullPlayer(false);
                      onBuyClick(currentBeat);
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ {currencySymbol}{currentBeat.pricing.mp3Lease.toFixed(2)}</span>
                  </button>

                  {/* Download Button */}
                  {currentBeat.freeDownload ? (
                    <button
                      onClick={() => {
                        setIsExpandedFullPlayer(false);
                        onFreeDownloadClick(currentBeat);
                      }}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>DOWNLOAD</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsExpandedFullPlayer(false);
                        onBuyClick(currentBeat);
                      }}
                      className="px-4 py-2 rounded-lg bg-zinc-800/80 text-zinc-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-zinc-700 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                      <span>LEASE TO DOWNLOAD</span>
                    </button>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={() => onShareClick(currentBeat)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>SHARE</span>
                  </button>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto sm:ml-0">
                    {currentBeat.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-black/70 border border-zinc-800 text-zinc-400 text-xs font-mono"
                      >
                        {tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Write A Verse Loop Mode Bar (if enabled) */}
            {writeVerseMode && (
              <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400" />
                    <span>WRITE A VERSE LOOP MODE</span>
                  </span>
                  <button onClick={() => setWriteVerseMode(false)} className="text-[10px] text-zinc-400 hover:text-white uppercase">Close</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-purple-300">Start: {formatTime(loopInTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={loopOutTime - 5}
                      value={loopInTime}
                      onChange={(e) => setLoopInTime(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 accent-purple-500 rounded mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-purple-300">End: {formatTime(loopOutTime)}</span>
                    <input
                      type="range"
                      min={loopInTime + 5}
                      max={duration}
                      value={loopOutTime}
                      onChange={(e) => setLoopOutTime(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 accent-rose-500 rounded mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Waveform Canvas Bar */}
            <div className="space-y-1.5">
              <div
                onClick={handleSeek}
                className="w-full h-16 bg-black/90 rounded-xl p-2.5 border border-zinc-800/80 hover:border-purple-500/40 cursor-pointer relative shadow-inner"
              >
                <canvas ref={fullCanvasRef} width={900} height={50} className="w-full h-full block" />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Comment Input Box & Collaborator Bar */}
            <div className="space-y-4 pt-2 border-t border-zinc-800/80">
              {/* Comment Input */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value.slice(0, 240))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePostComment();
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 bg-black/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-xs font-mono text-zinc-500 shrink-0">
                  {commentInput.length}/240
                </span>
                <button
                  onClick={handlePostComment}
                  className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs tracking-wider uppercase cursor-pointer"
                >
                  SEND
                </button>
              </div>

              {/* Collaborators */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-zinc-400">Collaborators:</span>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800/60">
                  <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-300">
                    CK
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white">Cashmere Kid$</span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">PRODUCER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="max-w-6xl mx-auto w-full my-6 border-b border-zinc-800 flex justify-center gap-8">
            <button
              onClick={() => setActiveTab('related')}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'related'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              RELATED TRACKS
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'comments'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              COMMENTS ({activeComments.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="max-w-6xl mx-auto w-full pb-12">
            {activeTab === 'related' && (
              <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-zinc-800/80 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-5">TITLE</div>
                  <div className="col-span-2 sm:col-span-1 text-center">TIME</div>
                  <div className="col-span-2 sm:col-span-1 text-center">BPM</div>
                  <div className="hidden sm:block col-span-3">TAGS</div>
                  <div className="col-span-2 sm:col-span-2 text-right">ACTIONS</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-800/60">
                  {beats.map((beat) => {
                    const isSelected = beat.id === currentBeat.id;
                    return (
                      <div
                        key={beat.id}
                        onClick={() => onPlayToggle(beat)}
                        className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-zinc-900/80 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-purple-950/20' : ''
                        }`}
                      >
                        {/* Title + Thumbnail */}
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                            <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover" />
                            {isSelected && isPlaying && (
                              <div className="absolute inset-0 bg-purple-950/80 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-purple-300' : 'text-white group-hover:text-purple-300'}`}>
                              {beat.title} | Cashmere Kid$ Type Beat
                            </h4>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="col-span-2 sm:col-span-1 text-center text-xs font-mono text-zinc-400">
                          {beat.duration}
                        </div>

                        {/* BPM */}
                        <div className="col-span-2 sm:col-span-1 text-center text-xs font-mono text-zinc-400">
                          {beat.bpm}
                        </div>

                        {/* Tags */}
                        <div className="hidden sm:flex col-span-3 items-center gap-1.5 overflow-hidden">
                          {beat.tags?.slice(0, 2).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-black/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 truncate">
                              {t.toLowerCase()}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {beat.freeDownload && (
                            <button
                              onClick={() => {
                                setIsExpandedFullPlayer(false);
                                onFreeDownloadClick(beat);
                              }}
                              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onShareClick(beat)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hidden sm:block"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setIsExpandedFullPlayer(false);
                              onBuyClick(beat);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>+ ${beat.pricing.mp3Lease.toFixed(2)}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-4 max-w-3xl mx-auto shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                  COMMUNITY FEEDBACK ({activeComments.length})
                </h3>

                <div className="space-y-3 divide-y divide-zinc-800/60">
                  {activeComments.map((comment) => (
                    <div key={comment.id} className="pt-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
                        {comment.author[0]}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">{comment.author}</span>
                          <span className="text-[10px] text-zinc-500">{comment.date}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-purple-500/30 backdrop-blur-xl shadow-2xl transition-all">
        {/* Top Accent Gradient Line */}
        <div className="h-0.5 bg-gradient-to-r from-purple-600 via-indigo-400 to-purple-800" />

        {/* Auditioning Controls Drawer */}
        {showAuditionControls && (
          <div className="bg-zinc-950 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-300 font-mono animate-fadeIn">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">Pitch Shift:</span>
                <div className="flex gap-1">
                  {[-2, -1, 0, 1, 2].map((st) => (
                    <button
                      key={st}
                      onClick={() => handlePitchChange(st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pitchShift === st
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {st > 0 ? `+${st}` : st}st
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">Tempo Speed:</span>
                <div className="flex gap-1">
                  {[0.9, 1.0, 1.1].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleTempoChange(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tempoMultiplier === spd
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">Producer Tag Watermark:</span>
                <button
                  onClick={() => setIsWatermarkActive(!isWatermarkActive)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold transition-colors ${
                    isWatermarkActive
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-500/50'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {isWatermarkActive ? 'WATERMARK ACTIVE (PROTECTED)' : 'CLEAN AUDITION'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAuditionControls(false)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left Column: Artwork & Track Details */}
            <div className="flex items-center gap-3 w-full md:w-1/4">
              <div
                className="relative group shrink-0 cursor-pointer"
                onClick={() => setIsExpandedFullPlayer(true)}
              >
                <img
                  src={currentBeat.artworkUrl}
                  alt={currentBeat.title}
                  className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shadow-md group-hover:scale-105 transition-transform"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-purple-950/60 rounded-xl flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-1 bg-purple-400 rounded-full animate-pulse" />
                      <span className="w-1 bg-purple-300 rounded-full animate-pulse delay-75" />
                      <span className="w-1 bg-purple-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => setIsExpandedFullPlayer(true)}
                    className="text-sm font-extrabold text-white truncate hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    {currentBeat.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mt-0.5">
                  <span className="text-purple-300 font-semibold">{currentBeat.producerName || 'CASHMERE KID$'}</span>
                  <CheckCircle2 className="w-3 h-3 text-purple-400 fill-purple-950 shrink-0" />
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="font-mono text-purple-300">{Math.round(currentBeat.bpm * tempoMultiplier)} BPM</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="font-mono text-zinc-300">{currentBeat.key}</span>
                </div>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-xl transition-colors ${
                  isLiked ? 'text-red-400 bg-red-950/30' : 'text-zinc-500 hover:text-white'
                }`}
                title="Save to favorites"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* WRITE A VERSE MODE TOGGLE BUTTON */}
              <button
                onClick={() => setWriteVerseMode(!writeVerseMode)}
                className={`p-2 rounded-xl border transition-colors ${
                  writeVerseMode
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Write A Verse Loop Mode"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpandedFullPlayer(true)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
                title="Expand Full Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Column: Controls & Canvas Waveform */}
            <div className="flex-1 w-full md:max-w-xl flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAuditionControls(!showAuditionControls)}
                  className={`p-1 text-xs transition-colors ${
                    showAuditionControls ? 'text-purple-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Auditioning Controls (Pitch / Tempo)"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onPrev}
                  className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                  title="Previous Beat"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-950 hover:scale-105 transition-all cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                  title="Next Beat"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    isLooping ? 'text-purple-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle Loop"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Canvas Waveform */}
              <div className="w-full flex items-center gap-2.5">
                <span className="text-[11px] font-mono text-zinc-400 w-9 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>

                <div
                  onClick={handleSeek}
                  className="flex-1 h-8 cursor-pointer relative group flex items-center bg-zinc-950 rounded-lg px-2 border border-zinc-900 hover:border-purple-500/40 transition-colors shadow-inner"
                  title="Seek position"
                >
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={28}
                    className="w-full h-full block"
                  />
                </div>

                <span className="text-[11px] font-mono text-zinc-400 w-9 shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Right Column: Actions & Volume */}
            <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
              {currentBeat.freeDownload && (
                <button
                  onClick={() => onFreeDownloadClick(currentBeat)}
                  className="p-2 text-zinc-300 hover:text-purple-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                  title="Free Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onShareClick(currentBeat)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors hidden sm:block"
                title="Share Beat"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onBuyClick(currentBeat)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-950 transition-all shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy {currencySymbol}{currentBeat.pricing.mp3Lease.toFixed(2)}</span>
              </button>

              <div className="hidden lg:flex items-center gap-1.5 text-zinc-400 pl-2 border-l border-zinc-800">
                <button onClick={toggleMute} className="hover:text-white p-1">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 h-1 bg-zinc-800 accent-purple-500 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
