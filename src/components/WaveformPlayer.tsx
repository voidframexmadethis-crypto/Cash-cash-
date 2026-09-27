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
  Zap,
  Info,
  ListMusic,
  History,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Trash2,
  Clock,
  Tag,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Beat, BeatPack } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { BeatDnaPanel } from './BeatDnaPanel';
import { SmartBeatPairingSection } from './SmartBeatPairingSection';

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
  
  // Feature 15: Volume Control & Session Storage Persistence
  const [volume, setVolume] = useState<number>(() => {
    const saved = sessionStorage.getItem('cashmere_player_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Player States
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isExpandedFullPlayer, setIsExpandedFullPlayer] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<
    'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'seeking' | 'buffering' | 'finished' | 'error' | 'unavailable'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Feature 17: Continue Listening Position Tracker
  const [continueListeningMap, setContinueListeningMap] = useState<Record<string, number>>(() => {
    const saved = sessionStorage.getItem('cashmere_continue_listening');
    return saved ? JSON.parse(saved) : {};
  });
  const [showContinuePrompt, setShowContinuePrompt] = useState<boolean>(false);
  const [promptSavedPosition, setPromptSavedPosition] = useState<number>(0);

  // Feature 18: Recently Played Beats
  const [recentlyPlayedList, setRecentlyPlayedList] = useState<Beat[]>(() => {
    const saved = sessionStorage.getItem('cashmere_recently_played');
    return saved ? JSON.parse(saved) : [];
  });

  // Feature 19: Listening Queue System
  const [queueList, setQueueList] = useState<Beat[]>(() => {
    const saved = sessionStorage.getItem('cashmere_player_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Feature 20: Beat Information Drawer & Expanded Tabs
  const [activeDrawerTab, setActiveDrawerTab] = useState<'info' | 'dna' | 'similar' | 'queue' | 'history'>('info');
  const [showDrawerModal, setShowDrawerModal] = useState<boolean>(false);

  // Write a verse mode
  const [writeVerseMode, setWriteVerseMode] = useState<boolean>(false);
  const [loopInTime, setLoopInTime] = useState<number>(15);
  const [loopOutTime, setLoopOutTime] = useState<number>(45);

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

  useEffect(() => {
    sessionStorage.setItem('cashmere_continue_listening', JSON.stringify(continueListeningMap));
  }, [continueListeningMap]);

  useEffect(() => {
    sessionStorage.setItem('cashmere_recently_played', JSON.stringify(recentlyPlayedList));
  }, [recentlyPlayedList]);

  useEffect(() => {
    sessionStorage.setItem('cashmere_player_queue', JSON.stringify(queueList));
  }, [queueList]);

  // Initialize Audio Player Callbacks
  useEffect(() => {
    try {
      audioSynth.setCallbacks(
        (time, dur) => {
          if (!isDraggingSeek.current) {
            setCurrentTime(time);
          }
          if (dur && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }

          // Feature 17: Save Continue Listening Position (> 5 seconds)
          if (currentBeat && time > 5) {
            setContinueListeningMap((prev) => ({
              ...prev,
              [currentBeat.id]: Math.floor(time),
            }));
          }

          // Beat Pack Sampler Radio 45s Auto-Transition
          if (activeBeatPack && isPlaying && time >= 45) {
            if (onNextBeatPackTrack) onNextBeatPackTrack();
            return;
          }

          // Write A Verse Loop
          if (writeVerseMode && isPlaying && time >= loopOutTime) {
            audioSynth.seek(loopInTime);
            setCurrentTime(loopInTime);
            return;
          }

          if (dur && time >= dur && !isLooping && !writeVerseMode) {
            setPlayerState('finished');
          }
        },
        () => {
          // Feature 19: Queue Autoplay when beat ends!
          if (queueList.length > 0) {
            const nextBeatInQueue = queueList[0];
            setQueueList((prev) => prev.slice(1));
            onPlayToggle(nextBeatInQueue);
          } else if (activeBeatPack && onNextBeatPackTrack) {
            onNextBeatPackTrack();
          } else if (isLooping && currentBeat) {
            audioSynth.seek(0);
            setCurrentTime(0);
          } else if (!writeVerseMode) {
            setCurrentTime(0);
            onNext();
          }
        },
        (errorMsg) => {
          setPlayerState('error');
          setErrorMessage(errorMsg || 'Playback error occurred.');
        },
        (state) => {
          setPlayerState(state);
        }
      );
    } catch (err) {
      setPlayerState('error');
      setErrorMessage('Audio engine failed to initialize.');
    }
  }, [setIsPlaying, isLooping, currentBeat, onNext, writeVerseMode, loopInTime, loopOutTime, isPlaying, queueList, activeBeatPack, onNextBeatPackTrack, onPlayToggle]);

  // Load and play beat when currentBeat changes
  useEffect(() => {
    if (currentBeat) {
      const audioUrl = currentBeat.iaUrl || currentBeat.audioUrl;
      setErrorMessage(null);

      if (!audioUrl) {
        setPlayerState('unavailable');
        setErrorMessage('No real audio stream URL found for this beat product.');
        return;
      }

      // Feature 18: Record Recently Played Beats
      setRecentlyPlayedList((prev) => {
        const filtered = prev.filter((b) => b.id !== currentBeat.id);
        return [currentBeat, ...filtered].slice(0, 15);
      });

      // Feature 17: Check Continue Listening Position
      const savedPos = continueListeningMap[currentBeat.id];
      if (savedPos && savedPos > 5 && savedPos < (currentBeat.durationSeconds || 165) - 5) {
        setPromptSavedPosition(savedPos);
        setShowContinuePrompt(true);
      } else {
        setShowContinuePrompt(false);
      }

      setPlayerState('loading');

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
          setPlayerState('error');
          setErrorMessage(err.message || 'Playback stream error.');
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setPlayerState('idle');
    }
  }, [currentBeat, isPlaying]);

  // Feature 15: Volume Control Function
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

  // Keyboard Shortcuts for Audio Player Navigation & Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if the user is typing in an input, textarea, or contenteditable
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        if (e.shiftKey) {
          // Seek forward 10 seconds
          const target = Math.min(duration, currentTime + 10);
          setCurrentTime(target);
          audioSynth.seek(target);
        } else {
          // Next track
          onNext();
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.shiftKey) {
          // Seek backward 10 seconds
          const target = Math.max(0, currentTime - 10);
          setCurrentTime(target);
          audioSynth.seek(target);
        } else {
          // Prev track
          onPrev();
        }
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyL') {
        setIsLooping(!isLooping);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, setIsPlaying, currentTime, duration, onNext, onPrev, isLooping]);

  // Feature 17: Continue Listening Controls
  const handleContinueFromSaved = () => {
    if (promptSavedPosition > 0) {
      setCurrentTime(promptSavedPosition);
      audioSynth.seek(promptSavedPosition);
    }
    setShowContinuePrompt(false);
  };

  const handleRestartFromBeginning = () => {
    setCurrentTime(0);
    audioSynth.seek(0);
    setShowContinuePrompt(false);
  };

  // Feature 19: Queue Management Helpers
  const addToQueue = (beat: Beat) => {
    if (queueList.some((b) => b.id === beat.id)) return;
    setQueueList((prev) => [...prev, beat]);
  };

  const removeFromQueue = (index: number) => {
    setQueueList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveQueueItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= queueList.length) return;
    const updated = [...queueList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setQueueList(updated);
  };

  const clearQueue = () => {
    setQueueList([]);
  };

  // Feature 13 & Canvas Waveform Renderer
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
        grad.addColorStop(0.5, '#c084fc');
        grad.addColorStop(1, '#7e22ce');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#27272a';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, 2);
      ctx.fill();

      // Playhead Marker
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
  }, [currentTime, duration, isPlaying, isExpandedFullPlayer]);

  if (!currentBeat) return null;

  const formatTime = (secs: number) => {
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
    setPlayerState('seeking');
    setCurrentTime(targetSecs);
    audioSynth.seek(targetSecs);
    setTimeout(() => {
      setPlayerState(isPlaying ? 'playing' : 'paused');
    }, 100);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 16, 20. EXPANDED FULLSCREEN / iPad OVERLAY PLAYER & DRAWER              */}
      {/* ========================================================================= */}
      {isExpandedFullPlayer && (
        <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col p-4 sm:p-8 text-zinc-100 overflow-y-auto font-sans animate-fadeIn">
          {/* Header Navigation */}
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-4 border-b border-zinc-850 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-extrabold text-white text-base sm:text-lg uppercase tracking-wider">
                CASHMERE KID$ ADVANCED PLAYER
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDrawerModal(!showDrawerModal)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-zinc-900 border border-zinc-800 text-purple-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-4 h-4 text-purple-400" />
                <span>BEAT INFO & QUEUE</span>
              </button>

              <button
                onClick={() => {
                  setIsExpandedFullPlayer(false);
                  if (setCurrentView && currentView === 'player') {
                    setCurrentView('home');
                  }
                }}
                className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Collapse Player"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature 17: Continue Listening Banner Prompt */}
          {showContinuePrompt && (
            <div className="max-w-6xl mx-auto w-full mb-6 p-4 bg-purple-950/80 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-200 animate-fadeIn">
              <div className="flex items-center gap-2.5 font-bold font-mono">
                <Clock className="w-5 h-5 text-purple-400 shrink-0" />
                <span>You previously listened to this beat. Continue from {formatTime(promptSavedPosition)}?</span>
              </div>
              <div className="flex items-center gap-3 font-bold">
                <button
                  onClick={handleContinueFromSaved}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow cursor-pointer uppercase font-mono"
                >
                  Continue from {formatTime(promptSavedPosition)}
                </button>
                <button
                  onClick={handleRestartFromBeginning}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl border border-zinc-800 cursor-pointer font-mono"
                >
                  Restart
                </button>
              </div>
            </div>
          )}

          {/* Expanded Player Main Body */}
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start my-auto">
            {/* Left Column: Big Cover Artwork */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative aspect-square w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl group">
                <img
                  src={currentBeat.artworkUrl}
                  alt={currentBeat.title}
                  className="w-full h-full object-cover"
                />
                {playerState === 'loading' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Bar Under Artwork */}
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  onClick={() => onBuyClick(currentBeat)}
                  className="flex-1 min-h-[48px] px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy License ({currencySymbol}{currentBeat.pricing.mp3Lease.toFixed(2)})</span>
                </button>

                <button
                  onClick={() => onFreeDownloadClick(currentBeat)}
                  className="min-h-[48px] p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-2xl cursor-pointer"
                  title="Free Download"
                >
                  <Download className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onShareClick(currentBeat)}
                  className="min-h-[48px] p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-2xl cursor-pointer"
                  title="Share Beat"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => addToQueue(currentBeat)}
                  className="min-h-[48px] p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-purple-300 rounded-2xl cursor-pointer"
                  title="Add to Listening Queue"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column: Waveform, Seekbar, Controls & Drawer Tabs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Beat Info Title Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
                  <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-500/30 rounded">
                    {currentBeat.genre}
                  </span>
                  <span>·</span>
                  <span>{currentBeat.bpm} BPM</span>
                  <span>·</span>
                  <span>{currentBeat.key}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{currentBeat.title}</h1>
                <p className="text-xs text-zinc-400 font-mono">Produced by {currentBeat.producerName || 'CASHMERE KID$'}</p>
              </div>

              {/* Feature 13: Large Interactive Visual Waveform Player */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-3xl space-y-4 shadow-2xl">
                <div
                  className="relative w-full h-24 cursor-pointer"
                  onClick={handleSeek}
                >
                  <canvas ref={fullCanvasRef} width={600} height={96} className="w-full h-full" />
                </div>

                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Player Transport Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-850 rounded-3xl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={onPrev}
                    className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                  </button>

                  <button
                    onClick={onNext}
                    className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-3 rounded-full border cursor-pointer ${
                      isLooping ? 'bg-purple-950 border-purple-500 text-purple-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                    title="Loop Beat"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                {/* Feature 15: Volume Control Slider */}
                <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                  <button onClick={toggleMute} className="text-zinc-400 hover:text-white cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Drawer Modal & Tabs Toggle Row */}
              <div className="bg-zinc-950 p-1.5 rounded-2xl border border-zinc-850 flex text-xs font-extrabold font-mono">
                <button
                  onClick={() => setActiveDrawerTab('info')}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    activeDrawerTab === 'info' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  BEAT INFO (REQ 20)
                </button>
                <button
                  onClick={() => setActiveDrawerTab('queue')}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    activeDrawerTab === 'queue' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  QUEUE ({queueList.length})
                </button>
                <button
                  onClick={() => setActiveDrawerTab('history')}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    activeDrawerTab === 'history' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  RECENTLY PLAYED ({recentlyPlayedList.length})
                </button>
              </div>

              {/* Tab 1: Feature 20 - Beat Information Drawer */}
              {activeDrawerTab === 'info' && (
                <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-3xl space-y-4 text-xs font-mono text-zinc-300 animate-fadeIn">
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                    BEAT METADATA SPECIFICATIONS
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Title</div>
                      <div className="font-bold text-white mt-0.5">{currentBeat.title}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Producer</div>
                      <div className="font-bold text-white mt-0.5">{currentBeat.producerName || 'CASHMERE KID$'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">BPM & Key</div>
                      <div className="font-bold text-white mt-0.5">{currentBeat.bpm} BPM · {currentBeat.key}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Genre</div>
                      <div className="font-bold text-white mt-0.5">{currentBeat.genre}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Duration</div>
                      <div className="font-bold text-white mt-0.5">{formatTime(duration)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Storage Provider</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{currentBeat.storageProvider || 'Internet Archive'}</div>
                    </div>
                  </div>

                  {currentBeat.description && (
                    <div className="pt-2 border-t border-zinc-900">
                      <div className="text-[10px] text-zinc-500 uppercase">Description</div>
                      <p className="text-zinc-300 mt-1 leading-relaxed">{currentBeat.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Feature 19 - Player Listening Queue */}
              {activeDrawerTab === 'queue' && (
                <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      UP NEXT IN QUEUE
                    </h4>
                    {queueList.length > 0 && (
                      <button onClick={clearQueue} className="text-xs text-red-400 hover:text-red-300 font-bold">
                        Clear Queue
                      </button>
                    )}
                  </div>

                  {queueList.length === 0 ? (
                    <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                      Queue is currently empty. Tap the + icon on any beat to add it to your queue.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {queueList.map((beat, idx) => (
                        <div key={`${beat.id}-${idx}`} className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-white">{beat.title}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">{beat.genre} · {beat.bpm} BPM</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => moveQueueItem(idx, 'up')} className="p-1 text-zinc-400 hover:text-white">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveQueueItem(idx, 'down')} className="p-1 text-zinc-400 hover:text-white">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeFromQueue(idx)} className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Feature 18 - Recently Played Beats */}
              {activeDrawerTab === 'history' && (
                <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-3xl space-y-4 animate-fadeIn">
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                    RECENTLY PLAYED SESSION HISTORY
                  </h4>

                  {recentlyPlayedList.length === 0 ? (
                    <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                      No recently played beats yet. Start listening to build your session history.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recentlyPlayedList.map((beat) => (
                        <div key={beat.id} className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-white">{beat.title}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">{beat.duration || '2:45'} · {beat.genre}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => onPlayToggle(beat)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Play
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16. STICKY BOTTOM PLAYER DOCK (MOBILE, iPAD & DESKTOP)                     */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t border-purple-500/30 backdrop-blur-md px-4 py-3 text-white font-sans shadow-2xl">
        
        {/* Error Banner Alert */}
        {playerState === 'error' && (
          <div className="max-w-7xl mx-auto mb-2 p-2 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage || 'Audio playback stream error.'}</span>
            </div>
            <button
              onClick={() => {
                setPlayerState('loading');
                if (currentBeat) onPlayToggle(currentBeat);
              }}
              className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-100 font-bold text-[10px] uppercase rounded-lg border border-red-500/30"
            >
              Retry Loading
            </button>
          </div>
        )}

        <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          
          {/* Left: Beat Artwork & Info */}
          <div className="flex items-center gap-3.5 min-w-0 max-w-xs sm:max-w-sm">
            <div
              className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer shrink-0"
              onClick={() => {
                setIsExpandedFullPlayer(true);
                if (setCurrentView && currentView !== 'player') {
                  setCurrentView('player');
                }
              }}
            >
              <img src={currentBeat.artworkUrl} alt={currentBeat.title} className="w-full h-full object-cover" />
              {playerState === 'loading' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white truncate cursor-pointer hover:text-purple-300" onClick={() => {
                  setIsExpandedFullPlayer(true);
                  if (setCurrentView && currentView !== 'player') {
                    setCurrentView('player');
                  }
                }}>
                  {currentBeat.title}
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                {currentBeat.bpm} BPM · {currentBeat.key}
              </p>
            </div>
          </div>

          {/* Middle: Feature 13 Visual Waveform Canvas & Transport Controls */}
          <div className="hidden md:flex flex-1 items-center gap-4 max-w-xl">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                title="Previous Beat"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105 shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={onNext}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                title="Next Beat"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="relative w-full h-8 cursor-pointer" onClick={handleSeek}>
                <canvas ref={canvasRef} width={400} height={32} className="w-full h-full" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Volume & Expand */}
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                title="Previous Beat"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                title="Next Beat"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onBuyClick(currentBeat)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{currencySymbol}{currentBeat.pricing.mp3Lease.toFixed(2)}</span>
            </button>

            <button
              onClick={() => {
                setIsExpandedFullPlayer(true);
                if (setCurrentView && currentView !== 'player') {
                  setCurrentView('player');
                }
              }}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
              title="Expand Full Player"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
