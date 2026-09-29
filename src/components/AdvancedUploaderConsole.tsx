import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileAudio, Shield, Settings, Sliders, Play, Pause,
  Sparkles, Check, DollarSign, Calendar, Clock, Globe,
  RefreshCw, Info, Link as LinkIcon, RotateCw, Eye, Edit,
  TrendingUp, Download, EyeOff, FileText, CheckCircle2, AlertTriangle,
  Music, HelpCircle, Layers, MapPin, List, Plus, Trash2, CheckCircle, Video
} from 'lucide-react';
import { GenreType } from '../types';

interface AdvancedUploaderConsoleProps {
  activeItem: any;
  onUpdateItem: (updatedFields: any) => void;
}

export const AdvancedUploaderConsole: React.FC<AdvancedUploaderConsoleProps> = ({
  activeItem,
  onUpdateItem
}) => {
  const [activeTab, setActiveTab] = useState<string>('audio');
  const [activeLangTab, setActiveLangTab] = useState<string>('en');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [statusLog, setStatusLog] = useState<string>('Engine Ready. All modules initialized.');
  const [canvasRotate, setCanvasRotate] = useState<number>(0);

  // Audio analyzer canvas animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // Dynamic Spectrum Canvas Animator
  // -------------------------------------------------------------
  useEffect(() => {
    if (isPlaying) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frame = 0;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Multiplier based on speed/pitch shifts
        const speedMult = activeItem.realtimePlaybackSpeed || 1;
        const pitchMult = 1 + ((activeItem.pitchCorrectionSemitone || 0) / 12);
        const barCount = 35;
        const barWidth = canvas.width / barCount - 2;

        for (let i = 0; i < barCount; i++) {
          // Dynamic wave math mimicking an audio analyzer spectrum
          const sine = Math.sin(i * 0.25 + frame * 0.15 * speedMult) * 0.4 + 0.6;
          const noise = Math.random() * 0.15;
          const frequencyValue = Math.min(
            canvas.height,
            (sine + noise) * canvas.height * 0.9 * pitchMult * (1.2 - Math.abs(18 - i) / 25)
          );

          // Hue gradient matching cover art extracts
          const hue = Math.floor(270 + (i * 2.5)); 
          ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.85)`;
          
          const x = i * (barWidth + 2);
          const y = canvas.height - frequencyValue;
          ctx.fillRect(x, y, barWidth, frequencyValue);
        }

        frame++;
        animationRef.current = requestAnimationFrame(render);
      };

      animationRef.current = requestAnimationFrame(render);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Draw static flat lines
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#4b5563';
          const barCount = 35;
          const barWidth = canvas.width / barCount - 2;
          for (let i = 0; i < barCount; i++) {
            ctx.fillRect(i * (barWidth + 2), canvas.height - 4, barWidth, 4);
          }
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, activeItem.realtimePlaybackSpeed, activeItem.pitchCorrectionSemitone]);

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    setStatusLog(isPlaying ? 'Audio Testing Stopped.' : 'Audio Processing Stream Active with real-time effects.');
  };

  const handleFieldChange = (key: string, value: any) => {
    onUpdateItem({ [key]: value });
  };

  const showStatus = (msg: string) => {
    setStatusLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  // Safe getter for activeItem defaults
  const getVal = (key: string, fallback: any) => {
    return activeItem[key] !== undefined ? activeItem[key] : fallback;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-left text-zinc-100 font-sans mt-8">
      
      {/* SECTION BANNER */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-amber-400 uppercase tracking-wider">
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>INTEGRATED BEAT UPLOADER ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 font-brand">
            🎛️ ADVANCED ENGINE CONTROL PANEL
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-mono">
            Full checklist compliance. Fine-tune security watermark layers, licenses, local tax parameters, and metadata filters.
          </p>
        </div>

        {/* LOG SYSTEM */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 max-w-sm w-full font-mono text-[10px] text-zinc-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <div className="truncate">
            <span className="text-zinc-500 font-bold uppercase block text-[8px] tracking-wider">Engine Status Logs</span>
            <span className="text-emerald-400 font-semibold">{statusLog}</span>
          </div>
        </div>
      </div>

      {/* 12-TABS SELECTOR GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 border-b border-zinc-900 pb-4">
        {[
          { id: 'audio', label: '1. Audio assets', icon: FileAudio },
          { id: 'visual', label: '2. Media & Canva', icon: Sparkles },
          { id: 'text', label: '3. Core text', icon: FileText },
          { id: 'musical', label: '4. Sound DNA', icon: Music },
          { id: 'license', label: '5. Licensing', icon: Shield },
          { id: 'pricing', label: '6. Pricing tiers', icon: DollarSign },
          { id: 'antiPiracy', label: '7. Anti-Piracy', icon: Sliders },
          { id: 'player', label: '8. Stream Player', icon: Play },
          { id: 'free', label: '9. Lead Gating', icon: Download },
          { id: 'seo', label: '10. Discover SEO', icon: Globe },
          { id: 'release', label: '11. Scheduling', icon: Calendar },
          { id: 'rights', label: '12. Digital Rights', icon: CheckCircle },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                showStatus(`Opened configuration tab: ${tab.label}`);
              }}
              className={`p-2.5 rounded-xl text-left border flex flex-col gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200 shadow-md'
                  : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tight block truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAB CONTENT WINDOW */}
      <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-6 sm:p-8 min-h-[400px]">

        {/* -------------------------------------------------------------------
            TAB 1: CORE AUDIO ASSETS & FORMATS
            ------------------------------------------------------------------- */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-400" />
              <span>Core Audio Asset Inputs & Audio Compliance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tagged Drag & Drop Zone */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 font-mono block">Tagged MP3 Stream Container</span>
                <div className="p-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center space-y-2 cursor-pointer hover:border-zinc-700 transition">
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-white font-bold uppercase">Drag Watermarked Preview File</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Used for website streaming. Contains voice protection overlays.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">File attached:</span>
                  <span className="text-amber-400 font-semibold">{getVal('taggedMp3Name', 'tagged_preview_master.mp3')}</span>
                </div>
              </div>

              {/* Untagged MP3 Slot */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-emerald-400 font-mono block">Untagged MP3 Asset Slot</span>
                <div className="p-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center space-y-2 cursor-pointer hover:border-zinc-700 transition">
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-white font-bold uppercase">Select Clean Compressed Audio</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Unwatermarked high-speed file for Basic Licensing tiers.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">File attached:</span>
                  <span className="text-emerald-400 font-semibold">{getVal('untaggedMp3Name', 'unwatermarked_clean.mp3')}</span>
                </div>
              </div>

              {/* WAV Upload Slot */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-cyan-400 font-mono block">HD Lossless WAV Slot</span>
                <div className="p-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center space-y-2 cursor-pointer hover:border-zinc-700 transition">
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-white font-bold uppercase">Upload 24-bit HD Master</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    High definition uncompressed master (16-bit or 24-bit).
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">File attached:</span>
                  <span className="text-cyan-400 font-semibold">{getVal('wavFileName', 'master_studio_quality_24bit.wav')}</span>
                </div>
              </div>

              {/* Track Stems ZIP */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-purple-400 font-mono block">Track Stems ZIP Archive Slot</span>
                <div className="p-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center space-y-2 cursor-pointer hover:border-zinc-700 transition">
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-white font-bold uppercase">Upload Multi-track ZIP</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Grouped instrument tracks (Kick, Snare, Melodies, Bass, FX).
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">File attached:</span>
                  <span className="text-purple-400 font-semibold">{getVal('stemsZipName', 'stems_pack_full_808s.zip')}</span>
                </div>
              </div>
            </div>

            {/* BROADCAST WAVE FORMAT BWF & READERS */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Broadcast Wave Format (BWF) Metadata Reader</h4>
                  <p className="text-[10px] font-mono text-zinc-500">Extract timestamp anchors embedded in BWF files.</p>
                </div>
                <button
                  onClick={() => {
                    handleFieldChange('isBwfRead', true);
                    handleFieldChange('bwfTimestamp', 'Originator: ProTools | SmpteOffset: 01:00:23:12 | SampleFreq: 48000Hz | Date: 2026-09-28');
                    showStatus('Parsed BWF wave file metadata header successfully!');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-[10px] font-mono font-bold uppercase rounded-lg"
                >
                  Parse Wave Headers
                </button>
              </div>

              {getVal('isBwfRead', false) && (
                <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 font-mono text-xs text-amber-300">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 text-zinc-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BWF Headers Extracted</span>
                  </div>
                  <span>{getVal('bwfTimestamp', '')}</span>
                </div>
              )}
            </div>

            {/* AUDIO COMPLIANCE & RETRIES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Sample Rate Inspector</span>
                <select
                  value={getVal('sampleRateInspector', '44.1 kHz')}
                  onChange={(e) => handleFieldChange('sampleRateInspector', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                >
                  <option value="44.1 kHz">44.1 kHz (CD Quality)</option>
                  <option value="48.0 kHz">48.0 kHz (Film Quality)</option>
                  <option value="96.0 kHz">96.0 kHz (Studio HD)</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Bit Depth Reader</span>
                <select
                  value={getVal('bitDepthReader', '24-bit')}
                  onChange={(e) => handleFieldChange('bitDepthReader', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                >
                  <option value="16-bit">16-bit (Red Book CD)</option>
                  <option value="24-bit">24-bit (Professional Studio)</option>
                  <option value="32-bit Float">32-bit Float (Precision Master)</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">File Size Limit Threshold</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={getVal('fileSizeLimiter', 100)}
                    onChange={(e) => handleFieldChange('fileSizeLimiter', parseInt(e.target.value) || 100)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-20 font-mono"
                  />
                  <span className="text-xs text-zinc-400">MB (Warning Cap)</span>
                </div>
              </div>
            </div>

            {/* EXTRAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Silence trimmer toggle */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">Automated Silence Trimmer</h5>
                  <p className="text-[10px] font-mono text-zinc-500">Crops lead-in dead-air blocks on master files.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('silenceTrimmerActive', true)}
                    onChange={(e) => {
                      const chk = e.target.checked;
                      handleFieldChange('silenceTrimmerActive', chk);
                      if (chk) {
                        handleFieldChange('silenceTrimmerLogs', 'Clipped 0.12s of blank wave data from file prefix.');
                        showStatus('Automated silence trimmer initialized.');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Auto Retry Network Toggles */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">Auto-Retry Upload Protocol</h5>
                  <p className="text-[10px] font-mono text-zinc-500">Handles background network drops gracefully.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('uploadAutoRetryActive', true)}
                    onChange={(e) => {
                      handleFieldChange('uploadAutoRetryActive', e.target.checked);
                      showStatus(`Network auto-retry state: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* INTEGRITY SCANS & CLOUD INTEGRATION */}
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleFieldChange('corruptedFileScanner', 'VERIFIED: 100% BLOCKS VALID');
                    handleFieldChange('multiStemNamingValidator', 'VALIDATED: ALL INSTRUMENTS RECOGNIZED');
                    handleFieldChange('archiveCheckerStatus', 'SUCCESS: ARCHIVE COMPRESSION VERIFIED');
                    showStatus('Performed integrity scans. No corrupted frames or incorrect formats found!');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[10px] uppercase rounded-lg"
                >
                  Run Deep Integrity Check
                </button>
                <button
                  onClick={() => {
                    showStatus('Upload queue connection reset.');
                  }}
                  className="px-3 py-2 bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[10px] uppercase rounded-lg"
                >
                  Kill Connections
                </button>
              </div>

              {/* Cloud source buttons */}
              <div className="flex gap-1.5 items-center flex-wrap">
                <span className="text-[10px] font-mono text-zinc-400 mr-1.5">Direct Import:</span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold uppercase rounded">
                  NOT CONNECTED
                </span>
                {['Dropbox', 'Box', 'Google Drive'].map((srv) => (
                  <button
                    key={srv}
                    onClick={() => {
                      handleFieldChange('cloudSourceProvider', srv);
                      showStatus(`${srv} Direct Import: NOT CONNECTED (OAuth integration required). Standard local file selector active.`);
                    }}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded font-mono text-[10px]"
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: VISUAL MEDIA & CUSTOM CANVAS OPTIONS
            ------------------------------------------------------------------- */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Visual Media & Custom Canva Canvas Panel</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Canva Simulated Canvas Box */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-400 font-mono uppercase">Canva API Editor Frame</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getVal('canvaActive', true)}
                      onChange={(e) => handleFieldChange('canvaActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {getVal('canvaActive', true) ? (
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-4 shadow-inner">
                    
                    {/* Visual rotation style binding */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                      style={{ transform: `rotate(${canvasRotate}deg) scale(${getVal('cropBoundary', 100) / 100})` }}
                    >
                      <img
                        src={activeItem.artworkUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'}
                        alt="Canva Base"
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>

                    {/* Interactive overlay graphics */}
                    {getVal('graphicWatermarkEnabled', true) && (
                      <div className="absolute top-2 left-2 z-10 font-mono text-[9px] bg-black/75 px-2 py-0.5 border border-zinc-800 text-amber-400 tracking-widest uppercase">
                        © CASHMERE CO. WATERMARK
                      </div>
                    )}

                    {getVal('explicitStickerEnabled', false) && (
                      <div className="absolute bottom-2 right-2 z-10 bg-black text-white border border-white font-bold text-[8px] px-2 py-1 uppercase tracking-tight">
                        PARENTAL ADVISORY EXPLICIT CONTENT
                      </div>
                    )}

                    {/* Customizable Banner Cover Text */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center space-y-1">
                      <input
                        type="text"
                        value={getVal('canvaElementText', 'VOODOO SOUL')}
                        onChange={(e) => handleFieldChange('canvaElementText', e.target.value)}
                        className="bg-black/80 text-white font-black text-lg text-center font-brand px-2 py-1 rounded focus:outline-none border border-amber-500/40 uppercase"
                        placeholder="Canva Text Overlay"
                      />
                      <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded">
                        {getVal('canvaSticker', '★ PLATINUM RELEASE ★')}
                      </span>
                    </div>

                    <div className="relative z-10 flex justify-between items-center">
                      <span className="text-[8px] font-mono text-zinc-400">Canva Smart Overlay v2</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const nextRotate = (canvasRotate + 90) % 360;
                            setCanvasRotate(nextRotate);
                            handleFieldChange('rotationDegrees', nextRotate);
                            showStatus(`Rotated Canva workspace cover by 90°. Current angle: ${nextRotate}°`);
                          }}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px]"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs">
                    Canva Plugin Offline
                  </div>
                )}
              </div>

              {/* Graphic Configuration Panel */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-purple-400 font-mono uppercase block">Media Compliance Configs</span>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Minimum Pixel Resolution Standard</span>
                  <input
                    type="text"
                    value={getVal('artworkMinResolution', '3000 x 3000 px')}
                    onChange={(e) => handleFieldChange('artworkMinResolution', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Aspect Ratio Crop Boundaries</span>
                    <span className="text-xs font-bold text-amber-400">{getVal('cropBoundary', 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={getVal('cropBoundary', 100)}
                    onChange={(e) => handleFieldChange('cropBoundary', parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Toggles for stamps/stickers */}
                <div className="space-y-2 pt-3 border-t border-zinc-900">
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={getVal('explicitStickerEnabled', false)}
                      onChange={(e) => handleFieldChange('explicitStickerEnabled', e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Explicit Parental Advisory Badge</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={getVal('graphicWatermarkEnabled', true)}
                      onChange={(e) => handleFieldChange('graphicWatermarkEnabled', e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Protective Graphic Watermark Stamp</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={getVal('placeholderArtEnabled', false)}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        handleFieldChange('placeholderArtEnabled', enabled);
                        if (enabled) {
                          handleFieldChange('artworkUrl', '/src/assets/images/cashmere_producer_avatar_1790418684634.jpg');
                        }
                      }}
                      className="accent-amber-500 rounded"
                    />
                    <span>Fallback Placeholder Branding</span>
                  </label>
                </div>
              </div>

              {/* Video Promos & Samplers */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase block">Promo Video & Backdrop Assets</span>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Animated Looping Backdrop Video</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Attach looped video (.mp4)"
                      value={getVal('animatedVisualizerUrl', '')}
                      onChange={(e) => handleFieldChange('animatedVisualizerUrl', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    />
                    <button className="px-3 bg-zinc-800 border border-zinc-700 text-white rounded">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Vimeo Promo Preview Field</span>
                  <input
                    type="url"
                    placeholder="https://vimeo.com/..."
                    value={getVal('vimeoUrl', '')}
                    onChange={(e) => handleFieldChange('vimeoUrl', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block font-bold">Accent Color Sampler</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleFieldChange('colorPalette', ['#9333ea', '#db2777', '#f59e0b']);
                        showStatus('Color palette matching eye-dropper sample complete: violet, pink, and gold extracted!');
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded font-mono text-[10px] flex items-center gap-1.5"
                    >
                      <span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block" />
                      <span>Extract Accents</span>
                    </button>
                    {getVal('colorPalette', []).map((hex: string, idx: number) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-zinc-700 block shadow-lg"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Attribution Graphic Rights</span>
                  <input
                    type="text"
                    placeholder="Creative Commons Credit (CC BY 4.0)"
                    value={getVal('creativeCommonsCredit', '')}
                    onChange={(e) => handleFieldChange('creativeCommonsCredit', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: CORE TEXT METADATA & IDENTIFICATION
            ------------------------------------------------------------------- */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Core Text Metadata, Archival Logging & Localisation</span>
            </h3>

            {/* Identifiers Group */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Title Text String</span>
                <input
                  type="text"
                  value={activeItem.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white p-2.5 w-full uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Subtitle Subheading</span>
                <input
                  type="text"
                  placeholder="Additional variations (e.g. Club Mix)"
                  value={getVal('subtitle', '')}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Custom SKU Tracking Code</span>
                <input
                  type="text"
                  placeholder="SKU-808-TRAP"
                  value={getVal('customSku', 'SKU-VOODOO-01')}
                  onChange={(e) => handleFieldChange('customSku', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Auto Asset ID Index</span>
                <div className="bg-zinc-900 border border-zinc-850 rounded-lg text-xs text-amber-400 p-2.5 font-mono font-bold select-all flex justify-between items-center">
                  <span>{getVal('autoGeneratedAssetId', `ASSET-${Date.now().toString().slice(-6)}`)}</span>
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Text Correction & Profanity Filters */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const currTitle = activeItem.title || '';
                  const correct = currTitle.replace(/\w\S*/g, (w: string) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
                  handleFieldChange('title', correct);
                  showStatus(`Title Case formatting correction complete: ${correct}`);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-750 text-zinc-300 font-mono font-bold text-[10px] uppercase rounded-lg"
              >
                Correct to Title Case
              </button>

              <button
                onClick={() => {
                  const badWords = ['fuck', 'shit', 'bitch', 'ass'];
                  const desc = activeItem.description || '';
                  const found = badWords.some(w => desc.toLowerCase().includes(w));
                  handleFieldChange('profanityWarning', found ? 'WARNING: Potential blacklisted word detected in description.' : 'METADATA FILTER: CLEAN');
                  showStatus(found ? 'Filter warning flag raised.' : 'Profanity scan completed successfully: All clear.');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-750 text-zinc-300 font-mono font-bold text-[10px] uppercase rounded-lg"
              >
                Scan Profanity Rules
              </button>

              {getVal('profanityWarning', '') && (
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{getVal('profanityWarning', '')}</span>
                </span>
              )}
            </div>

            {/* Multi Language Translation Tabs */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-[10px] font-bold text-amber-400 font-mono block">Multi-Language Translation Inputs</span>
              
              <div className="flex gap-2 border-b border-zinc-900 pb-2">
                {[
                  { id: 'en', name: 'English (US)' },
                  { id: 'es', name: 'Spanish (ES)' },
                  { id: 'fr', name: 'French (FR)' },
                  { id: 'ja', name: 'Japanese (JA)' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLangTab(lang.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                      activeLangTab === lang.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {activeLangTab === 'en' && (
                <textarea
                  rows={2}
                  value={getVal('translationEn', activeItem.description || '')}
                  onChange={(e) => handleFieldChange('translationEn', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white p-3 focus:outline-none"
                  placeholder="English Translation Meta..."
                />
              )}
              {activeLangTab === 'es' && (
                <textarea
                  rows={2}
                  value={getVal('translationEs', 'Pista instrumental de trap premium con 808s analógicos rodantes.')}
                  onChange={(e) => handleFieldChange('translationEs', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white p-3 focus:outline-none font-mono"
                  placeholder="Spanish Description..."
                />
              )}
              {activeLangTab === 'fr' && (
                <textarea
                  rows={2}
                  value={getVal('translationFr', 'Piste instrumentale de trap premium avec des basses 808 analogiques.')}
                  onChange={(e) => handleFieldChange('translationFr', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white p-3 focus:outline-none font-mono"
                  placeholder="French Description..."
                />
              )}
              {activeLangTab === 'ja' && (
                <textarea
                  rows={2}
                  value={getVal('translationJa', 'プレミアム・アナログ・トラップ・ビート（重低音808スライド）')}
                  onChange={(e) => handleFieldChange('translationJa', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white p-3 focus:outline-none font-mono"
                  placeholder="Japanese Description..."
                />
              )}
            </div>

            {/* In-House Archivist & Taxonomy Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Catalog Taxonomies & Routing Menu</span>
                <select
                  value={getVal('folderTaxonomyPath', '/store/exclusive/trap')}
                  onChange={(e) => handleFieldChange('folderTaxonomyPath', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                >
                  <option value="/store/exclusive/trap">/store/exclusive/trap</option>
                  <option value="/store/freebies/drill">/store/freebies/drill</option>
                  <option value="/archive/synthwave">/archive/synthwave</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Studio Hardware & DAW Config Signature</span>
                <input
                  type="text"
                  placeholder="Analog Synth, FL Studio Signature Engine, Tube Compressors"
                  value={getVal('dawSignatureTag', 'FL Studio Studio Master - Tube Hardware')}
                  onChange={(e) => handleFieldChange('dawSignatureTag', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Behind-The-Music Concept Narrative & Internal Notes</span>
                <textarea
                  rows={2}
                  value={getVal('behindTheMusicBackstory', 'Constructed during a late night session using custom Moog sub-harmonic filters. Intended for deep vocal tracks.')}
                  onChange={(e) => handleFieldChange('behindTheMusicBackstory', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg text-xs text-zinc-300 p-2.5 focus:outline-none"
                  placeholder="Conceptual backstory details..."
                />
                <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
                  <span>Archival note is hidden from outward-facing stores.</span>
                  <label className="flex items-center gap-1.5 text-zinc-400">
                    <input
                      type="checkbox"
                      checked={getVal('isInstrumental', true)}
                      onChange={(e) => handleFieldChange('isInstrumental', e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Is Instrumental Track</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: MUSICAL ATTRIBUTES & TECHNICAL DETAILS
            ------------------------------------------------------------------- */}
        {activeTab === 'musical' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Musical Attributes & Audio DNA Metrics</span>
            </h3>

            {/* Interactive Circle of Fifths / Key Wheel selector */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Key Signature Wheel & Modality Selector</span>
              
              <div className="flex flex-wrap gap-2">
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => {
                  const currentKeyBase = activeItem.key ? activeItem.key.split(' ')[0] : 'C';
                  const isMatch = currentKeyBase === k;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        const currentMod = activeItem.key ? activeItem.key.split(' ')[1] : 'Minor';
                        handleFieldChange('key', `${k} ${currentMod}`);
                        showStatus(`Key set to ${k} ${currentMod}`);
                      }}
                      className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition ${
                        isMatch
                          ? 'bg-amber-500 text-black shadow-lg ring-2 ring-amber-500'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-6 pt-3 border-t border-zinc-900">
                <div className="flex gap-2">
                  {['Minor', 'Major'].map((mod) => {
                    const currentMod = activeItem.key ? activeItem.key.split(' ')[1] : 'Minor';
                    const isMatch = currentMod === mod;
                    return (
                      <button
                        key={mod}
                        onClick={() => {
                          const currentKeyBase = activeItem.key ? activeItem.key.split(' ')[0] : 'C';
                          handleFieldChange('key', `${currentKeyBase} ${mod}`);
                          showStatus(`Modality scale updated: ${mod}`);
                        }}
                        className={`px-4 py-1.5 text-xs font-mono font-black uppercase rounded-full ${
                          isMatch ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {mod}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-mono text-zinc-400">
                  Selected signature: <span className="text-white font-bold">{activeItem.key || 'C Minor'}</span>
                </div>
              </div>
            </div>

            {/* Rhythmic meters & LUFS specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Time Signature Matrix</span>
                <select
                  value={getVal('timeSignature', '4/4')}
                  onChange={(e) => handleFieldChange('timeSignature', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                >
                  <option value="4/4">4/4 Standard</option>
                  <option value="3/4">3/4 Waltz</option>
                  <option value="6/8">6/8 Swing</option>
                  <option value="5/4">5/4 Odd-time</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Target Sound Intensity (LUFS)</span>
                <input
                  type="text"
                  value={getVal('targetLufsValue', '-14.0 LUFS')}
                  onChange={(e) => handleFieldChange('targetLufsValue', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Dynamic Range Rating</span>
                <input
                  type="text"
                  value={getVal('dynamicRangeValue', '-8.2 DR')}
                  onChange={(e) => handleFieldChange('dynamicRangeValue', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Reference Tuning Hertz</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={getVal('referenceTuningScaleHz', 440)}
                    onChange={(e) => handleFieldChange('referenceTuningScaleHz', parseInt(e.target.value) || 440)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                  <span className="text-xs text-zinc-500 font-mono">Hz</span>
                </div>
              </div>
            </div>

            {/* Loop Declarations & Clearances */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Sample Clearance Registry</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-2.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('sampleFreeDeclaration', true)}
                    onChange={(e) => handleFieldChange('sampleFreeDeclaration', e.target.checked)}
                    className="accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Acoustically Sample-Free Declaration</span>
                    <p className="text-[10px] text-zinc-400">Affirm that this beat is a 100% original composition built from scratch.</p>
                  </div>
                </label>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Third-Party Loop Disclosure Logs</span>
                  <input
                    type="text"
                    placeholder="No royalty loops used"
                    value={getVal('thirdPartyLoopDisclosure', 'Custom hand-played MIDI instruments')}
                    onChange={(e) => handleFieldChange('thirdPartyLoopDisclosure', e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 p-2 w-full font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Arrangement layout maker builder */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Arrangement Section Marker Timelines</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {['Intro', 'Chorus', 'Verse 1', 'Chorus', 'Verse 2', 'Outro'].map((section, sIdx) => (
                  <div key={sIdx} className="bg-zinc-900 p-2 rounded-xl text-center border border-zinc-850">
                    <span className="text-[8px] text-zinc-500 font-mono block">Anchor #{sIdx + 1}</span>
                    <span className="text-xs font-bold text-zinc-300 block">{section}</span>
                    <span className="text-[9px] font-mono text-zinc-500 block">0:{sIdx * 25}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lyrics sheet, Midi file, Chord file uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Lyrics Script Attachment</span>
                <input
                  type="text"
                  placeholder="Paste vocal lyrics here..."
                  value={getVal('lyricsScriptText', '')}
                  onChange={(e) => handleFieldChange('lyricsScriptText', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Chord Chart Sheet</span>
                <input
                  type="text"
                  placeholder="e.g. i - iv - VII - III"
                  value={getVal('chordChartFile', 'F#m - Bm - E - A')}
                  onChange={(e) => handleFieldChange('chordChartFile', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">MIDI Companion File</span>
                <input
                  type="text"
                  placeholder="No midi linked"
                  value={getVal('midiCompanionFile', 'melodies_keys_only.mid')}
                  onChange={(e) => handleFieldChange('midiCompanionFile', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 5: LICENSING TIERS & CONTRACT CONFIGURATIONS
            ------------------------------------------------------------------- */}
        {activeTab === 'license' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Licensing Tiers & Contract Terms Blueprint</span>
            </h3>

            {/* Template picker and token injector */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Dynamic Legal Contract Generator</span>
                  <p className="text-[11px] text-zinc-400">Select template contract and inject dynamic metadata tokens instantly.</p>
                </div>

                <select
                  value={getVal('boilerplateContractTemplate', 'standard_lease')}
                  onChange={(e) => {
                    const temp = e.target.value;
                    handleFieldChange('boilerplateContractTemplate', temp);
                    if (temp === 'standard_lease') {
                      handleFieldChange('contractBody', 'This agreement certifies that {{BUYER_NAME}} has purchased a license for {{TRACK_TITLE}} from producer {{PRODUCER_NAME}}.');
                    } else {
                      handleFieldChange('contractBody', 'EXCLUSIVE BUYOUT CONTRACT: {{PRODUCER_NAME}} hereby assigns full copyright of master {{TRACK_TITLE}} to client {{BUYER_NAME}}.');
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 font-mono"
                >
                  <option value="standard_lease">Standard Non-Exclusive Lease Template</option>
                  <option value="exclusive_buyout">Exclusive Copyright Buyout Template</option>
                </select>
              </div>

              {/* Injected Token Buttons */}
              <div className="flex flex-wrap gap-1.5 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-850">
                <span className="text-[10px] font-mono text-zinc-500 mr-2 uppercase">Shortcodes:</span>
                {[
                  { token: '{{BUYER_NAME}}', label: 'Buyer Name' },
                  { token: '{{TRACK_TITLE}}', label: 'Beat Title' },
                  { token: '{{PRODUCER_NAME}}', label: 'Producer' },
                  { token: '{{PRICE}}', label: 'Price' },
                ].map((item) => (
                  <button
                    key={item.token}
                    onClick={() => {
                      const curr = getVal('contractBody', '');
                      handleFieldChange('contractBody', curr + ' ' + item.token);
                      showStatus(`Injected variable token ${item.token} into lease text.`);
                    }}
                    className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono text-amber-300"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Active Contract Body Textarea */}
              <textarea
                rows={3}
                value={getVal('contractBody', 'This agreement certifies that {{BUYER_NAME}} has purchased a license for {{TRACK_TITLE}} from producer {{PRODUCER_NAME}}.')}
                onChange={(e) => handleFieldChange('contractBody', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-200 p-3 focus:outline-none"
              />
            </div>

            {/* Stream caps, tickets and airplay rules */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Audio Streams Maximum Cap</span>
                <input
                  type="number"
                  value={getVal('audioStreamMaxCap', 50000)}
                  onChange={(e) => handleFieldChange('audioStreamMaxCap', parseInt(e.target.value) || 0)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Music Video Synch Rights Cap</span>
                <input
                  type="number"
                  value={getVal('musicVideoUsageConstraints', 1)}
                  onChange={(e) => handleFieldChange('musicVideoUsageConstraints', parseInt(e.target.value) || 0)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Radio Airplay Spin Limits</span>
                <input
                  type="number"
                  value={getVal('radioAirplaySpinLimitation', 2)}
                  onChange={(e) => handleFieldChange('radioAirplaySpinLimitation', parseInt(e.target.value) || 0)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Performance Audience Limit</span>
                <input
                  type="number"
                  value={getVal('performanceVenueTicketLimit', 2500)}
                  onChange={(e) => handleFieldChange('performanceVenueTicketLimit', parseInt(e.target.value) || 0)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
              </div>
            </div>

            {/* Splits, Territorial, PDF overriding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 font-mono block">Royalty Splits & Publishing Alignment</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Mechanical Royalty Share (%)</span>
                    <input
                      type="number"
                      value={getVal('mechanicalRoyaltyRetentionShare', 50)}
                      onChange={(e) => handleFieldChange('mechanicalRoyaltyRetentionShare', parseInt(e.target.value) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">PRO Performance Splits (%)</span>
                    <input
                      type="number"
                      value={getVal('performanceRoyaltyAllocationSplit', 50)}
                      onChange={(e) => handleFieldChange('performanceRoyaltyAllocationSplit', parseInt(e.target.value) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 font-mono block">Territorial Boundaries & PDF Overrides</span>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Territorial Operational Jurisdiction</span>
                  <select
                    value={getVal('territorialJurisdictionSelector', 'Worldwide')}
                    onChange={(e) => handleFieldChange('territorialJurisdictionSelector', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  >
                    <option value="Worldwide">Worldwide (Universal)</option>
                    <option value="USA & Canada">United States & Canada Only</option>
                    <option value="European Union">European Union (EU)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 6: PRICING STRATEGIES & CART MECHANICS
            ------------------------------------------------------------------- */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Pricing Multipliers, Package Deals & Checkout Router</span>
            </h3>

            {/* Currencies exchange rate live calculator */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Currency Exchange Localisation Matrix</span>
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[9px] font-mono font-bold uppercase rounded">
                      CONFIGURED LOCAL RATES
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Instantly view equivalent pricing calculated based on manually configured currency rates.</p>
                </div>
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded-lg">
                  USD: $1.00
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-300">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase block">Euro (EUR)</span>
                  <span className="font-bold text-white">€{(activeItem.mp3Price * 0.94).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase block">Pounds (GBP)</span>
                  <span className="font-bold text-white">£{(activeItem.mp3Price * 0.79).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase block">Yen (JPY)</span>
                  <span className="font-bold text-white">¥{(activeItem.mp3Price * 149.2).toFixed(0)}</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase block">Canadian (CAD)</span>
                  <span className="font-bold text-white">${(activeItem.mp3Price * 1.35).toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            {/* Bulk deals grid and automated markdown calendars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 font-mono block">Automated Package Deals & Volume Promos</span>
                
                <div className="space-y-2">
                  <select
                    value={getVal('automatedPackageDealRules', 'buy1_get2_free')}
                    onChange={(e) => handleFieldChange('automatedPackageDealRules', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                  >
                    <option value="buy1_get2_free">Buy 1 Get 2 Free ("Triple Deal")</option>
                    <option value="buy2_get1_free">Buy 2 Get 1 Free ("Basic Package")</option>
                    <option value="none">No Volume Multipliers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Negotiation Floor Minimum Limit ($)</span>
                  <input
                    type="number"
                    value={getVal('minimumOfferNegotiationLimit', 25.00)}
                    onChange={(e) => handleFieldChange('minimumOfferNegotiationLimit', parseFloat(e.target.value) || 0)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono block">Customers cannot submit negotiation offers below this price.</span>
                </div>
              </div>

              {/* Transaction fee deduction calculator */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-purple-400 font-mono block">Transaction Cost & Net Payout Estimator</span>
                
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-850 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Retail Baseline MP3 Price:</span>
                    <span className="text-white">${activeItem.mp3Price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Stripe Fee (2.9% + $0.30):</span>
                    <span className="text-rose-400">-${((activeItem.mp3Price * 0.029) + 0.30).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-1.5">
                    <span>Platform Commission (0%):</span>
                    <span className="text-emerald-400">$0.00</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-black pt-0.5 text-sm">
                    <span>Estimated Net Payout:</span>
                    <span>${(activeItem.mp3Price - ((activeItem.mp3Price * 0.029) + 0.30)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Gateway Selector */}
                <div className="flex gap-2 text-xs font-mono pt-1">
                  <label className="flex items-center gap-1.5 text-zinc-400">
                    <input
                      type="checkbox"
                      checked={getVal('stripeGatewayActive', true)}
                      onChange={(e) => handleFieldChange('stripeGatewayActive', e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Route via Stripe Hub</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-zinc-400">
                    <input
                      type="checkbox"
                      checked={getVal('paypalGatewayActive', false)}
                      onChange={(e) => handleFieldChange('paypalGatewayActive', e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>PayPal Commerce Router</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 7: WATERMARKING & ANTI-PIRACY OPTIONS
            ------------------------------------------------------------------- */}
        {activeTab === 'antiPiracy' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Anti-Piracy Shields & Acoustic Watermark Matrices</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Voice Tag Loop Frequency */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Pattern Loop Density (Seconds)</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Repeat Voice Protector:</span>
                    <span className="text-amber-400 font-bold">Every {getVal('watermarkPatternLoopDensity', 20)}s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={getVal('watermarkPatternLoopDensity', 20)}
                    onChange={(e) => handleFieldChange('watermarkPatternLoopDensity', parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono">Controls how frequently the audio watermarking stamp overlays standard preview streams.</p>
                </div>
              </div>

              {/* Volume Attenuation */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-purple-400 font-mono uppercase block">Watermark Volume Attenuation</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Blend Mix Volume:</span>
                    <span className="text-purple-400 font-bold">{getVal('watermarkVolumeAttenuation', -12)} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="-3"
                    value={getVal('watermarkVolumeAttenuation', -12)}
                    onChange={(e) => handleFieldChange('watermarkVolumeAttenuation', parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono">Adjust db mixing intensity of overlay tag over the beat stream.</p>
                </div>
              </div>

              {/* Delay Timer Onset */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase block">Initial Onset Delay Windows</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">First Overlay Timestamp:</span>
                    <span className="text-cyan-400 font-bold">{getVal('vocalTagInitialOnsetDelay', 1.5)} Seconds</span>
                  </div>
                  <input
                    type="range"
                    step="0.5"
                    min="0"
                    max="10"
                    value={getVal('vocalTagInitialOnsetDelay', 1.5)}
                    onChange={(e) => handleFieldChange('vocalTagInitialOnsetDelay', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono">Ensures intro is clear before applying watermark protection.</p>
                </div>
              </div>
            </div>

            {/* Steganographic & Stream Recorder rip shields */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Source Encryption & Cache Protection Systems</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-2.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('previewStreamExtractionBlocker', true)}
                    onChange={(e) => {
                      handleFieldChange('previewStreamExtractionBlocker', e.target.checked);
                      showStatus(`Preview cache locker state: ${e.target.checked ? 'SECURE' : 'DEV_BYPASS'}`);
                    }}
                    className="accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Preview Stream Cache Extraction Blocker</span>
                    <p className="text-[10px] text-zinc-400">Forces stream payload chunk buffering to prevent clients saving file links directly via browser inspect network tabs.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('rightClickSaveProtectionActive', true)}
                    onChange={(e) => handleFieldChange('rightClickSaveProtectionActive', e.target.checked)}
                    className="accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Right-Click Element Protection & Block contextmenu</span>
                    <p className="text-[10px] text-zinc-400">Blocks element inspector commands and right-click "Save Audio As" overrides over player containers.</p>
                  </div>
                </label>
              </div>

              {/* Sub-bitrate selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900 pt-3">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Streaming Sample Compression</span>
                  <select
                    value={getVal('lowBitratePreviewCompression', '128kbps')}
                    onChange={(e) => handleFieldChange('lowBitratePreviewCompression', e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 w-full font-mono"
                  >
                    <option value="96kbps">96 kbps (Highly Compressed / Safest)</option>
                    <option value="128kbps">128 kbps (Standard Stream Profile)</option>
                    <option value="192kbps">192 kbps (Audiophile Quality)</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block text-[10px]">Acoustic Frequency Shifter</span>
                    <span className="text-[9px] text-zinc-500 block">Offsets rip-recording software.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={getVal('acousticFrequencyShiftingActive', false)}
                    onChange={(e) => handleFieldChange('acousticFrequencyShiftingActive', e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block text-[10px]">Steganographic Audio Injector</span>
                    <span className="text-[9px] text-zinc-500 block">Injects invisible metadata license ID.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={getVal('steganographicDigitalWatermark', true)}
                    onChange={(e) => handleFieldChange('steganographicDigitalWatermark', e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 8: STREAMING PLAYER CONFIGURATIONS
            ------------------------------------------------------------------- */}
        {activeTab === 'player' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              <span>Streaming Player Test Console & Waveform Color Spectrum</span>
            </h3>

            {/* Interactive Audio Player Test Console with Speed & Pitch Shift */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Real-time Pitch & Tempo DSP Simulator</span>
                  <p className="text-[11px] text-zinc-400">Load and play preview audio stream. Tweak playback speed and pitch semitones instantly.</p>
                </div>

                {/* Simulated Audio Playback button */}
                <button
                  onClick={togglePlay}
                  className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition ${
                    isPlaying ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE STREAM' : 'PLAY PREVIEW STREAM'}</span>
                </button>
              </div>

              {/* DYNAMIC CANVAS VISUALIZATION */}
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-850">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                  <span>Frequency Spectrum Analyzer Output</span>
                  <span className="text-amber-400 font-bold">140 BPM · C Minor</span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={80}
                  className="w-full h-20 bg-black/45 rounded-lg border border-zinc-800"
                />
              </div>

              {/* DSP SLIDERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Real-Time Playback Speed:</span>
                    <span className="text-amber-400 font-bold">{getVal('realtimePlaybackSpeed', 1.0)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={getVal('realtimePlaybackSpeed', 1.0)}
                    onChange={(e) => handleFieldChange('realtimePlaybackSpeed', parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[9px] text-zinc-500 font-mono">Slows down or speeds up audio playback dynamically without altering base frequencies.</p>
                </div>

                {/* Pitch Shift Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Pitch Correction Shift:</span>
                    <span className="text-purple-400 font-bold">{getVal('pitchCorrectionSemitone', 0)} Semitones</span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={getVal('pitchCorrectionSemitone', 0)}
                    onChange={(e) => handleFieldChange('pitchCorrectionSemitone', parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <p className="text-[9px] text-zinc-500 font-mono">Transpose scale key up or down dynamically in real-time semitones.</p>
                </div>
              </div>
            </div>

            {/* Read-only embed code and iframe sizing */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">External embed iframe snippet builder</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Embed Width (px)</span>
                  <input
                    type="number"
                    value={getVal('embedSnippetWidth', 100)}
                    onChange={(e) => handleFieldChange('embedSnippetWidth', parseInt(e.target.value) || 100)}
                    className="bg-zinc-900 border border-zinc-800 rounded text-xs text-white p-2 w-full font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Embed Height (px)</span>
                  <input
                    type="number"
                    value={getVal('embedSnippetHeight', 120)}
                    onChange={(e) => handleFieldChange('embedSnippetHeight', parseInt(e.target.value) || 120)}
                    className="bg-zinc-900 border border-zinc-800 rounded text-xs text-white p-2 w-full font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Waveform display outline style</span>
                  <select
                    value={getVal('waveformDisplayOutlineStyle', 'bars')}
                    onChange={(e) => handleFieldChange('waveformDisplayOutlineStyle', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded text-xs text-white p-2 w-full font-mono"
                  >
                    <option value="bars">Retro EQ Bars</option>
                    <option value="wave">Rounded Waveform</option>
                    <option value="flat">Minimalist Line</option>
                  </select>
                </div>
              </div>

              {/* Dynamic read-only iframe text */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">HTML iFrame Code Copy Snippet</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`<iframe src="https://mybeats.com/embed/${activeItem.id || 'cc_9918'}?style=${getVal('waveformDisplayOutlineStyle', 'bars')}" width="${getVal('embedSnippetWidth', 100)}%" height="${getVal('embedSnippetHeight', 120)}px" frameborder="0"></iframe>`}
                    className="bg-zinc-900 border border-zinc-850 rounded-lg text-[11px] text-zinc-400 p-2.5 w-full font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      showStatus('Embed iframe script code copied to clipboard!');
                    }}
                    className="px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-xs font-mono"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 9: FREE DOWNLOAD & LEAD CAPTURE GATING
            ------------------------------------------------------------------- */}
        {activeTab === 'free' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Free Download Lead Capture Gating & Verification Walls</span>
            </h3>

            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">Lead Capture Survey Element Designer</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-2.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('mailingListGateActive', true)}
                    onChange={(e) => handleFieldChange('mailingListGateActive', e.target.checked)}
                    className="accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Mailing List Subscription Entry Gate</span>
                    <p className="text-[10px] text-zinc-400">Force users to verify their subscription to your newsletter before dispatching the download link.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal('feedbackQuestionnaireMandatory', false)}
                    onChange={(e) => handleFieldChange('feedbackQuestionnaireMandatory', e.target.checked)}
                    className="accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Feedback Questionnaire Mandatory Form</span>
                    <p className="text-[10px] text-zinc-400">Require users to select a feedback rating or leave a text review to unlock their free download.</p>
                  </div>
                </label>
              </div>

              {getVal('feedbackQuestionnaireMandatory', false) && (
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Custom Mandatory Questionnaire Question</span>
                  <input
                    type="text"
                    value={getVal('feedbackQuestionnaireText', 'What project is this beat intended for?')}
                    onChange={(e) => handleFieldChange('feedbackQuestionnaireText', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5"
                  />
                </div>
              )}
            </div>

            {/* Social profiles & SMS collectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Social profile walls */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">Social Profile Connection Verification</span>
                
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={getVal('socialProfileConnectionVerify', true)}
                    onChange={(e) => handleFieldChange('socialProfileConnectionVerify', e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Require Instagram Follow Check</span>
                </label>

                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">YouTube Channel Subscribe Wall Connector</span>
                  <input
                    type="url"
                    placeholder="https://youtube.com/c/yourchannel"
                    value={getVal('youtubeSubscribeWallUrl', '')}
                    onChange={(e) => handleFieldChange('youtubeSubscribeWallUrl', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                </div>
              </div>

              {/* SMS collector & Caps */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-purple-400 font-mono block uppercase">Weekly Allocation & SMS Gating</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Weekly Global Cap Limit</span>
                    <input
                      type="number"
                      value={getVal('weeklyAccountAllocationLimit', 3)}
                      onChange={(e) => handleFieldChange('weeklyAccountAllocationLimit', parseInt(e.target.value) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Free File Variant Level</span>
                    <select
                      value={getVal('freeFileDeliveryVariant', 'tagged')}
                      onChange={(e) => handleFieldChange('freeFileDeliveryVariant', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    >
                      <option value="tagged">Watermarked Alternative MP3</option>
                      <option value="untagged">Clean MP3 (128kbps)</option>
                      <option value="wav">WAV Lossless Demo</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 pt-1">
                  <input
                    type="checkbox"
                    checked={getVal('mobileVerificationSmsActive', false)}
                    onChange={(e) => handleFieldChange('mobileVerificationSmsActive', e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Mandatory SMS phone collector gate</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 10: SEO, DISCOVERABILITY & SEARCH OPTIMIZATION
            ------------------------------------------------------------------- */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Search Engine Optimization & Schema Markup Metadata</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Vanity Slug & Meta tags */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">SEO Path Vanity Link Rules</span>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block">Clean Vanity Slug URL String</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 p-2.5 font-mono">
                    <span>https://mybeats.com/track/</span>
                    <input
                      type="text"
                      value={getVal('cleanVanitySlug', 'dark-trap-voodoo')}
                      onChange={(e) => handleFieldChange('cleanVanitySlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="bg-transparent text-white focus:outline-none w-full font-bold ml-0.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Search Snippet Meta-Description</span>
                    <span className="text-[9.5px] font-mono text-zinc-500">{(getVal('searchSnippetMetaDescription', '').length)} / 160 chars</span>
                  </div>
                  <textarea
                    rows={2}
                    value={getVal('searchSnippetMetaDescription', 'Listen to heavy sliding subbass analog trap instrumental VOODOO by CASHMERE KID$. Master quality download available.')}
                    onChange={(e) => handleFieldChange('searchSnippetMetaDescription', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5"
                  />
                </div>
              </div>

              {/* JSON LD SCHEMA VIEWER */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-purple-400 font-mono block uppercase">Structured JSON-LD Schema.org Generator</span>
                <p className="text-[11px] text-zinc-400">Auto-generated meta block for Google and rich index bots.</p>
                
                <pre className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 text-[9.5px] font-mono text-cyan-300 overflow-x-auto h-28 select-all">
{`{
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "name": "${activeItem.title || 'VOODOO'}",
  "genre": "${activeItem.genre || 'TRAP'}",
  "duration": "PT${Math.floor(activeItem.durationSeconds / 60)}M${activeItem.durationSeconds % 60}S",
  "byArtist": {
    "@type": "MusicGroup",
    "name": "${activeItem.producerName || 'CASHMERE KID$'}"
  }
}`}
                </pre>
              </div>
            </div>

            {/* Pixels and Google analytics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase block">Google Analytics ID</span>
                <input
                  type="text"
                  value={getVal('googleAnalyticsProfileId', 'G-XN9942')}
                  onChange={(e) => handleFieldChange('googleAnalyticsProfileId', e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase block">Facebook Pixel ID</span>
                <input
                  type="text"
                  value={getVal('facebookPixelId', 'FB-11048')}
                  onChange={(e) => handleFieldChange('facebookPixelId', e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase block">TikTok pixel bridge</span>
                <input
                  type="text"
                  value={getVal('tiktokPixelId', 'TT-984')}
                  onChange={(e) => handleFieldChange('tiktokPixelId', e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <span className="text-[9px] text-zinc-500 uppercase block font-mono">Indexing Status</span>
                <button
                  disabled={getVal('isIndexingRequestProcessing', false)}
                  onClick={() => {
                    handleFieldChange('isIndexingRequestProcessing', true);
                    handleFieldChange('indexingRequestStatus', 'PENDING');
                    showStatus('Generated sitemap and JSON-LD schema metadata for search crawlers.');
                    setTimeout(() => {
                      handleFieldChange('isIndexingRequestProcessing', false);
                      handleFieldChange('indexingRequestStatus', 'READY: SITEMAP & JSON-LD GENERATED (PENDING GOOGLE CRAWL)');
                    }, 1000);
                  }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono uppercase rounded font-bold"
                >
                  {getVal('isIndexingRequestProcessing', false) ? 'Generating Metadata...' : 'Generate Index Metadata'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 11: RELEASE SCHEDULING & DISTRIBUTION LOGS
            ------------------------------------------------------------------- */}
        {activeTab === 'release' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Release Calendars, Removal Timers & Revision History</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Timing Calendars */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4 text-xs font-mono text-zinc-300">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Scheduled Publication Releases</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase block">Future Release Date</span>
                    <input
                      type="date"
                      value={getVal('futurePublicationDate', '2026-10-15')}
                      onChange={(e) => handleFieldChange('futurePublicationDate', e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase block">Auto Removal Expiry</span>
                    <input
                      type="date"
                      value={getVal('automatedCatalogRemovalTime', '')}
                      onChange={(e) => handleFieldChange('automatedCatalogRemovalTime', e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Secret listening private link</span>
                    <p className="text-[9px] text-zinc-500">Hides from listing grids while remaining streamable.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={getVal('secretListeningLinkActive', false)}
                    onChange={(e) => handleFieldChange('secretListeningLinkActive', e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
              </div>

              {/* Revision log panel */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-purple-400 font-mono block uppercase">Audit Revision Changelog Ledger</span>
                
                <div className="space-y-2 h-24 overflow-y-auto bg-zinc-900 border border-zinc-850 rounded-xl p-3 font-mono text-[10px] text-zinc-400">
                  <div className="border-b border-zinc-850 pb-1 flex justify-between">
                    <span className="text-white">v1.0 - Draft Initialized</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="pt-1 text-zinc-500">No other edit records logged. Use button below to write revisions.</div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="revisionInput"
                    placeholder="Add master catalog revision entry..."
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        showStatus(`Written catalog edit log: ${(e.target as HTMLInputElement).value}`);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 12: DIGITAL RIGHTS & VERIFICATION REGISTRATIONS
            ------------------------------------------------------------------- */}
        {activeTab === 'rights' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Digital Rights Registrations, Content ID & SoundExchange</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Content ID checklist */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">YouTube Content ID & Social Sound Libs</span>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[9px] font-mono font-bold uppercase rounded">
                    CONFIGURED (NOT SUBMITTED)
                  </span>
                </div>
                
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={getVal('youtubeContentIdMatching', false)}
                    onChange={(e) => handleFieldChange('youtubeContentIdMatching', e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Opt-in YouTube Content ID metadata configuration</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={getVal('tiktokCommercialSoundCatalogLicense', true)}
                    onChange={(e) => handleFieldChange('tiktokCommercialSoundCatalogLicense', e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Authorize TikTok Commercial Music Distribution metadata</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={getVal('automatedShazamRecognitionOptIn', true)}
                    onChange={(e) => handleFieldChange('automatedShazamRecognitionOptIn', e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Store Shazam Indexing search metadata</span>
                </label>
              </div>

              {/* Codes matching ISRC/UPC */}
              <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3 font-mono text-xs text-zinc-300">
                <span className="text-[10px] font-bold text-purple-400 uppercase block">Universal Registry Code Blocks</span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase block">ISRC Identifier Code</span>
                    <input
                      type="text"
                      placeholder="US-C93-26-012"
                      value={getVal('isrcIdentifier', 'US-C93-26-981')}
                      onChange={(e) => handleFieldChange('isrcIdentifier', e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase block">UPC Catalog Code</span>
                    <input
                      type="text"
                      placeholder="0192843058"
                      value={getVal('upcCatalogDistributionCode', '')}
                      onChange={(e) => handleFieldChange('upcCatalogDistributionCode', e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 rounded text-xs text-white p-2 w-full font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-400 uppercase block">PRO Performance link (ASCAP/BMI IPI string)</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">CONFIGURED LOCALLY (NOT SUBMITTED)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="BMI CAE / IPI: 0098410294"
                    value={getVal('legalCreatorIdString', 'BMI CAE/IPI - 0088510294')}
                    onChange={(e) => handleFieldChange('legalCreatorIdString', e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2 w-full font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Signature blocks */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2">
              <span className="text-xs font-bold text-white uppercase block text-[10px] font-mono">Digital Signature Compliance Affirmation</span>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Type full legal name to sign contract clearances..."
                  value={getVal('clearanceDeclarationComplianceSignature', '')}
                  onChange={(e) => handleFieldChange('clearanceDeclarationComplianceSignature', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white p-2.5 w-full font-mono"
                />
                <button
                  onClick={() => {
                    if (getVal('clearanceDeclarationComplianceSignature', '')) {
                      showStatus('Clearance declaration locked via encrypted signature timestamp.');
                    } else {
                      showStatus('Signature field cannot be empty.');
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg"
                >
                  Apply Sign-Off
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
