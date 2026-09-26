import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Volume2,
  CheckCircle2,
  ShoppingBag,
  Download,
  Share2,
  Folder,
  Music,
  ShieldCheck,
  Disc,
  ArrowUpRight,
  Search,
  Clock,
  Users,
  Flame,
  Tag,
  X,
  ArrowUp,
  ArrowDown,
  Mail,
  Copy,
  Check,
  Eye,
  Heart,
  MessageSquare,
  Layers,
  Sliders,
  ExternalLink,
  Package,
  Gift,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { Beat, Collection, ProducerProfile, BeatPack } from '../types';
import { BeatCard } from '../components/BeatCard';
import { EmptyState } from '../components/EmptyState';

interface HomeViewProps {
  beats: Beat[];
  collections: Collection[];
  profile: ProducerProfile;
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail: (beat: Beat) => void;
  onNavigate: (view: string, filter?: string) => void;
  currencySymbol: string;
  youtubeVideos: any[];
  onAddMerchToCart?: (item: any) => void;
  onAddBeatPackToCart?: (pack: BeatPack) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (beat: Beat) => void;
  recentlyViewedBeats?: Beat[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  beats,
  collections,
  profile,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  onNavigate,
  currencySymbol,
  youtubeVideos = [],
  onAddMerchToCart,
  onAddBeatPackToCart,
  favoriteIds = [],
  onToggleFavorite,
  recentlyViewedBeats = [],
}) => {
  // Hero Video / Image and Mask States
  const [videoBgActive, setVideoBgActive] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);

  // Aesthetic Skin Theme Switcher State
  const [skinTheme, setSkinTheme] = useState<'dark_onyx' | 'cyber_synth' | 'midnight_gold' | 'emerald_vault'>('dark_onyx');

  // Marketing, Urgency & Social Proof States
  const [liveTrafficCount, setLiveTrafficCount] = useState<number>(42);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Section Order Swapping State (Modular Rows)
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'featured',
    'latest',
    'vault',
    'soundkits',
    'services',
    'merch',
    'collections',
    'youtube',
    'testimonials',
    'brand',
  ]);

  // Flash Sale Countdown Clock
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered Beats from catalog
  const filteredBeats = beats.filter((beat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      beat.title.toLowerCase().includes(query) ||
      beat.genre.toLowerCase().includes(query) ||
      beat.key.toLowerCase().includes(query) ||
      beat.bpm.toString().includes(query) ||
      beat.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const featuredBeats = filteredBeats.filter((b) => b.featured);
  const primaryFeatured = featuredBeats[0] || filteredBeats[0];
  const secondaryFeatured = featuredBeats.slice(1, 4);

  const heroBeat = primaryFeatured;
  const isHeroPlaying = currentBeat?.id === heroBeat?.id && isPlaying;

  const latestBeats = filteredBeats.slice(0, 8);
  const vaultBeats = filteredBeats.slice(0, 8);

  const handleCopyCouponCode = () => {
    navigator.clipboard.writeText('CASHMERE15');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setTimeout(() => setNewsletterSubscribed(false), 4000);
    setNewsletterEmail('');
  };

  const moveSectionUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...sectionOrder];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setSectionOrder(updated);
  };

  const moveSectionDown = (idx: number) => {
    if (idx === sectionOrder.length - 1) return;
    const updated = [...sectionOrder];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setSectionOrder(updated);
  };

  // Sound Kits Data
  const sampleSoundKits = [
    {
      id: 'sk-1',
      title: 'VOODOO VAULT Vol. 1 (808s & Drum Kit)',
      price: 34.99,
      coverUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
      inStock: 8,
      isSoldOut: false,
    },
    {
      id: 'sk-2',
      title: 'ANALOG SYNTH PRESETS (Serum & Pigments)',
      price: 24.99,
      coverUrl: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
      inStock: 15,
      isSoldOut: false,
    },
    {
      id: 'sk-3',
      title: 'CASHMERE LOOPS & MELODIC STEMS',
      price: 29.99,
      coverUrl: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
      inStock: 0,
      isSoldOut: true,
    },
  ];

  // Freelance Services Data
  const sampleServices = [
    {
      id: 'srv-1',
      title: 'Vocal Mixing & Mastering',
      price: 149.99,
      turnaround: '24-48 Hours',
      description: 'Analog outboard compression, de-essing, harmonic warmth, and peak loudness optimization for streaming platforms.',
    },
    {
      id: 'srv-2',
      title: 'Bespoke Custom Beat Production',
      price: 499.99,
      turnaround: '3-5 Days',
      description: 'Exclusive 1-on-1 production session tailored to your vocal style. Unlocks full stems & multi-platinum arrangement.',
    },
    {
      id: 'srv-3',
      title: 'Executive Vocal Tuning & Alignment',
      price: 99.99,
      turnaround: '24 Hours',
      description: 'Transparent Auto-Tune & Melodyne vocal pitch correction, micro-timing alignment, and doubled harmony layers.',
    },
  ];

  // Physical Merch Data
  const sampleMerch = [
    {
      id: 'm-1',
      title: 'CASHMERE KID$ Heavyweight Studio Hoodie',
      price: 75.0,
      artworkUrl: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
      stockText: '3 left in stock',
      isSoldOut: false,
    },
    {
      id: 'm-2',
      title: 'VAULT ARCHIVE Vinyl Beat Tape (Limited Edition)',
      price: 45.0,
      artworkUrl: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
      stockText: 'Sold Out',
      isSoldOut: true,
    },
    {
      id: 'm-3',
      title: 'AURA Sound Architecture Embroidered Cap',
      price: 35.0,
      artworkUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
      stockText: '12 in stock',
      isSoldOut: false,
    },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 't-1',
      quote: "Cashmere's 808 glides and analog synth pads completely elevated my track. Signed my first major sync deal 2 weeks after leasing!",
      author: "Kaelen R.",
      role: "RCA Recording Artist",
      rating: 5,
    },
    {
      id: 't-2',
      quote: "Best producer vault on the web. Lossless M4A stems were pristine, fully untagged, and customer support was instant.",
      author: "Marcus Vance",
      role: "Executive A&R / Producer",
      rating: 5,
    },
    {
      id: 't-3',
      quote: "The custom beat production process was seamless. The low-end sub frequencies hit with absurd clarity on club sound systems.",
      author: "Jordan B.",
      role: "Independent Recording Artist",
      rating: 5,
    },
  ];

  // Theme Accent Styling Mappings
  const getThemeAccentClass = () => {
    switch (skinTheme) {
      case 'cyber_synth':
        return 'from-fuchsia-600 via-pink-600 to-cyan-500';
      case 'midnight_gold':
        return 'from-amber-500 via-yellow-600 to-amber-700';
      case 'emerald_vault':
        return 'from-emerald-500 via-teal-600 to-cyan-600';
      default:
        return 'from-purple-600 via-violet-600 to-indigo-600';
    }
  };

  const getThemeTextClass = () => {
    switch (skinTheme) {
      case 'cyber_synth':
        return 'text-fuchsia-400';
      case 'midnight_gold':
        return 'text-amber-400';
      case 'emerald_vault':
        return 'text-emerald-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-32 text-left animate-fadeIn relative font-sans max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 0. CUSTOM ANNOUNCEMENT RIBBON */}
      <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-950 border border-purple-500/30 px-6 py-3 text-xs font-mono text-white flex flex-wrap items-center justify-between gap-3 shadow-2xl rounded-2xl">
        <div className="flex items-center gap-2 font-bold">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span>AUTUMN VAULT DROP: USE CODE <span className="text-purple-300 font-black">CASHMERE15</span> FOR 15% OFF ALL UNLIMITED LEASES</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCouponCode}
            className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow"
          >
            {copiedCoupon ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCoupon ? 'Copied Code!' : 'Copy Code'}</span>
          </button>

          {/* Skin Selector */}
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-xl border border-zinc-800 text-[10px]">
            <Sliders className="w-3 h-3 text-purple-400" />
            <select
              value={skinTheme}
              onChange={(e) => setSkinTheme(e.target.value as any)}
              className="bg-transparent text-zinc-300 font-mono text-[10px] outline-none cursor-pointer"
            >
              <option value="dark_onyx">Dark Onyx</option>
              <option value="cyber_synth">Cyber Synth</option>
              <option value="midnight_gold">Midnight Gold</option>
              <option value="emerald_vault">Emerald Vault</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. CINEMATIC HOMEPAGE HERO WITH VIDEO CANVAS & OVERLAY MASK */}
      <section className="relative min-h-[660px] lg:min-h-[740px] rounded-3xl overflow-hidden bg-black border border-zinc-850/80 p-8 sm:p-14 lg:p-20 flex flex-col justify-between shadow-2xl group">
        
        {/* Full-Width Video Canvas vs HD Image Background Layer */}
        {videoBgActive ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              src="https://www.youtube.com/embed/M6fF8q-1S8o?autoplay=1&mute=1&controls=0&loop=1&playlist=M6fF8q-1S8o&background=1"
              title="Hero Studio Background Loop"
              className="w-[150%] h-[150%] absolute -top-1/4 -left-1/4 object-cover filter grayscale contrast-125 scale-125"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 transition-all duration-700"
            style={{ backgroundImage: `url(${profile.bannerUrl})` }}
          />
        )}

        {/* Overlay Opacity Masking Slider */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: `rgba(6, 6, 8, ${overlayOpacity})` }}
        />

        {/* Top Hero Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-widest shadow">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>CASHMERE KID$ · BEAT COUTURE</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{liveTrafficCount} ARTISTS BROWSING LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
            <button
              type="button"
              onClick={() => setVideoBgActive(!videoBgActive)}
              className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              {videoBgActive ? <Film className="w-3.5 h-3.5 text-purple-400" /> : <ImageIcon className="w-3.5 h-3.5 text-purple-400" />}
              <span>{videoBgActive ? 'Video Loop Canvas' : 'Static HD Background'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span>OVERLAY MASK</span>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-purple-500"
              />
              <span className="w-8 font-bold text-white">{(overlayOpacity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Hero Main Editorial Composition & Global Search Bar */}
        <div className="relative z-10 max-w-4xl my-auto py-10 space-y-8">
          
          <div className="space-y-4 text-center sm:text-left">
            <span className={`text-xs sm:text-sm font-mono font-black uppercase tracking-[0.2em] block ${getThemeTextClass()}`}>
              OFFICIAL BEAT STOREFRONT & CATALOG
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.04] font-brand">
              BEATS FOR ARTISTS WHO REFUSE TO SOUND ORDINARY.
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-2xl">
              Multi-platinum audio architecture crafted for world-tier recording artists. 100M+ Global Streams · Atlanta / LA / Tokyo.
            </p>
          </div>

          {/* HOMEPAGE GLOBAL SEARCH BAR MODULE */}
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog by title, BPM (e.g. 142), scale key, or artist type..."
              className="w-full bg-zinc-950/90 border border-zinc-700/80 focus:border-purple-500 rounded-2xl pl-12 pr-10 py-4 text-white placeholder-zinc-500 text-xs sm:text-sm font-mono outline-none shadow-2xl transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Action Buttons & Flash Sale Clock */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('browse')}
              className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${getThemeAccentClass()} hover:opacity-95 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-950 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer`}
            >
              <span>BROWSE COMPLETE CATALOG</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {heroBeat ? (
              <button
                onClick={() => onPlayToggle(heroBeat)}
                className="px-8 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-purple-400 fill-current" />
                    <span>PAUSE PREVIEW</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-purple-400 fill-current" />
                    <span>AUDITION FEATURED TRACK</span>
                  </>
                )}
              </button>
            ) : null}

            {/* Flash Sale Countdown Clock */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-mono font-bold shadow">
              <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>FLASH SALE: </span>
              <span className="text-white font-mono tracking-wider font-extrabold">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Audio Featured Pin Card Widget */}
        <div className="relative z-10 pt-5 border-t border-zinc-800/80">
          {heroBeat ? (
            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                <div
                  className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800 cursor-pointer group"
                  onClick={() => onViewDetail(heroBeat)}
                >
                  <img
                    src={heroBeat.artworkUrl}
                    alt={heroBeat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayToggle(heroBeat);
                    }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isHeroPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>SPOTLIGHT RELEASE</span>
                    </span>
                    <span>·</span>
                    <span className="font-bold text-purple-300">{heroBeat.bpm} BPM</span>
                    <span>·</span>
                    <span>{heroBeat.key}</span>
                  </div>
                  <h3
                    onClick={() => onViewDetail(heroBeat)}
                    className="font-black text-lg text-white hover:text-purple-300 transition-colors cursor-pointer truncate"
                  >
                    {heroBeat.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold truncate">
                    <span>PROD. CASHMERE KID$</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-end">
                <div className="text-right pr-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">MP3 Lease</span>
                  <span className="text-base font-black font-mono text-white">
                    {currencySymbol}{heroBeat.pricing.mp3Lease.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => onBuyClick(heroBeat)}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Lease</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* RENDER MODULAR HOMEPAGE SECTIONS WITH GENERIOUS PENTHOUSE SPACING */}
      {sectionOrder.map((sectionKey, orderIdx) => {
        
        const renderReorderHandle = (title: string, subtitle?: string) => (
          <div className="flex items-end justify-between border-b border-zinc-900 pb-4 mb-8">
            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-black uppercase tracking-[0.2em] block ${getThemeTextClass()}`}>
                ROW {orderIdx + 1} · STOREFRONT SECTION
              </span>
              <h2 className="text-2xl sm:text-4xl font-brand font-black text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-1 text-zinc-500">
              <button
                type="button"
                onClick={() => moveSectionUp(orderIdx)}
                disabled={orderIdx === 0}
                className="p-1.5 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                title="Shift section position up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveSectionDown(orderIdx)}
                disabled={orderIdx === sectionOrder.length - 1}
                className="p-1.5 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                title="Shift section position down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

        if (sectionKey === 'featured') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('FEATURED PRODUCTIONS', 'Hand-selected priority releases with high-definition stems.')}
              {primaryFeatured ? (
                <div className="space-y-10">
                  <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-purple-500/30 p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-10 shadow-2xl">
                    <div className="relative aspect-square w-full lg:w-96 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800 shadow-2xl group">
                      <img
                        src={primaryFeatured.artworkUrl}
                        alt={primaryFeatured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => onPlayToggle(primaryFeatured)}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform cursor-pointer"
                      >
                        {currentBeat?.id === primaryFeatured.id && isPlaying ? (
                          <Pause className="w-8 h-8 fill-current" />
                        ) : (
                          <Play className="w-8 h-8 fill-current ml-1" />
                        )}
                      </button>
                    </div>

                    <div className="flex-1 space-y-6 text-center lg:text-left w-full">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>SPOTLIGHT INSTRUMENTAL</span>
                        </div>

                        <h3
                          onClick={() => onViewDetail(primaryFeatured)}
                          className="text-3xl sm:text-5xl font-brand font-black text-white hover:text-purple-300 cursor-pointer transition-colors"
                        >
                          {primaryFeatured.title}
                        </h3>

                        <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-zinc-400">
                          <span>PROD. CASHMERE KID$</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
                          <span>·</span>
                          <span className="font-mono text-purple-300">{primaryFeatured.bpm} BPM</span>
                          <span>·</span>
                          <span className="font-mono text-zinc-300">{primaryFeatured.key}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        {primaryFeatured.description || 'Mastered 24-bit luxury instrumental ready for high-level vocal recording.'}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <button
                          onClick={() => onBuyClick(primaryFeatured)}
                          className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>License Beat — {currencySymbol}{primaryFeatured.pricing.mp3Lease.toFixed(2)}</span>
                        </button>

                        {primaryFeatured.freeDownload && (
                          <button
                            onClick={() => onFreeDownloadClick(primaryFeatured)}
                            className="px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-purple-300 hover:text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Free Download</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Featured Grid Row */}
                  {secondaryFeatured.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {secondaryFeatured.map((beat) => (
                        <BeatCard
                          key={beat.id}
                          beat={beat}
                          isPlaying={isPlaying}
                          isCurrent={currentBeat?.id === beat.id}
                          onPlayToggle={onPlayToggle}
                          onBuyClick={onBuyClick}
                          onFreeDownloadClick={onFreeDownloadClick}
                          onShareClick={onShareClick}
                          onViewDetail={onViewDetail}
                          currencySymbol={currencySymbol}
                          isFavorite={favoriteIds.includes(beat.id)}
                          onToggleFavorite={onToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          );
        }

        if (sectionKey === 'latest') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('LATEST RELEASES', 'Fresh uncompressed trap beats updated daily.')}

              {/* Recently Viewed Beats Row (if artist previously viewed beats) */}
              {recentlyViewedBeats.length > 0 && (
                <div className="p-6 bg-zinc-950/80 border border-purple-500/20 rounded-3xl space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">RECENTLY VIEWED PRODUCTIONS</h3>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">{recentlyViewedBeats.length} Items Saved</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {recentlyViewedBeats.slice(0, 6).map((rvBeat) => (
                      <div
                        key={rvBeat.id}
                        onClick={() => onViewDetail(rvBeat)}
                        className="p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950">
                          <img src={rvBeat.artworkUrl} alt={rvBeat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{rvBeat.title}</h4>
                          <span className="text-[10px] font-mono text-purple-300 block">{rvBeat.bpm} BPM · {rvBeat.key}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {latestBeats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {latestBeats.map((beat) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      isPlaying={isPlaying}
                      isCurrent={currentBeat?.id === beat.id}
                      onPlayToggle={onPlayToggle}
                      onBuyClick={onBuyClick}
                      onFreeDownloadClick={onFreeDownloadClick}
                      onShareClick={onShareClick}
                      onViewDetail={onViewDetail}
                      currencySymbol={currencySymbol}
                      isFavorite={favoriteIds.includes(beat.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="NO RELEASES FOUND"
                  description="No beats matched your current search parameters."
                  actionLabel="Clear Search"
                  onAction={() => setSearchQuery('')}
                />
              )}
            </section>
          );
        }

        if (sectionKey === 'vault') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('THE VAULT CATALOG', 'Browse complete audio architecture archives.')}
              {vaultBeats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {vaultBeats.map((beat) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      isPlaying={isPlaying}
                      isCurrent={currentBeat?.id === beat.id}
                      onPlayToggle={onPlayToggle}
                      onBuyClick={onBuyClick}
                      onFreeDownloadClick={onFreeDownloadClick}
                      onShareClick={onShareClick}
                      onViewDetail={onViewDetail}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        }

        if (sectionKey === 'soundkits') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('SOUND KITS & LOOP LIBRARIES', 'Downloadable drum kits, serum synth banks, and sample stems.')}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sampleSoundKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between group shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                        <img
                          src={kit.coverUrl}
                          alt={kit.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {kit.isSoldOut && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                        {!kit.isSoldOut && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-900/90 text-purple-300 border border-purple-500/20 font-mono text-[10px] font-bold rounded-lg shadow">
                            {kit.inStock} LEFT
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white uppercase">{kit.title}</h4>
                        <div className="font-mono text-sm font-black text-purple-300 mt-1">${kit.price.toFixed(2)}</div>
                      </div>
                    </div>

                    <button
                      disabled={kit.isSoldOut}
                      onClick={() => onAddMerchToCart && onAddMerchToCart({ title: kit.title, price: kit.price, artworkUrl: kit.coverUrl })}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow transition-all cursor-pointer"
                    >
                      {kit.isSoldOut ? 'Sold Out' : 'Download Kit'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'services') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('BESPOKE FREELANCE SERVICES', 'Commission vocal mixing, executive mastering, and exclusive beat production.')}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sampleServices.map((srv) => (
                  <div key={srv.id} className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between shadow-xl">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-base text-white uppercase">{srv.title}</h4>
                        <span className="font-mono text-base font-black text-purple-300">${srv.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{srv.description}</p>
                      <div className="text-[10px] font-mono text-zinc-500">Turnaround: {srv.turnaround}</div>
                    </div>

                    <button
                      onClick={() => onAddMerchToCart && onAddMerchToCart({ title: srv.title, price: srv.price, artworkUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg' })}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                    >
                      Book Service
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'merch') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('PHYSICAL MERCHANDISE & VINYL', 'Limited studio apparel and physical vinyl beat tape pressings.')}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sampleMerch.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl">
                    <div className="space-y-3">
                      <img src={item.artworkUrl} alt={item.title} className="w-full aspect-square rounded-2xl object-cover border border-zinc-800" />
                      <div>
                        <h4 className="font-extrabold text-sm text-white uppercase">{item.title}</h4>
                        <span className="font-mono text-sm font-black text-purple-300">${item.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      disabled={item.isSoldOut}
                      onClick={() => onAddMerchToCart && onAddMerchToCart({ title: item.title, price: item.price, artworkUrl: item.artworkUrl })}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer"
                    >
                      {item.isSoldOut ? 'Sold Out' : 'Order Merch'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'collections') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('CURATED GENRE COLLECTIONS', 'Browse instrumentals grouped by mood, vibe, and artist style.')}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => onNavigate('browse', col.name)}
                    className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3 hover:border-purple-500/30 transition-all cursor-pointer group shadow-xl"
                  >
                    <img src={col.artworkUrl} alt={col.name} className="w-full aspect-video rounded-2xl object-cover border border-zinc-800 group-hover:scale-105 transition-transform duration-500" />
                    <div>
                      <h4 className="font-black text-base text-white uppercase group-hover:text-purple-300 transition-colors">{col.name}</h4>
                      <p className="text-xs text-zinc-500">{col.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'youtube') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('STUDIO VISUALIZERS & YOUTUBE VAULT', 'Stream official cookup videos and beat visualizers.')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {youtubeVideos.slice(0, 2).map((vid) => (
                  <div key={vid.id} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800">
                      <iframe
                        src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                        title={vid.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                    <h4 className="font-black text-sm text-white uppercase">{vid.title}</h4>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'testimonials') {
          return (
            <section key={sectionKey} className="space-y-8">
              {renderReorderHandle('ARTIST TESTIMONIALS & REVIEWS', 'Feedback from verified recording talent and A&Rs.')}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div key={t.id} className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
                    <p className="text-xs text-zinc-300 leading-relaxed italic">"{t.quote}"</p>
                    <div>
                      <div className="font-black text-xs text-white uppercase">{t.author}</div>
                      <div className="text-[10px] font-mono text-purple-400">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'brand') {
          return (
            <section key={sectionKey} className="rounded-3xl bg-zinc-950 border border-purple-950/80 p-8 sm:p-14 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
              <img src={profile.avatarUrl} alt={profile.name} className="w-28 h-28 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl shrink-0" />
              <div className="space-y-3 text-center md:text-left flex-1">
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest block">AUTHENTIC AUDIO ARCHITECTURE</span>
                <h3 className="text-2xl sm:text-4xl font-brand font-black text-white uppercase tracking-tight">{profile.name}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-medium">
                  {profile.bio || 'Independent producer delivering high-definition 24-bit uncompressed audio stems for recording artists worldwide.'}
                </p>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
};
