import React, { useState, useRef } from 'react';
import {
  Users,
  Cpu,
  Building2,
  Sliders,
  Radio,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  ArrowRight,
  Headphones,
  DollarSign,
  Star,
  Layers,
  MessageSquare,
  ShieldCheck,
  FileText,
  UploadCloud,
  RefreshCw,
  Tag,
  Globe,
  Award,
  TrendingUp,
  Mic,
  Code,
  Play,
  Pause,
  Lock,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Volume2,
  Search,
  Filter
} from 'lucide-react';

interface ServicesViewProps {
  currencySymbol: string;
  onNavigateToBrowse: () => void;
  onAddToCart?: (item: any) => void;
}

export interface ServicePackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  turnaround: string;
  badge?: string;
  description: string;
  features: string[];
  icon: any;
  popular?: boolean;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  currencySymbol = '$',
  onNavigateToBrowse,
  onAddToCart,
}) => {
  // Main Role Tab State
  const [activeRoleTab, setActiveRoleTab] = useState<
    'producers' | 'managers' | 'ai_devs' | 'labels' | 'engineers' | 'curators'
  >('producers');

  // =========================================================================
  // =========================================================================
  // 1. MUSIC MANAGERS STATE (Clean Zero-State pre-populated with realistic seed data)
  // =========================================================================
  const [managerClients, setManagerClients] = useState<Array<{ id: string; name: string; handle: string; streams: string; revenue: string; beatsCount: number }>>([
    { id: 'client-1', name: 'Metro Boomin', handle: '@metroboomin', streams: '45.2M', revenue: '$24,500.00', beatsCount: 12 },
    { id: 'client-2', name: 'Lil Yachty', handle: '@lilyachty', streams: '12.8M', revenue: '$8,900.00', beatsCount: 8 },
    { id: 'client-3', name: 'Tay Keith', handle: '@taykeith', streams: '34.1M', revenue: '$18,200.00', beatsCount: 15 }
  ]);
  const [activeManagerClient, setActiveManagerClient] = useState<string>('client-1');
  const [managerSplitPercent, setManagerSplitPercent] = useState<number>(15);
  const [customContractTitle, setCustomContractTitle] = useState<string>('');
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientHandle, setNewClientHandle] = useState<string>('');
  const [contractsList, setContractsList] = useState<Array<{ id: string; title: string; client: string; date: string; status: string }>>([
    { id: 'cnt-1', title: 'Exclusive Instrumental Rights Agreement', client: 'Metro Boomin', date: '2026-09-20', status: 'Auto-Signed' },
    { id: 'cnt-2', title: 'Non-Exclusive WAV Lease Agreement', client: 'Lil Yachty', date: '2026-09-25', status: 'Auto-Signed' }
  ]);

  const handleAddManagerClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    const newClient = {
      id: `client-${Date.now()}`,
      name: newClientName,
      handle: newClientHandle || `@${newClientName.toLowerCase().replace(/\s+/g, '')}`,
      streams: '0',
      revenue: '$0.00',
      beatsCount: 0,
    };
    setManagerClients((prev) => [...prev, newClient]);
    setActiveManagerClient(newClient.id);
    setNewClientName('');
    setNewClientHandle('');
  };

  // =========================================================================
  // 2. AI DEVS STATE (Clean Zero-State pre-populated with realistic seed data)
  // =========================================================================
  const [aiTrainingOptIn, setAiTrainingOptIn] = useState<boolean>(true);
  const [aiApiKey, setAiApiKey] = useState<string>('ck_ai_live_key_0x8f9c1b4');
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [aiSandboxTracks, setAiSandboxTracks] = useState<Array<{ id: string; title: string; tag: string; watermark: string; royaltyRate: string }>>([
    { id: 'ai-trk-1', title: 'VELVET DRIFT - Vocal Topline Stems', tag: 'Human-Made', watermark: 'C2PA-VLV88', royaltyRate: '$0.0025 / step' },
    { id: 'ai-trk-2', title: 'NEON HEAVEN - Synth Loop Stem', tag: 'AI-Assisted', watermark: 'C2PA-NEO12', royaltyRate: '$0.0015 / step' },
    { id: 'ai-trk-3', title: 'SYNTH WAVE - Drums Beat Kit', tag: '100% AI-Generated', watermark: 'C2PA-SYN99', royaltyRate: '$0.0005 / step' }
  ]);
  const [newAiTrackTitle, setNewAiTrackTitle] = useState<string>('');
  const [newAiTag, setNewAiTag] = useState<string>('Human-Made');

  const handleAddAiSandboxTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAiTrackTitle.trim()) return;
    const newTrk = {
      id: `ai-trk-${Date.now()}`,
      title: newAiTrackTitle,
      tag: newAiTag,
      watermark: `C2PA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      royaltyRate: '$0.0025 / step',
    };
    setAiSandboxTracks((prev) => [...prev, newTrk]);
    setNewAiTrackTitle('');
  };

  // =========================================================================
  // 3. RECORD LABELS & A&R STATE (Clean Zero-State pre-populated with realistic seed data)
  // =========================================================================
  const [anrSearchQuery, setAnrSearchQuery] = useState<string>('');
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<number>(0);
  const [anrLeaderboard, setAnrLeaderboard] = useState<Array<{ rank: number; artist: string; track: string; genre: string; bpm: number; engagement: string; streamsVelocity: string }>>([
    { rank: 1, artist: 'PinkPantheress', track: 'Boy\'s a Liar', genre: 'Drum & Bass', bpm: 135, engagement: '98%', streamsVelocity: '+45K streams/hr' },
    { rank: 2, artist: 'Zack Bia', track: 'Hardcore', genre: 'Hip-Hop', bpm: 120, engagement: '94%', streamsVelocity: '+22K streams/hr' },
    { rank: 3, artist: 'Ice Spice', track: 'Deli', genre: 'Drill', bpm: 140, engagement: '91%', streamsVelocity: '+18K streams/hr' },
    { rank: 4, artist: 'Central Cee', track: 'Sprinter', genre: 'UK Drill', bpm: 142, engagement: '89%', streamsVelocity: '+15K streams/hr' }
  ]);
  const [rightsPolicingActive, setRightsPolicingActive] = useState<Record<string, boolean>>({
    'Boy\'s a Liar': true,
    'Hardcore': true,
    'Deli': false
  });

  const handleSimulateBulkIngestion = () => {
    setIsBulkUploading(true);
    setBulkProgress(10);
    const interval = setInterval(() => {
      setBulkProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBulkUploading(false);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  // =========================================================================
  // 4. MUSIC ENGINEERS STATE (Clean Zero-State pre-populated with realistic seed data)
  // =========================================================================
  const [timeNotes, setTimeNotes] = useState<Array<{ timestamp: string; note: string; author: string }>>([
    { timestamp: '00:45', note: 'Sibilance in lead vocal is too harsh, apply a dynamic de-esser here.', author: 'Studio Client' },
    { timestamp: '01:24', note: 'Boost kick transient around 60Hz to punch through the sub bass.', author: 'Senior Mixing Engineer' },
    { timestamp: '02:10', note: 'Automate high-pass filter and stereo delay on vocal outro.', author: 'Studio Client' }
  ]);
  const [newTimestamp, setNewTimestamp] = useState<string>('00:45');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [escrowPaid, setEscrowPaid] = useState<boolean>(false);
  const [activeEngineeringGigs, setActiveEngineeringGigs] = useState<Array<{ id: string, name: string, price: number, turnaround: string, description: string }>>([
    { id: 'mix-1', name: 'Elite Vocal Tuning & Timing', price: 79.00, turnaround: '24 Hours', description: 'Perfect Pitch Auto-Tune & Melodyne manual corrections for a clean, professional sound.' },
    { id: 'mix-2', name: 'Analog Stereo Mastering', price: 129.00, turnaround: '48 Hours', description: 'Warm tube EQ, solid-state limiting, stereo width expansion, and -14 LUFS compliance.' },
    { id: 'mix-3', name: 'Full Audio Stem Mix & Master', price: 299.00, turnaround: '3 Days', description: 'Complete track alignment, custom FX chains, vocal level carving, and dynamic final master.' }
  ]);
  const [projectMilestones, setProjectMilestones] = useState<Array<{ step: string, status: 'Completed' | 'Pending' }>>([
    { step: 'Raw multitrack stems successfully uploaded', status: 'Completed' },
    { step: 'Phase alignment and custom de-noising pass', status: 'Completed' },
    { step: 'Lead vocal tuning and pitch corrections', status: 'Completed' },
    { step: 'First draft mixdown processing and upload', status: 'Pending' }
  ]);

  const handleAddTimestampNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setTimeNotes((prev) => [...prev, { timestamp: newTimestamp || '00:00', note: newNoteText, author: 'Studio Client' }]);
    setNewNoteText('');
  };

  // =========================================================================
  // 5. PLAYLIST CURATORS STATE (Clean Zero-State pre-populated with realistic seed data)
  // =========================================================================
  const [curatorSubmissions, setCuratorSubmissions] = useState<Array<{ id: string; artist: string; track: string; fee: string; status: 'pending' | 'accepted' | 'declined'; critique?: string }>>([
    { id: 'sub-1', artist: 'Ken Carson', track: 'Fighting My Demons', fee: '$15.00', status: 'pending' },
    { id: 'sub-2', artist: 'Yeat', track: 'IDGAF', fee: '$15.00', status: 'accepted', critique: 'Insane vocal energy and unique glitch production style. Placed in Top 5 of our main Spotify playlist.' },
    { id: 'sub-3', artist: 'Destroy Lonely', track: 'If Looks Could Kill', fee: '$15.00', status: 'declined', critique: 'Great ambient aesthetic, but vocals need some high-mid carving to stand out in a playlist flow.' }
  ]);
  const [newSubArtist, setNewSubArtist] = useState<string>('');
  const [newSubTrack, setNewSubTrack] = useState<string>('');
  const [activeCritiqueText, setActiveCritiqueText] = useState<string>('');
  const [playlistMetrics, setPlaylistMetrics] = useState({
    impressions: '142,500',
    streamsVelocity: '+1,230 streams/day',
    royaltiesEarned: 284.50
  });
  const [sponsorshipBattles, setSponsorshipBattles] = useState<Array<{ id: string, name: string, prize: string, brand: string, submissionsCount: number, votes: number }>>([
    { id: 'battle-1', name: 'Red Bull Cyber Beat Battle', prize: '$5,000.00', brand: 'Red Bull Music', submissionsCount: 184, votes: 3450 },
    { id: 'battle-2', name: 'Razer Synthwave Loop Challenge', prize: '$2,500 + Blade Laptop', brand: 'Razer Inc.', submissionsCount: 92, votes: 1230 }
  ]);

  const currentSubmission = curatorSubmissions.find((s) => s.status === 'pending');
  const wordCount = activeCritiqueText.trim() ? activeCritiqueText.trim().split(/\s+/).length : 0;

  const handleAddCuratorSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubArtist.trim() || !newSubTrack.trim()) return;
    setCuratorSubmissions((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        artist: newSubArtist,
        track: newSubTrack,
        fee: '$15.00',
        status: 'pending',
      },
    ]);
    setNewSubArtist('');
    setNewSubTrack('');
  };

  const handleReviewSubmission = (action: 'accepted' | 'declined') => {
    if (wordCount < 15) return;
    if (!currentSubmission) return;

    setCuratorSubmissions((prev) =>
      prev.map((s) => (s.id === currentSubmission.id ? { ...s, status: action, critique: activeCritiqueText } : s))
    );
    setActiveCritiqueText('');
  };

  // =========================================================================
  // 6. BESPOKE PRODUCER PACKAGES
  // =========================================================================
  const [bookingModalService, setBookingModalService] = useState<ServicePackage | null>(null);
  const [artistName, setArtistName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const producerServices: ServicePackage[] = [
    {
      id: 'srv-custom-beat',
      title: 'Custom Beat Production',
      subtitle: 'Exclusive 1-on-1 Beat Built From Scratch',
      price: 499.00,
      turnaround: '3 - 5 Days',
      badge: 'EXCLUSIVE CHOICE',
      popular: true,
      description: 'Get an exclusive instrumental built specifically for your vocal style, BPM requirement, and reference vibe. Includes full stem trackout archive and unlimited commercial rights.',
      features: [
        '100% Exclusive Ownership Rights',
        'Separated WAV Stems Trackout',
        'Up to 3 Revision Rounds',
        'Custom Melody & 808 Sound Design',
        'Included Producer Voice Tag Removal'
      ],
      icon: Sparkles
    },
    {
      id: 'srv-mixing-mastering',
      title: 'Mix & Master Package',
      subtitle: 'Industry-Grade Analog Stereo Processing',
      price: 199.00,
      turnaround: '48 Hours',
      badge: 'HIGH DEMAND',
      description: 'Transform raw vocal tracks and beat stems into radio-ready, streaming-optimized masters (-14 LUFS) with analog warm EQ, multiband compression, and vocal tuning.',
      features: [
        'Vocal Tuning (Auto-Tune / Melodyne)',
        'Full Multi-Track Stem Mixing',
        'Streaming Master (Spotify/Apple Music)',
        'High-Resolution 24-bit WAV & 320kbps MP3',
        '2 Revision Rounds Included'
      ],
      icon: Sliders
    },
    {
      id: 'srv-custom-tag',
      title: 'Custom Producer Voice Tag',
      subtitle: 'Signature Audio Watermark & Vocal ID',
      price: 79.00,
      turnaround: '24 Hours',
      badge: 'INSTANT DELIVERY',
      description: 'Get a professional signature voice tag recorded by elite voice actors with luxury reverb, stutter, and delay FX chains to protect and brand your beats.',
      features: [
        'Professional Male or Female Voice Options',
        'Dry & Wet FX Mastered Stems',
        'Royalty-Free Lifetime Usage',
        'Custom Scripting & Phrasing',
        '24-Hour Express Turnaround'
      ],
      icon: Mic
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-24 text-left font-sans animate-fadeIn">
      
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-zinc-900 to-black border border-purple-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>MUSIC INDUSTRY ENTERPRISE SUITE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-brand tracking-tight leading-none">
            PRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-purple-200">SERVICES & TOOLS</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-2xl">
            Bespoke studio services and enterprise control tools for Music Managers, AI Developers, Record Labels, Mixing Engineers, and Playlist Curators.
          </p>
        </div>
      </div>

      {/* Main Professional Role Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-zinc-800">
        {[
          { id: 'producers', label: '⚡ Producer Packages', icon: Sparkles },
          { id: 'managers', label: '👑 Music Managers', icon: Users },
          { id: 'ai_devs', label: '🤖 AI Developers', icon: Cpu },
          { id: 'labels', label: '🏢 Record Labels', icon: Building2 },
          { id: 'engineers', label: '🎚️ Mixing Engineers', icon: Sliders },
          { id: 'curators', label: '🎧 Playlist Curators', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRoleTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveRoleTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-950 ring-1 ring-purple-400'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BESPOKE PRODUCER PACKAGES */}
      {activeRoleTab === 'producers' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {producerServices.map((service) => {
              const IconComponent = service.icon;

              return (
                <div
                  key={service.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-purple-500/50 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-brand font-black text-xl text-white uppercase">{service.title}</h3>
                      <p className="text-xs font-mono text-purple-300 font-bold">{service.subtitle}</p>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-2xl font-black text-white">{currencySymbol}{service.price.toFixed(2)}</span>
                      <span className="text-xs font-mono text-purple-300">{service.turnaround}</span>
                    </div>
                    <button
                      onClick={() => setBookingModalService(service)}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-2xl cursor-pointer"
                    >
                      Book {service.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MUSIC MANAGERS */}
      {activeRoleTab === 'managers' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Feature A: Multi-Account Dashboard Switcher */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  MANAGEMENT CONTROL TOWER
                </span>
                <h3 className="text-2xl font-brand font-black text-white uppercase">
                  MULTI-ACCOUNT ROSTER SWITCHING
                </h3>
              </div>

              {/* Add New Roster Client Form */}
              <form onSubmit={handleAddManagerClient} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Artist Name (e.g. Young Voodoo)"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  + Add Client
                </button>
              </form>
            </div>

            {/* Client Roster List */}
            {managerClients.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {managerClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setActiveManagerClient(client.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeManagerClient === client.id
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {client.name}
                    </button>
                  ))}
                </div>

                {(() => {
                  const client = managerClients.find((c) => c.id === activeManagerClient) || managerClients[0];
                  if (!client) return null;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Roster Profile:</span>
                        <span className="font-bold text-lg text-white">{client.name}</span>
                        <span className="text-xs font-mono text-purple-400 block">{client.handle}</span>
                      </div>
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Verified Streams:</span>
                        <span className="font-mono font-black text-2xl text-purple-300">{client.streams}</span>
                      </div>
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Gross Revenue:</span>
                        <span className="font-mono font-black text-2xl text-emerald-400">{client.revenue}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-2">
                <Users className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="font-bold text-sm text-white uppercase">NO ROSTER CLIENTS ADDED</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Add your first artist or client profile above to toggle client dashboard analytics, catalogs, and co-pilot revenue splits.
                </p>
              </div>
            )}
          </div>

          {/* Feature B: Automated Co-Pilot Profit Splits Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                CO-PILOT POINT-OF-SALE ROUTING
              </span>
              <h3 className="text-xl font-brand font-black text-white uppercase">
                AUTOMATED REVENUE PROFIT SPLITS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Hardcoded revenue splitting configured directly at point-of-sale checkout. Every beat purchase instantly routes manager commission and artist earnings with zero manual invoice delay.
              </p>

              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-300">Manager Split Commission:</span>
                  <span className="font-mono text-purple-300 text-sm">{managerSplitPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={managerSplitPercent}
                  onChange={(e) => setManagerSplitPercent(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-800 font-mono">
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase block">Manager Earns ({managerSplitPercent}%):</span>
                    <span className="font-extrabold text-purple-300 text-base">${(200 * (managerSplitPercent / 100)).toFixed(2)} / $200 sale</span>
                  </div>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase block">Artist Earns ({100 - managerSplitPercent}%):</span>
                    <span className="font-extrabold text-emerald-400 text-base">${(200 * ((100 - managerSplitPercent) / 100)).toFixed(2)} / $200 sale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature C: Shared Contract Templates Builder */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                LEGAL CONTRACT BUILDER
              </span>
              <h3 className="text-xl font-brand font-black text-white uppercase">
                SHARED CONTRACT TEMPLATES
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Contract Agreement Title (e.g. Exclusive Master License)"
                  value={customContractTitle}
                  onChange={(e) => setCustomContractTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />

                {contractsList.length > 0 ? (
                  <div className="space-y-2">
                    {contractsList.map((cnt) => (
                      <div key={cnt.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{cnt.title}</span>
                          <span className="text-[10px] text-zinc-400">Client: {cnt.client} · {cnt.date}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold">
                          {cnt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-xs text-zinc-400">
                    No custom contract templates uploaded. Enter a title above to create your first agreement.
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!customContractTitle.trim()) return;
                    setContractsList((prev) => [
                      ...prev,
                      { id: `cnt-${Date.now()}`, title: customContractTitle, client: managerClients[0]?.name || 'Artist Client', date: new Date().toISOString().split('T')[0], status: 'Auto-Signed' }
                    ]);
                    setCustomContractTitle('');
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-2xl cursor-pointer"
                >
                  + Create Contract Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI DEVELOPERS */}
      {activeRoleTab === 'ai_devs' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Feature A: Opt-In / Opt-Out Training Registry */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  C2PA COMPLIANCE & ROYALTIES
                </span>
                <h3 className="text-2xl font-brand font-black text-white uppercase">
                  AI MODEL TRAINING REGISTRY
                </h3>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-300">Allow AI Model Licensing:</span>
                <button
                  onClick={() => setAiTrainingOptIn(!aiTrainingOptIn)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                    aiTrainingOptIn ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${aiTrainingOptIn ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Feature B: Developer API Portal Sandbox */}
            <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-300 font-bold">
                <span>Developer REST API Access Token:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiApiKey);
                    setKeyCopied(true);
                    setTimeout(() => setKeyCopied(false), 2000);
                  }}
                  className="text-purple-400 hover:text-white cursor-pointer"
                >
                  {keyCopied ? 'Copied Key!' : 'Copy Key'}
                </button>
              </div>
              <div className="p-3 bg-black rounded-xl border border-zinc-800 text-purple-300 truncate">
                {aiApiKey}
              </div>
            </div>

            {/* Feature C: AI Attribute Tagging & Fingerprinting Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  AI Provenance & Fingerprinting Registry
                </span>

                <form onSubmit={handleAddAiSandboxTrack} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Track Title (e.g. Cyber Lead)"
                    value={newAiTrackTitle}
                    onChange={(e) => setNewAiTrackTitle(e.target.value)}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <select
                    value={newAiTag}
                    onChange={(e) => setNewAiTag(e.target.value)}
                    className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-purple-300 focus:outline-none"
                  >
                    <option value="Human-Made">Human-Made</option>
                    <option value="AI-Assisted">AI-Assisted</option>
                    <option value="100% AI-Generated">100% AI-Generated</option>
                  </select>
                  <button type="submit" className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-xl cursor-pointer">
                    + Register
                  </button>
                </form>
              </div>

              {aiSandboxTracks.length > 0 ? (
                <div className="space-y-2">
                  {aiSandboxTracks.map((trk) => (
                    <div key={trk.id} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="font-bold text-white block">{trk.title}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{trk.watermark}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold">
                          {trk.tag}
                        </span>
                        <span className="font-mono text-emerald-400 text-xs font-bold">{trk.royaltyRate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-xs text-zinc-400">
                  No tracks registered in the AI Sandbox registry. Register a track title above to generate a C2PA fingerprint watermark.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECORD LABELS */}
      {activeRoleTab === 'labels' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Feature A: A&R Scouting Leaderboards */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  A&R TALENT DISCOVERY ENGINE
                </span>
                <h3 className="text-2xl font-brand font-black text-white uppercase">
                  SCOUTING LEADERBOARD & BUZZ FILTERS
                </h3>
              </div>

              <input
                type="text"
                placeholder="Filter by BPM, Genre, or Regional Buzz..."
                value={anrSearchQuery}
                onChange={(e) => setAnrSearchQuery(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {anrLeaderboard.length > 0 ? (
              <div className="space-y-3">
                {anrLeaderboard.map((item) => (
                  <div key={item.rank} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 font-extrabold flex items-center justify-center">
                        #{item.rank}
                      </span>
                      <div>
                        <span className="font-bold text-white text-sm block">{item.track}</span>
                        <span className="text-xs text-zinc-400">{item.artist} · {item.genre} ({item.bpm} BPM)</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold block">{item.engagement} Engagement</span>
                      <span className="text-zinc-500 text-[10px]">{item.streamsVelocity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-2 text-xs text-zinc-400">
                <Building2 className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="font-bold text-white uppercase">NO SCOUTING DATA RANKED</h4>
                <p className="max-w-sm mx-auto">
                  A&R scouting algorithm searches live catalog tracks as streams and engagement metrics build.
                </p>
              </div>
            )}
          </div>

          {/* Feature B: Bulk Master Catalog Ingestion */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
              CATALOG MIGRATION & INGESTION
            </span>
            <h3 className="text-xl font-brand font-black text-white uppercase">
              BULK MASTER CATALOG INGESTION
            </h3>

            {isBulkUploading ? (
              <div className="p-6 bg-zinc-900 border border-purple-500/40 rounded-2xl space-y-3 text-center">
                <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                </div>
                <span className="font-mono text-xs text-purple-300 font-bold block">
                  Ingesting Legacy Master Catalog... {bulkProgress}%
                </span>
              </div>
            ) : (
              <button
                onClick={handleSimulateBulkIngestion}
                className="w-full py-4 bg-zinc-900 hover:bg-zinc-850 border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-2xl text-xs font-extrabold text-zinc-300 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <span>Drag & Drop ISRC CSV & WAV Archives (Bulk Ingestion)</span>
              </button>
            )}
          </div>

          {/* Feature C: Enterprise Rights Management */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                GLOBAL COPYRIGHT PROTECTION
              </span>
              <h3 className="text-xl font-brand font-black text-white uppercase">
                ENTERPRISE RIGHTS MANAGEMENT
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Register and police mechanical, performance, and synchronization rights on a global scale. Monitor copyright compliance and claim royalties.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { track: 'Boy\'s a Liar', artist: 'PinkPantheress', mechanical: '50% Mechanical', performance: '50% Performance (BMI)', sync: '100% Sync Rights Locked' },
                { track: 'Hardcore', artist: 'Zack Bia', mechanical: '75% Mechanical', performance: '25% Performance (ASCAP)', sync: 'Shared Sync Rights' },
                { track: 'Deli', artist: 'Ice Spice', mechanical: '100% Mechanical', performance: '100% Performance (BMI)', sync: 'Pending Clearance' }
              ].map((rights, idx) => (
                <div key={idx} className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-white block text-sm">{rights.track}</span>
                    <span className="text-zinc-500">{rights.artist} · {rights.mechanical}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold">
                      {rights.performance}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold">
                      {rights.sync}
                    </span>
                    <button
                      onClick={() => {
                        setRightsPolicingActive((prev) => ({
                          ...prev,
                          [rights.track]: !prev[rights.track]
                        }));
                      }}
                      className={`px-3 py-1 rounded-xl font-bold font-mono text-[10px] uppercase transition-all cursor-pointer ${
                        rightsPolicingActive[rights.track]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {rightsPolicingActive[rights.track] ? '✓ POLICING ACTIVE' : 'POLICE RIGHTS'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MUSIC ENGINEERS */}
      {activeRoleTab === 'engineers' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Feature A: Time-Stamped Audio Collaboration Tools */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
              AUDIO COLLABORATION DASHBOARD
            </span>
            <h3 className="text-2xl font-brand font-black text-white uppercase">
              TIME-STAMPED REVISION NOTES
            </h3>

            {/* Time-stamped note submission form */}
            <form onSubmit={handleAddTimestampNote} className="flex gap-2">
              <input
                type="text"
                value={newTimestamp}
                onChange={(e) => setNewTimestamp(e.target.value)}
                placeholder="01:14"
                className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-purple-300 focus:outline-none"
              />
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add time-stamped mix note e.g. Lead vocal too quiet..."
                className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Add Note
              </button>
            </form>

            {timeNotes.length > 0 ? (
              <div className="space-y-2">
                {timeNotes.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/30 font-bold">
                        {item.timestamp}
                      </span>
                      <span className="text-zinc-200">{item.note}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{item.author}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-xs text-zinc-400">
                No time-stamped notes added yet. Enter a timestamp (e.g. 01:14) and mix note above.
              </div>
            )}

            {/* Feature B: Secure Stems Vault Escrow */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Stems Vault Escrow Lock</span>
                  <span className="text-zinc-400 text-[11px]">Master download locked until client payment clears.</span>
                </div>
              </div>

              <button
                onClick={() => setEscrowPaid(!escrowPaid)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  escrowPaid ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-black'
                }`}
              >
                {escrowPaid ? '✓ Escrow Cleared (Stems Unlocked)' : 'Release Escrow Payment'}
              </button>
            </div>
          </div>

          {/* Feature B: Service Gig Storefronts */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                DIGITAL GIG STOREFRONT (PRO PAGES)
              </span>
              <h3 className="text-xl font-brand font-black text-white uppercase">
                ENGINEERING SERVICE PACKAGES
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Flat-rate audio mixing and mastering packages with guaranteed dynamic revision turnaround times.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeEngineeringGigs.map((gig) => (
                <div key={gig.id} className="p-5 bg-zinc-900 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">{gig.turnaround} Turnaround</span>
                    <h4 className="font-extrabold text-sm text-white uppercase">{gig.name}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{gig.description}</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-850 flex justify-between items-center text-xs">
                    <span className="font-mono font-black text-white text-base">${gig.price.toFixed(2)}</span>
                    <button
                      onClick={() => alert(`Inquiry submitted for: ${gig.name}`)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-extrabold uppercase rounded-lg cursor-pointer"
                    >
                      Book Gig
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature C: Hybrid Project Workspaces */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  SECURE COLLABORATION PORTAL
                </span>
                <h3 className="text-xl font-brand font-black text-white uppercase">
                  HYBRID PROJECT WORKSPACE
                </h3>
                <p className="text-xs text-zinc-400 max-w-lg">
                  Real-time milestone tracking, stem upload checks, draft mixes audition, and complete revision histories.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-mono">
                <span className="text-zinc-500 block text-[9px] uppercase">Active Session:</span>
                <span className="text-purple-300 font-extrabold">Young Voodoo Ep - Mix Session</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Milestones check */}
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-brand">PROJECT PROGRESS MILESTONES</h4>
                <div className="space-y-3 text-xs">
                  {projectMilestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-850 rounded-xl">
                      <span className="text-zinc-300 font-sans">{milestone.step}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        milestone.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload raw multitracks, draft mixes check */}
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-2xl space-y-4 text-xs font-sans">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-brand">WORKSPACE ASSETS VAULT</h4>
                
                <div className="space-y-2.5">
                  <div className="p-3 bg-black/40 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Raw Multitrack Stems.zip</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Size: 450MB · Uploaded Sept 24</span>
                    </div>
                    <button onClick={() => alert('Downloading raw stems...')} className="text-purple-400 hover:text-white font-bold underline font-mono text-[11px]">Download</button>
                  </div>

                  <div className="p-3 bg-black/40 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">V1_Rough_Draft_Mix.wav</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Size: 45MB · Rendered Sept 25</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => alert('Playing rough draft mix...')} className="text-emerald-400 hover:text-white font-bold underline font-mono text-[11px]">Listen</button>
                      <button onClick={() => alert('Downloading rough draft mix...')} className="text-purple-400 hover:text-white font-bold underline font-mono text-[11px]">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PLAYLIST CURATORS */}
      {activeRoleTab === 'curators' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Feature A: Curator Submission Portal & Guaranteed Feedback Engine */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  CURATOR SUBMISSION INBOX
                </span>
                <h3 className="text-2xl font-brand font-black text-white uppercase">
                  GUARANTEED FEEDBACK ENGINE
                </h3>
              </div>

              <form onSubmit={handleAddCuratorSubmission} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Artist"
                  value={newSubArtist}
                  onChange={(e) => setNewSubArtist(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Track Title"
                  value={newSubTrack}
                  onChange={(e) => setNewSubTrack(e.target.value)}
                  className="w-32 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
                <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl cursor-pointer">
                  + Submit Track
                </button>
              </form>
            </div>

            {currentSubmission ? (
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div>
                    <span className="font-extrabold text-white text-base block">{currentSubmission.track}</span>
                    <span className="text-zinc-400">By {currentSubmission.artist}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">Submission Fee: {currentSubmission.fee}</span>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 block">
                    Mandatory 15-Word Constructive Feedback (Words: {wordCount}/15):
                  </label>
                  <textarea
                    rows={3}
                    value={activeCritiqueText}
                    onChange={(e) => setActiveCritiqueText(e.target.value)}
                    placeholder="Provide specific critique regarding mix balance, vocal energy, or playlist fit..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                  {wordCount < 15 && (
                    <span className="text-[11px] text-amber-400 block font-mono">
                      * You must write at least {15 - wordCount} more words to unlock payout.
                    </span>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    disabled={wordCount < 15}
                    onClick={() => handleReviewSubmission('declined')}
                    className="px-4 py-2 bg-red-950 text-red-300 border border-red-500/40 font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Decline Track
                  </button>
                  <button
                    disabled={wordCount < 15}
                    onClick={() => handleReviewSubmission('accepted')}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Accept & Sync To Spotify Playlist
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-2 text-xs text-zinc-400">
                <Radio className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="font-bold text-white uppercase">CURATOR INBOX EMPTY</h4>
                <p className="max-w-sm mx-auto">
                  Submit a track above or receive artist submissions to provide 15-word feedback and unlock curator payouts.
                </p>
              </div>
            )}
          </div>

          {/* Feature B: Automated Performance-Based Payouts */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  STREAMING REVENUE SHARING
                </span>
                <h3 className="text-xl font-brand font-black text-white uppercase">
                  PERFORMANCE-BASED PAYOUTS
                </h3>
                <p className="text-xs text-zinc-400 max-w-lg">
                  Get automatically rewarded with micro-royalty cuts based on actual playlist streaming impressions and track performances.
                </p>
              </div>

              <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Unclaimed Balance:</span>
                <span className="font-mono text-2xl font-black text-emerald-400 block">${playlistMetrics.royaltiesEarned.toFixed(2)}</span>
                <button
                  onClick={() => {
                    setPlaylistMetrics(prev => ({ ...prev, royaltiesEarned: 0 }));
                    alert('Royalties claimed successfully! Transferred to your connected payout account.');
                  }}
                  disabled={playlistMetrics.royaltiesEarned === 0}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer mt-1"
                >
                  Collect Payout
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 font-mono text-[9px] uppercase block">Total Playlist Impressions:</span>
                  <span className="text-white font-bold text-sm block">{playlistMetrics.impressions} Views</span>
                </div>
                <Users className="w-5 h-5 text-purple-400" />
              </div>

              <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 font-mono text-[9px] uppercase block">Streaming Velocity:</span>
                  <span className="text-emerald-400 font-mono font-bold block">{playlistMetrics.streamsVelocity}</span>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Feature C: Brand Sponsorship Campaigns */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                COMMUNITY ENGAGEMENT & CHALLENGES
              </span>
              <h3 className="text-xl font-brand font-black text-white uppercase">
                BRAND SPONSORSHIP CAMPAIGNS
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Host brand-funded beat battles, mixing challenges, and stream-to-win campaigns with dynamic live leaderboards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sponsorshipBattles.map((battle) => (
                <div key={battle.id} className="p-5 bg-zinc-900 border border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/10 font-mono text-[9px] font-bold uppercase tracking-wider block mb-1">
                        Sponsor: {battle.brand}
                      </span>
                      <h4 className="font-extrabold text-sm text-white uppercase">{battle.name}</h4>
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-sm">{battle.prize} Prize</span>
                  </div>

                  <div className="pt-3 border-t border-zinc-850 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500">{battle.submissionsCount} Submissions</span>
                    <button
                      onClick={() => {
                        setSponsorshipBattles(prev => prev.map(b => b.id === battle.id ? { ...b, votes: b.votes + 1 } : b));
                        alert('Vote counted!');
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Vote ({battle.votes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal for Producer Packages */}
      {bookingModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-left font-sans">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  BOOKING INQUIRY FORM
                </span>
                <h3 className="font-brand font-black text-xl text-white uppercase">
                  {bookingModalService.title}
                </h3>
              </div>
              <button
                onClick={() => setBookingModalService(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setBookingModalService(null); }} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Artist / Label Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Young Voodoo"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase rounded-xl cursor-pointer"
              >
                Submit Project Inquiry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
