import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Disc, RefreshCw, SkipForward, Music, AlertTriangle, Layers, Radio, HelpCircle } from 'lucide-react';
import { Beat, BeatPack } from '../types';

interface StorefrontPickerProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  currencySymbol: string;
  onBuyClick: (beat: Beat) => void;
  onAddBeatPackToCart?: (pack: BeatPack) => void;
}

export const StorefrontPicker: React.FC<StorefrontPickerProps> = ({
  beats,
  beatPacks,
  currencySymbol,
  onBuyClick,
  onAddBeatPackToCart,
}) => {
  const [pickerMode, setPickerMode] = useState<'single' | 'pack'>('single');

  // Single Beat Picker states
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isSinglePlaying, setIsSinglePlaying] = useState(false);
  const [singleProgress, setSingleProgress] = useState(0);
  const [singleDuration, setSingleDuration] = useState(0);
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Beat Pack Picker states
  const [selectedPack, setSelectedPack] = useState<BeatPack | null>(null);
  const [packTracks, setPackTracks] = useState<Beat[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPackPlaying, setIsPackPlaying] = useState(false);
  const [packProgress, setPackProgress] = useState(0);
  const [packDuration, setPackDuration] = useState(0);
  const [isPackLoading, setIsPackLoading] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);

  // HTMLAudioElement instances for clean isolation
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);
  const packAudioRef = useRef<HTMLAudioElement | null>(null);

  // 45-second enforce timer refs
  const packTimerIntervalRef = useRef<number | null>(null);

  const eligibleBeats = beats.filter(b => b.published !== false && (b.audioUrl || b.iaUrl));
  const eligiblePacks = beatPacks.filter(p => p.published !== false && p.beatIds && p.beatIds.length > 0);

  // --- SINGLE BEAT PICKER LOGIC ---
  const pickRandomSingleBeat = () => {
    if (eligibleBeats.length === 0) {
      setSelectedBeat(null);
      return;
    }

    // Stop current playing
    stopSingleAudio();

    let randomBeat = selectedBeat;
    if (eligibleBeats.length === 1) {
      randomBeat = eligibleBeats[0];
    } else {
      while (randomBeat?.id === selectedBeat?.id) {
        const randomIndex = Math.floor(Math.random() * eligibleBeats.length);
        randomBeat = eligibleBeats[randomIndex];
      }
    }

    setSelectedBeat(randomBeat);
    setIsSinglePlaying(false);
    setSingleProgress(0);
    setSingleDuration(0);
    setSingleError(null);
  };

  const handlePlayToggleSingle = () => {
    if (!selectedBeat) return;

    if (!singleAudioRef.current) {
      setIsSingleLoading(true);
      const audioUrl = selectedBeat.iaUrl || selectedBeat.audioUrl || '';
      const resolvedUrl = audioUrl.includes('?') 
        ? `${audioUrl}&token=CK-PREVIEW` 
        : `${audioUrl}?token=CK-PREVIEW`;

      const audio = new Audio(resolvedUrl);
      audio.preload = 'auto';
      singleAudioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setSingleDuration(audio.duration || 0);
        setIsSingleLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        setSingleProgress(audio.currentTime || 0);
      });

      audio.addEventListener('ended', () => {
        setIsSinglePlaying(false);
        setSingleProgress(0);
      });

      audio.addEventListener('error', () => {
        setIsSingleLoading(false);
        setSingleError('Unauthorised extraction or network delivery timeout. Check Paper Trail.');
        setIsSinglePlaying(false);
      });
    }

    if (isSinglePlaying) {
      singleAudioRef.current.pause();
      setIsSinglePlaying(false);
    } else {
      // Pause any active pack audio
      stopPackAudio();

      singleAudioRef.current.play()
        .then(() => setIsSinglePlaying(true))
        .catch(() => {
          setSingleError('Security check failed: Direct stream block. Check credentials.');
          setIsSingleLoading(false);
        });
    }
  };

  const stopSingleAudio = () => {
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      singleAudioRef.current = null;
    }
    setIsSinglePlaying(false);
    setSingleProgress(0);
  };

  // --- BEAT PACK PICKER LOGIC ---
  const pickRandomBeatPack = () => {
    if (eligiblePacks.length === 0) {
      setSelectedPack(null);
      return;
    }

    stopPackAudio();

    let randomPack = selectedPack;
    if (eligiblePacks.length === 1) {
      randomPack = eligiblePacks[0];
    } else {
      while (randomPack?.id === selectedPack?.id) {
        const randomIndex = Math.floor(Math.random() * eligiblePacks.length);
        randomPack = eligiblePacks[randomIndex];
      }
    }

    setSelectedPack(randomPack);

    // Load actual catalog tracks inside this Beat Pack
    const tracks = beats.filter(b => randomPack?.beatIds.includes(b.id) && b.published !== false && (b.audioUrl || b.iaUrl));
    setPackTracks(tracks);
    setCurrentTrackIndex(0);

    setIsPackPlaying(false);
    setPackProgress(0);
    setPackDuration(0);
    setPackError(null);
  };

  const handlePlayTogglePack = () => {
    if (packTracks.length === 0) {
      setPackError('No playable audio tracks found inside this Beat Pack.');
      return;
    }

    const currentTrack = packTracks[currentTrackIndex];
    if (!currentTrack) return;

    if (!packAudioRef.current) {
      setIsPackLoading(true);
      const audioUrl = currentTrack.iaUrl || currentTrack.audioUrl || '';
      const resolvedUrl = audioUrl.includes('?') 
        ? `${audioUrl}&token=CK-PREVIEW` 
        : `${audioUrl}?token=CK-PREVIEW`;

      const audio = new Audio(resolvedUrl);
      audio.preload = 'auto';
      packAudioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setPackDuration(audio.duration || 0);
        setIsPackLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime || 0;
        setPackProgress(current);

        // ENFORCE CRITICAL 45-SECOND PREVIEW REQUIREMENT
        if (current >= 45) {
          console.log('[PackPicker] Track limit of 45s reached. Advancing automatically.');
          handleAdvanceTrack();
        }
      });

      audio.addEventListener('ended', () => {
        handleAdvanceTrack();
      });

      audio.addEventListener('error', () => {
        setIsPackLoading(false);
        setPackError('Protected file streaming exception.');
        setIsPackPlaying(false);
      });
    }

    if (isPackPlaying) {
      packAudioRef.current.pause();
      setIsPackPlaying(false);
    } else {
      // Pause any active single audio
      stopSingleAudio();

      packAudioRef.current.play()
        .then(() => setIsPackPlaying(true))
        .catch(() => {
          setPackError('Direct file extraction blocked. Authorization rejected.');
          setIsPackLoading(false);
        });
    }
  };

  const handleAdvanceTrack = () => {
    stopPackAudioOnly();

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < packTracks.length) {
      setCurrentTrackIndex(nextIndex);
      setIsPackPlaying(false);
      setPackProgress(0);
      setPackDuration(0);
      
      // Auto-play the next track
      setTimeout(() => {
        handlePlayTogglePack();
      }, 150);
    } else {
      // Reached the end of pack queue
      setCurrentTrackIndex(0);
      setIsPackPlaying(false);
      setPackProgress(0);
      setPackDuration(0);
    }
  };

  const stopPackAudioOnly = () => {
    if (packAudioRef.current) {
      packAudioRef.current.pause();
      packAudioRef.current = null;
    }
  };

  const stopPackAudio = () => {
    stopPackAudioOnly();
    setIsPackPlaying(false);
    setPackProgress(0);
  };

  // Pick initial options on mount
  useEffect(() => {
    if (eligibleBeats.length > 0 && !selectedBeat) {
      setSelectedBeat(eligibleBeats[0]);
    }
    if (eligiblePacks.length > 0 && !selectedPack) {
      const initialPack = eligiblePacks[0];
      setSelectedPack(initialPack);
      const tracks = beats.filter(b => initialPack.beatIds.includes(b.id) && b.published !== false && (b.audioUrl || b.iaUrl));
      setPackTracks(tracks);
    }

    // Cleanup/Unmount hook to absolutely isolate audio execution
    return () => {
      if (singleAudioRef.current) {
        singleAudioRef.current.pause();
      }
      if (packAudioRef.current) {
        packAudioRef.current.pause();
      }
      if (packTimerIntervalRef.current) {
        clearInterval(packTimerIntervalRef.current);
      }
    };
  }, [beats, beatPacks]);

  // Clean unmount helper
  const handleSeekSingle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (singleAudioRef.current) {
      singleAudioRef.current.currentTime = val;
      setSingleProgress(val);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="py-12 bg-zinc-950 border-t border-b border-zinc-900 overflow-hidden relative">
      {/* Background neon ambient pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative space-y-8">
        
        {/* Module Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">LUXURY AUDIO VAULT</span>
          <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight">THE ANALOG BEAT SELECTOR</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            Press the machine button and let the cashmere selector dial randomly into real studio files on the Internet Archive.
          </p>
        </div>

        {/* Mode Selectors */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              stopSingleAudio();
              stopPackAudio();
              setPickerMode('single');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
              pickerMode === 'single'
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-md shadow-purple-950'
                : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Single Beat Selector</span>
          </button>
          <button
            onClick={() => {
              stopSingleAudio();
              stopPackAudio();
              setPickerMode('pack');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
              pickerMode === 'pack'
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-md shadow-purple-950'
                : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Beat Pack Selector</span>
          </button>
        </div>

        {/* Main Picker Deck */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          
          {/* Deck Left: Interactive Spinning Record */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              {/* Turntable Arm/Needle element */}
              <div className="absolute top-[-10px] right-2 w-16 h-20 bg-transparent border-t-2 border-r-2 border-zinc-700 rounded-tr-xl transform rotate-[-20deg] origin-top-left transition-transform duration-500 z-10 pointer-events-none group-hover:rotate-[10deg]" />

              {/* Spindle center hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-950 border-2 border-zinc-700 rounded-full z-20" />

              <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-[6px] border-zinc-850 shadow-2xl relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
                (pickerMode === 'single' ? isSinglePlaying : isPackPlaying) ? 'animate-spin-slow' : 'scale-98'
              }`}>
                {/* Vinyl Grooves texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] border border-white/5 rounded-full" />
                
                {/* Vinyl Label Artwork */}
                <img
                  src={
                    pickerMode === 'single'
                      ? selectedBeat?.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80'
                      : selectedPack?.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80'
                  }
                  alt="Label"
                  className="w-20 h-20 rounded-full object-cover border-2 border-black z-10"
                />
              </div>
            </div>

            {/* Selector Trigger Dial */}
            <div className="space-y-2 text-center w-full">
              <button
                onClick={pickerMode === 'single' ? pickRandomSingleBeat : pickRandomBeatPack}
                className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                title={pickerMode === 'single' ? 'Pick Another Single' : 'Pick Another Pack'}
              >
                <RefreshCw className="w-5 h-5 text-white animate-pulse" />
              </button>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                {pickerMode === 'single' ? 'SELECT RANDOM SINGLE' : 'SELECT RANDOM PACK'}
              </span>
            </div>
          </div>

          {/* Deck Right: Selected Product Metadata and Independent Player Controls */}
          <div className="space-y-6 text-left flex flex-col justify-between h-full py-2">
            
            {/* Metadata Info Panel */}
            {pickerMode === 'single' ? (
              selectedBeat ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">SINGLE INSTRUMENTAL</span>
                    <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight line-clamp-1">{selectedBeat.title}</h3>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 font-bold">
                      <span className="bg-zinc-900 px-2 py-0.5 rounded uppercase">{selectedBeat.genre}</span>
                      <span className="bg-zinc-900 px-2 py-0.5 rounded">{selectedBeat.bpm} BPM</span>
                      <span className="bg-zinc-900 px-2 py-0.5 rounded">{selectedBeat.key}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{selectedBeat.description || 'Premium platinum Trap / Dark Synth studio master track licensed directly.'}</p>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-sm font-mono font-bold text-zinc-400">MP3 Lease Licence:</span>
                    <span className="text-lg font-mono font-black text-purple-300">{currencySymbol}{selectedBeat.pricing?.mp3Lease?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">No beats available in catalog yet.</div>
              )
            ) : (
              selectedPack ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">BEAT PACK STEM BUNDLE</span>
                    <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight line-clamp-1">{selectedPack.name}</h3>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 font-bold">
                      <span className="bg-zinc-900 px-2 py-0.5 rounded uppercase">BUNDLE PACK</span>
                      <span className="bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/10 uppercase">
                        {packTracks.length} tracks detected
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{selectedPack.description || 'Premium full-stems beat pack compiled for instant download.'}</p>
                  
                  {packTracks.length > 0 && (
                    <div className="space-y-1.5 p-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                      <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">PREVIEW QUEUE (45S SAMPLER)</div>
                      <div className="text-xs font-bold text-white flex justify-between items-center">
                        <span className="truncate uppercase text-purple-300">Track {currentTrackIndex + 1}: {packTracks[currentTrackIndex]?.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0">({currentTrackIndex + 1}/{packTracks.length})</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-mono font-bold text-zinc-400">Bundle Price:</span>
                    <span className="text-lg font-mono font-black text-purple-300">{currencySymbol}{(selectedPack.price).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">No Beat Packs available in catalog yet.</div>
              )
            )}

            {/* Error Indicators */}
            {pickerMode === 'single' ? (
              singleError && <div className="text-[10px] text-red-400 bg-red-950/40 border border-red-500/25 p-2 rounded-xl flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span>{singleError}</span></div>
            ) : (
              packError && <div className="text-[10px] text-red-400 bg-red-950/40 border border-red-500/25 p-2 rounded-xl flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span>{packError}</span></div>
            )}

            {/* Player Seek & Controls */}
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              {pickerMode === 'single' ? (
                selectedBeat && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 font-semibold">
                      <span>{formatTime(singleProgress)}</span>
                      <span>{formatTime(singleDuration)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={singleDuration || 100}
                      value={singleProgress}
                      onChange={handleSeekSingle}
                      className="w-full h-1 bg-zinc-900 accent-purple-500 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handlePlayToggleSingle}
                        disabled={isSingleLoading}
                        className="py-3 px-6 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSinglePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                        <span>{isSingleLoading ? 'Loading...' : isSinglePlaying ? 'Pause Stream' : 'Listen Stream'}</span>
                      </button>
                      <button
                        onClick={() => onBuyClick(selectedBeat)}
                        className="py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex-1 text-center"
                      >
                        License Beat
                      </button>
                    </div>
                  </div>
                )
              ) : (
                selectedPack && (
                  <div className="space-y-2">
                    {/* Countdown and limit details */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                      <span className="text-purple-400 uppercase tracking-wider flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>45s Sampler Active</span>
                      </span>
                      <span>{formatTime(packProgress)} / 0:45</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${(Math.min(packProgress, 45) / 45) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handlePlayTogglePack}
                        disabled={isPackLoading}
                        className="py-3 px-5 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {isPackPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                        <span>{isPackLoading ? 'Loading...' : isPackPlaying ? 'Pause' : 'Play Preview'}</span>
                      </button>
                      {packTracks.length > 1 && (
                        <button
                          onClick={handleAdvanceTrack}
                          className="p-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Skip to Next Track"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      )}
                      {onAddBeatPackToCart && (
                        <button
                          onClick={() => onAddBeatPackToCart(selectedPack)}
                          className="py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex-1 text-center"
                        >
                          Licence Pack
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
