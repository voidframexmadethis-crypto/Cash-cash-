import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Music,
  User,
  Type,
  Sliders,
  Play,
  Pause,
  Download,
  Save,
  Copy,
  Trash2,
  Edit2,
  FolderOpen,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Tv,
  Plus,
  Volume2,
  FileText
} from 'lucide-react';
import { Beat, BeatPack } from '../types';

interface UgcProject {
  id: string;
  name: string;
  selectedProductId: string;
  selectedProductType: 'single' | 'pack';
  script: string;
  presenterId: string;
  voiceId: string;
  musicVolume: number;
  voiceVolume: number;
  fadeIn: boolean;
  fadeOut: boolean;
  musicStart: number;
  musicEnd: number;
  captionsEnabled: boolean;
  captionPosition: 'top' | 'middle' | 'bottom';
  captionSize: 'small' | 'medium' | 'large';
  captionStyle: 'outline' | 'background' | 'minimal';
  ctaText: string;
  createdAt: string;
  renderStatus: 'READY' | 'PREPARING' | 'GENERATING VOICE' | 'GENERATING AVATAR' | 'COMPOSITING' | 'RENDERING' | 'READY_TO_DOWNLOAD' | 'ERROR';
}

interface UgcCreatorProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  currencySymbol: string;
}

export const UgcCreator: React.FC<UgcCreatorProps> = ({ beats, beatPacks, currencySymbol }) => {
  // Wizard Navigation Step
  const [activeStep, setActiveStep] = useState<number>(1);

  // Preloaded licensed presenter assets
  const preloadedPresenters = [
    {
      id: 'pres-1',
      name: 'Michael (Studio Host - Male)',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-explaining-something-41985-large.mp4',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Professional tech-studio male presenter speaking naturally in neutral posture.'
    },
    {
      id: 'pres-2',
      name: 'Sophia (Artist Host - Female)',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-to-camera-in-interview-43187-large.mp4',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Charismatic creative female host speaking dynamically to vertical social camera.'
    }
  ];

  // Preloaded Voice options
  const voiceProfiles = [
    { id: 'voice-m1', name: 'Adam (Deep Baritone - English US)', gender: 'Male' },
    { id: 'voice-f1', name: 'Bella (Smooth Conversational - English UK)', gender: 'Female' },
    { id: 'voice-m2', name: 'Marcus (High Energy Hype - English US)', gender: 'Male' }
  ];

  // Projects State
  const [projects, setProjects] = useState<UgcProject[]>(() => {
    const saved = localStorage.getItem('voodoo_ugc_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('NEW AD CAMPAIGN');

  // Unified UGC Configuration States
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<'single' | 'pack'>('single');
  const [script, setScript] = useState<string>('Yo, if you’re looking for something dark for your next record, check out this new CASHMERE KID$ beat. This one is crazy.');
  const [presenterId, setPresenterId] = useState<string>('pres-1');
  const [voiceId, setVoiceId] = useState<string>('voice-m1');
  const [musicVolume, setMusicVolume] = useState<number>(0.3);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8);
  const [fadeIn, setFadeIn] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(true);
  const [musicStart, setMusicStart] = useState<number>(0);
  const [musicEnd, setMusicEnd] = useState<number>(15);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);
  const [captionPosition, setCaptionPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [captionSize, setCaptionSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [captionStyle, setCaptionStyle] = useState<'outline' | 'background' | 'minimal'>('background');
  const [ctaText, setCtaText] = useState<string>('GET THE BEAT');
  const [renderStatus, setRenderStatus] = useState<UgcProject['renderStatus']>('READY');

  // Custom Preview Audio element to isolate preview playback from catalog player
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewIsPlaying, setPreviewIsPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  // Load list of real products
  const eligibleBeats = beats.filter(b => b.published !== false && (b.audioUrl || b.iaUrl));
  const eligiblePacks = beatPacks.filter(p => p.published !== false);

  // Set default product on load
  useEffect(() => {
    if (eligibleBeats.length > 0 && !selectedProductId) {
      setSelectedProductId(eligibleBeats[0].id);
    }
  }, [beats]);

  // Sync projects to localStorage
  useEffect(() => {
    localStorage.setItem('voodoo_ugc_projects', JSON.stringify(projects));
  }, [projects]);

  // Handle music timing and volume controls in preview
  useEffect(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  const getSelectedProduct = () => {
    if (selectedProductType === 'single') {
      return beats.find(b => b.id === selectedProductId);
    } else {
      return beatPacks.find(p => p.id === selectedProductId);
    }
  };

  const selectedProduct = getSelectedProduct();

  // Calculate script stats
  const charCount = script.length;
  const estimatedSeconds = Math.max(1, Math.ceil(script.split(/\s+/).filter(Boolean).length * 0.4)); // ~150 words per minute average

  // Play script preview (Text-To-Speech web api)
  const handlePreviewScriptSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Local browser Text-To-Speech is unsupported on this device.');
    }
  };

  // --- AUDIO PREVIEW SYSTEM ISOLATION ---
  const handleTogglePreviewAudio = () => {
    if (!selectedProduct) return;

    if (!previewAudioRef.current) {
      const audioUrl = (selectedProduct as any).iaUrl || (selectedProduct as any).audioUrl || '';
      if (!audioUrl) return;

      const resolvedUrl = audioUrl.includes('?') 
        ? `${audioUrl}&token=CK-PREVIEW` 
        : `${audioUrl}?token=CK-PREVIEW`;

      const audio = new Audio(resolvedUrl);
      audio.currentTime = musicStart;
      audio.volume = musicVolume;
      previewAudioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setPreviewProgress(audio.currentTime);
        if (audio.currentTime >= musicEnd) {
          audio.pause();
          setPreviewIsPlaying(false);
          audio.currentTime = musicStart;
        }
      });

      audio.addEventListener('ended', () => {
        setPreviewIsPlaying(false);
        audio.currentTime = musicStart;
      });
    }

    if (previewIsPlaying) {
      previewAudioRef.current.pause();
      setPreviewIsPlaying(false);
    } else {
      previewAudioRef.current.play()
        .then(() => setPreviewIsPlaying(true))
        .catch(() => alert('Authorized media preview blocked by token validation.'));
    }
  };

  const stopPreviewAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewIsPlaying(false);
    setPreviewProgress(0);
  };

  // Cleanup player on step navigation or unmount
  useEffect(() => {
    return () => {
      stopPreviewAudio();
    };
  }, [activeStep, selectedProductId]);

  // Generate AI Script Idea concept (local generator)
  const handleGenerateScriptIdea = () => {
    if (!selectedProduct) return;
    const bpmStr = (selectedProduct as any).bpm ? `ticking at ${(selectedProduct as any).bpm} BPM` : 'premium energy';
    const keyStr = (selectedProduct as any).key ? `pitched in ${(selectedProduct as any).key}` : 'platinum scale';
    const title = (selectedProduct as any).title || (selectedProduct as any).name;

    const ideas = [
      `“Yo artists, if you need a heavy dark record for your next studio release, check out '${title}' on CASHMERE KID$. This instrumental is ${keyStr} and it's absolutely sliding. Check it out.”`,
      `“Attention rappers. The vault just unlocked a luxury trap master track: '${title}' ${bpmStr}. Incredible Sliding 808s and high-end brass layers. Go grab the licence on my store now.”`,
      `“CASHMERE KID$ just released a brand new certified trap banger titled '${title}' ${bpmStr}. Perfect uncompressed mix, voice tag optional. Tap below to audition the stems.”`
    ];

    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setScript(randomIdea);
  };

  // --- PROJECT MANAGEMENT ---
  const handleSaveProject = () => {
    const updatedProject: UgcProject = {
      id: activeProjectId || `proj-${Date.now()}`,
      name: projectName.trim().toUpperCase(),
      selectedProductId,
      selectedProductType,
      script,
      presenterId,
      voiceId,
      musicVolume,
      voiceVolume,
      fadeIn,
      fadeOut,
      musicStart,
      musicEnd,
      captionsEnabled,
      captionPosition,
      captionSize,
      captionStyle,
      ctaText,
      createdAt: new Date().toISOString().substring(0, 10),
      renderStatus
    };

    const existingIndex = projects.findIndex(p => p.id === updatedProject.id);
    let updatedList;
    if (existingIndex > -1) {
      updatedList = [...projects];
      updatedList[existingIndex] = updatedProject;
    } else {
      updatedList = [updatedProject, ...projects];
    }

    setProjects(updatedList);
    setActiveProjectId(updatedProject.id);
    alert('UGC Project Draft Saved Successfully!');
  };

  const handleLoadProject = (proj: UgcProject) => {
    setActiveProjectId(proj.id);
    setProjectName(proj.name);
    setSelectedProductId(proj.selectedProductId);
    setSelectedProductType(proj.selectedProductType);
    setScript(proj.script);
    setPresenterId(proj.presenterId);
    setVoiceId(proj.voiceId);
    setMusicVolume(proj.musicVolume);
    setVoiceVolume(proj.voiceVolume);
    setFadeIn(proj.fadeIn);
    setFadeOut(proj.fadeOut);
    setMusicStart(proj.musicStart);
    setMusicEnd(proj.musicEnd);
    setCaptionsEnabled(proj.captionsEnabled);
    setCaptionPosition(proj.captionPosition);
    setCaptionSize(proj.captionSize);
    setCaptionStyle(proj.captionStyle);
    setCtaText(proj.ctaText);
    setRenderStatus(proj.renderStatus);
    setActiveStep(3); // jump directly to script workspace
  };

  const handleDuplicateProject = (proj: UgcProject) => {
    const duplicated: UgcProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      name: `${proj.name} (COPY)`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setProjects([duplicated, ...projects]);
    alert('Project Duplicated.');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
    }
  };

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      
      {/* Title block */}
      <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">PRIVATE PRODUCER ADVERTISING SUITE</span>
          <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight mt-1">UGC SOCIAL AD CREATOR</h2>
          <p className="text-xs text-zinc-500">Generate high-converting vertical social ads with animated presenters, captions, and real beat background tracks.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveProject}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" />
            <span>Save Project</span>
          </button>
        </div>
      </div>

      {/* Project Draft Manager Quick Row */}
      {projects.length > 0 && (
        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-wrap items-center gap-3">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mr-2">
            <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>UGC PROJECT DRAUGHTS:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {projects.map(p => (
              <div
                key={p.id}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  activeProjectId === p.id 
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' 
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <button onClick={() => handleLoadProject(p)} className="truncate max-w-[120px] font-brand uppercase tracking-wide cursor-pointer">{p.name}</button>
                <button onClick={() => handleDuplicateProject(p)} className="p-0.5 text-zinc-500 hover:text-white" title="Duplicate"><Copy className="w-3 h-3" /></button>
                <button onClick={() => handleDeleteProject(p.id)} className="p-0.5 text-red-500/60 hover:text-red-400" title="Delete"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Split Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace Left Area: Step Navigation Wizard Controls (Cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Indicator Map */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900">
            {[
              { step: 1, label: 'Product' },
              { step: 2, label: 'Presenter' },
              { step: 3, label: 'Script' },
              { step: 4, label: 'Voice' },
              { step: 5, label: 'Music' },
              { step: 6, label: 'Style' },
              { step: 7, label: 'Preview & Export' }
            ].map(item => (
              <button
                key={item.step}
                onClick={() => {
                  setActiveStep(item.step);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  activeStep === item.step
                    ? 'bg-purple-600 text-white shadow shadow-purple-950'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                {item.step}. {item.label}
              </button>
            ))}
          </div>

          {/* STEP 1: PRODUCT SELECTION */}
          {activeStep === 1 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 1 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">REAL CAMPAIGN PRODUCT SOURCE</h3>
                <p className="text-xs text-zinc-500">Select a real published Single Beat or Beat Pack to advertise. Stems and metadata are imported instantly.</p>
              </div>

              {/* Product Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedProductType('single');
                    if (eligibleBeats.length > 0) setSelectedProductId(eligibleBeats[0].id);
                  }}
                  className={`py-3 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer border text-center ${
                    selectedProductType === 'single'
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Single Beat
                </button>
                <button
                  onClick={() => {
                    setSelectedProductType('pack');
                    if (eligiblePacks.length > 0) setSelectedProductId(eligiblePacks[0].id);
                  }}
                  className={`py-3 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer border text-center ${
                    selectedProductType === 'pack'
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Beat Pack
                </button>
              </div>

              {/* Product Dropdown Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Select Vault Item *</label>
                {selectedProductType === 'single' ? (
                  eligibleBeats.length > 0 ? (
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-2xl text-xs text-white outline-none"
                    >
                      {eligibleBeats.map(b => (
                        <option key={b.id} value={b.id}>{b.title} (Prod. CASHMERE KID$ · {b.bpm} BPM · {b.key})</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-red-400">No published beats available in store catalog.</p>
                  )
                ) : (
                  eligiblePacks.length > 0 ? (
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-2xl text-xs text-white outline-none"
                    >
                      {eligiblePacks.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.beatIds?.length || 0} Tracks · {currencySymbol}{p.price})</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-red-400">No published Beat Packs available in store catalog.</p>
                  )
                )}
              </div>

              {/* Dynamic Imported Product Card Summary */}
              {selectedProduct && (
                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
                  <img src={selectedProduct.artworkUrl} className="w-14 h-14 object-cover rounded-xl border border-zinc-800 shadow" alt="Artwork" />
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">IMPORTED METADATA</span>
                    <h4 className="text-sm font-bold text-white uppercase">{(selectedProduct as any).title || (selectedProduct as any).name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                      {(selectedProduct as any).bpm ? `${(selectedProduct as any).bpm} BPM` : 'BEAT BUNDLE'} · {(selectedProduct as any).key || '24-BIT STEMS'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveStep(2)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Select UGC Presenter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PRESENTER ASSET SELECTION */}
          {activeStep === 2 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 2 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">TALKING AVATAR PRESENTER</h3>
                <p className="text-xs text-zinc-500">Choose from royalty-free virtual hosts or connect your replaceable AI talking lip-sync server model.</p>
              </div>

              {/* Presenter Assets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preloadedPresenters.map(pres => (
                  <button
                    key={pres.id}
                    onClick={() => setPresenterId(pres.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex gap-4 items-center ${
                      presenterId === pres.id
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <img src={pres.avatarUrl} alt={pres.name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">{pres.name}</div>
                      <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">{pres.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Replaceable Engine Architecture Notice */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Replaceable Generation Engine</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  CASHMERE KID$ runs on a provider-independent architecture. Developers can easily hot-swap open-source lip-sync models (like **MuseTalk**) behind the standard generation adapter with no platform lockout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveStep(1)}
                  className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SCRIPT EDITOR */}
          {activeStep === 3 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 3 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">AD VOCAL SCRIPT WRITER</h3>
                <p className="text-xs text-zinc-500">Draft exactly what your virtual host says. Keep scripts concise and fast-paced for short-form social formats.</p>
              </div>

              {/* Script Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  <span>Character count: {charCount}</span>
                  <span>Est. Duration: ~{estimatedSeconds}s</span>
                </div>
                <textarea
                  rows={4}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Yo, check out this new CASHMERE KID$ beat..."
                  className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-850 focus:border-purple-500/50 rounded-2xl text-xs text-white"
                />
              </div>

              {/* Script Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handlePreviewScriptSpeech}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Audition using local browser speech synthesizer"
                >
                  <Play className="w-3.5 h-3.5 text-purple-400 fill-current" />
                  <span>Speech Audition</span>
                </button>
                <button
                  onClick={handleGenerateScriptIdea}
                  className="px-3.5 py-2 bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Generate localized prompt concept"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Suggest Script Idea</span>
                </button>
                <button
                  onClick={() => setScript('')}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Clear Script
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveStep(2)}
                  className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VOICE ADAPTER */}
          {activeStep === 4 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 4 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">VOICE OVER PROFILE</h3>
                <p className="text-xs text-zinc-500">Connect secure SaaS TTS voice adapters or utilize on-premise deep speech models.</p>
              </div>

              {/* Voice profiles list */}
              <div className="grid grid-cols-1 gap-3">
                {voiceProfiles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceId(v.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                      voiceId === v.id
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{v.name}</div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{v.gender}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">TTS profile active</span>
                  </button>
                ))}
              </div>

              {/* Security guardrail credentials block */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs space-y-1.5 leading-normal">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>UGC GENERATION ENGINE NOT CONFIGURED</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  No active voice credentials or GPU worker was detected in the configuration. Voice and video rendering requires setting up an external worker node with deep speech capabilities.
                </p>
                <div className="text-[10px] font-mono text-purple-300 pt-1">
                  Required: Set up a local worker on your server or provide secure SaaS keys.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveStep(3)}
                  className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BACKGROUND MUSIC LEVEL CONTROLS */}
          {activeStep === 5 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 5 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">BACKGROUND AUDIO & ENVELOPE</h3>
                <p className="text-xs text-zinc-500">Fine-tune background music start positions, volumes, and fade envelopes to make vocals sit cleanly.</p>
              </div>

              {/* Music level sliders */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Music Volume: {(musicVolume * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Voice Volume: {(voiceVolume * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Start Trim: {musicStart}s</label>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={1}
                      value={musicStart}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMusicStart(val);
                        if (val >= musicEnd) setMusicEnd(val + 15);
                      }}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">End Trim / Duration: {musicEnd}s</label>
                    <input
                      type="range"
                      min={musicStart + 5}
                      max={200}
                      step={1}
                      value={musicEnd}
                      onChange={(e) => setMusicEnd(parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fadeIn}
                      onChange={(e) => setFadeIn(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span className="text-xs font-bold text-zinc-400">Audio Fade In</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fadeOut}
                      onChange={(e) => setFadeOut(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span className="text-xs font-bold text-zinc-400">Audio Fade Out</span>
                  </label>
                </div>
              </div>

              {/* Preview play button */}
              {selectedProduct && (
                <button
                  onClick={handleTogglePreviewAudio}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {previewIsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{previewIsPlaying ? 'Pause Instrumental Preview' : 'Audition Track Envelopes'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveStep(4)}
                  className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(6)}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: STYLE COMPOSITION AND CAPTIONS */}
          {activeStep === 6 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 6 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">STYLE COMPOSITION & CTA</h3>
                <p className="text-xs text-zinc-500">Configure visual layout branding, overlay caption typography styles, and editable call-to-action cards.</p>
              </div>

              {/* Editable CTA Card */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Editable CTA Button Label</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value.toUpperCase())}
                  placeholder="e.g. GET THE BEAT"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase"
                />
              </div>

              {/* Captions Styling and placement */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Captions Overlay</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={captionsEnabled}
                      onChange={(e) => setCaptionsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                {captionsEnabled && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1">Position</label>
                      <select
                        value={captionPosition}
                        onChange={(e: any) => setCaptionPosition(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                      >
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1">Size</label>
                      <select
                        value={captionSize}
                        onChange={(e: any) => setCaptionSize(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1">Style</label>
                      <select
                        value={captionStyle}
                        onChange={(e: any) => setCaptionStyle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                      >
                        <option value="outline">Yellow outline</option>
                        <option value="background">Black ribbon</option>
                        <option value="minimal">Minimal text</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveStep(5)}
                  className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(7)}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: PREVIEW & EXPORT COMPILATION */}
          {activeStep === 7 && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STEP 7 / 8</span>
                <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">AD COMPILE & EXPORT</h3>
                <p className="text-xs text-zinc-500">Render your compiled ad into high-fidelity 9:16 vertical MP4 format for Instagram Reels, TikTok, or YouTube Shorts.</p>
              </div>

              {/* Honest generation state notification */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-sans">Current Render Status:</span>
                  <span className="font-mono font-black text-[10px] bg-amber-950 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                    {renderStatus}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 leading-relaxed font-sans pt-1 border-t border-zinc-850">
                  Because no secure GPU compilation worker node is connected, final MP4 compilation is currently on hold. Direct stream references can still be previewed in real-time above.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    alert('Export halted: UGC GENERATION ENGINE NOT CONFIGURED. Please set up a GPU worker node.');
                  }}
                  className="py-3 bg-zinc-900/60 border border-zinc-800 text-zinc-500 font-bold text-xs uppercase rounded-2xl transition-all text-center cursor-not-allowed"
                >
                  Compile MP4 Video
                </button>
                <button
                  onClick={() => {
                    alert('Export halted: UGC GENERATION ENGINE NOT CONFIGURED. Please set up a GPU worker node.');
                  }}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
                >
                  Download Ad
                </button>
              </div>

              <button
                onClick={() => setActiveStep(1)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
              >
                Restart Navigation Wizard
              </button>
            </div>
          )}

        </div>

        {/* Workspace Right Area: Beautiful 9:16 Vertical Live Preview Box (Cols 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest text-center lg:text-left">VERTICAL 9:16 SOCIAL PREVIEW</div>
          
          <div className="relative w-full max-w-[280px] h-[500px] mx-auto rounded-[36px] border-4 border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col justify-between">
            
            {/* Top Phone Notch cutout */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-b-2xl z-20 pointer-events-none" />

            {/* Video stream layer */}
            <div className="absolute inset-0 z-0">
              <video
                src={presenterId === 'pres-1' ? preloadedPresenters[0].videoUrl : preloadedPresenters[1].videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter contrast-110 brightness-95"
              />
            </div>

            {/* Dark overlay mask on lower half */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />

            {/* Top Logo Watermark Overlay (Branding) */}
            <div className="relative z-10 p-5 pt-8 text-center pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/20 text-purple-300 font-brand text-[9px] font-black uppercase tracking-wider">
                <Video className="w-2.5 h-2.5" />
                <span>CASHMERE KID$ UGC</span>
              </div>
            </div>

            {/* Middle: Overlay Captions overlay */}
            <div className="relative z-10 px-4 text-center">
              {captionsEnabled && script.trim() && (
                <div className={`mx-auto max-w-[240px] rounded-lg p-2 text-center break-words ${
                  captionSize === 'small' ? 'text-[9px]' : captionSize === 'large' ? 'text-[12px]' : 'text-[11px]'
                } ${
                  captionPosition === 'top' ? 'mb-40' : captionPosition === 'middle' ? 'my-auto' : 'mt-24'
                } ${
                  captionStyle === 'outline' ? 'font-mono text-amber-300 font-black tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]' :
                  captionStyle === 'background' ? 'bg-black/85 border border-zinc-800 text-white font-bold' :
                  'text-white font-bold drop-shadow'
                }`}>
                  {script}
                </div>
              )}
            </div>

            {/* Bottom Panel: Dynamic Beat Product Card & Editable CTA Button */}
            <div className="relative z-10 p-4 space-y-3 pb-6">
              
              {/* Beat Product Card Moment */}
              {selectedProduct && (
                <div className="p-3 bg-zinc-950/90 border border-zinc-850 rounded-2xl flex items-center gap-3 backdrop-blur shadow-lg animate-fadeIn text-left">
                  <img src={selectedProduct.artworkUrl} className="w-10 h-10 object-cover rounded-xl border border-zinc-800" alt="Artwork" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest block">BACKGROUND MUSIC:</span>
                    <h5 className="text-[10px] font-bold text-white uppercase truncate">{(selectedProduct as any).title || (selectedProduct as any).name}</h5>
                    <p className="text-[8px] text-zinc-500 font-mono uppercase truncate">
                      {(selectedProduct as any).bpm ? `${(selectedProduct as any).bpm} BPM` : 'BEAT BUNDLE'} · {(selectedProduct as any).key || '24-BIT STEMS'}
                    </p>
                  </div>
                </div>
              )}

              {/* Editable CTA button trigger */}
              <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg border border-purple-400/30">
                {ctaText || 'GET THE BEAT'}
              </button>
            </div>

          </div>

          {/* Simple Timeline visual card */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-left space-y-2">
            <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Ad Sequence Timeline Preview</div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 font-bold overflow-x-auto pb-1">
              <span className="bg-zinc-900 px-2 py-1 rounded text-purple-300">0:00 Presenter Intro</span>
              <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
              <span className="bg-zinc-900 px-2 py-1 rounded text-white">0:03 Captions Play</span>
              <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
              <span className="bg-zinc-900 px-2 py-1 rounded text-purple-400">0:08 Beat Product Moment</span>
              <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
              <span className="bg-zinc-900 px-2 py-1 rounded text-emerald-400">0:12 CTA Trigger</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
