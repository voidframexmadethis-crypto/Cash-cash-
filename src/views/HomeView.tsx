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
import { BeatRow } from '../components/BeatRow';
import { EmptyState } from '../components/EmptyState';
import { StorefrontPicker } from '../components/StorefrontPicker';

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
  beatPacks?: BeatPack[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  beats,
  collections = [],
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
  beatPacks = [],
}) => {
  const [videoBgActive, setVideoBgActive] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);
  const [skinTheme, setSkinTheme] = useState<'dark_onyx' | 'cyber_synth' | 'midnight_gold' | 'emerald_vault'>('dark_onyx');
  const [liveTrafficCount, setLiveTrafficCount] = useState<number>(42);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Feature 23: Top Tracks Timeframe State
  const [topTracksTimeframe, setTopTracksTimeframe] = useState<'all' | '30days' | '7days'>('all');

  // Feature 22: New Releases Display Limit Config
  const [newReleasesLimit, setNewReleasesLimit] = useState<number>(8);

  // Section Order
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'featured',
    'new_releases',
    'top_tracks',
    'collections',
    'beat_picker',
    'vault',
  ]);

  // Flash Sale State
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [campaignTimeLeft, setCampaignTimeLeft] = useState<string>('');
  const [dismissPopup, setDismissPopup] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/flash-sales')
      .then((res) => res.json())
      .then((sales: any[]) => {
        const now = new Date();
        const active = sales.find((s) => {
          const start = new Date(s.startDate);
          const end = new Date(s.endDate);
          return s.status === 'active' && now >= start && now <= end;
        });
        if (active) setActiveCampaign(active);
      })
      .catch((err) => console.error('[HomeView] Load flash sales error:', err));
  }, []);

  useEffect(() => {
    if (!activeCampaign) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeCampaign.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setActiveCampaign(null);
        setCampaignTimeLeft('');
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCampaignTimeLeft(`${h < 10 ? '0' : ''}${h}h : ${m < 10 ? '0' : ''}${m}m : ${s < 10 ? '0' : ''}${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCampaign]);

  // Filter Publicly Published Beats Only
  const publishedBeats = beats.filter((b) => b.published !== false);

  // Feature 25: Multi-Field Search
  const filteredBeats = publishedBeats.filter((beat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      beat.title.toLowerCase().includes(q) ||
      beat.genre.toLowerCase().includes(q) ||
      beat.key.toLowerCase().includes(q) ||
      beat.bpm.toString().includes(q) ||
      (q.includes('bpm') && beat.bpm.toString().includes(q.replace('bpm', '').trim())) ||
      beat.tags.some((t) => t.toLowerCase().includes(q)) ||
      beat.moods.some((m) => m.toLowerCase().includes(q))
    );
  });

  // Feature 21: Featured Beats
  const featuredBeats = filteredBeats.filter((b) => b.featured);
  const primaryFeatured = featuredBeats[0] || filteredBeats[0];
  const secondaryFeatured = featuredBeats.slice(1, 4);

  const heroBeat = primaryFeatured;
  const isHeroPlaying = currentBeat?.id === heroBeat?.id && isPlaying;

  // Feature 22: New Releases
  const newReleasesBeats = [...filteredBeats]
    .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
    .slice(0, newReleasesLimit);

  // Feature 23: Top Tracks
  const topTracksBeats = [...filteredBeats]
    .filter((b) => (b.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 8);

  const handleCopyCouponCode = () => {
    navigator.clipboard.writeText('CASHMERE15');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
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
    <div className="space-y-16 sm:space-y-24 pb-32 text-left font-sans bg-black min-h-screen w-full">
      
      {/* ========================================================================= */}
      {/* ACTIVE FLASH SALE BANNER & PROMO                                          */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-6">
        {activeCampaign && (
          <div className="w-full bg-zinc-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/20 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{activeCampaign.bannerText || 'LIMITED TIME FLASH SALE LIVE'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {activeCampaign.title}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
            >
              {activeCampaign.ctaText || 'VIEW SALE'}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CINEMATIC HERO SECTION                                                    */}
      {/* ========================================================================= */}
      <section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden flex flex-col justify-end p-8 sm:p-14 group">
        {videoBgActive ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/M6fF8q-1S8o?autoplay=1&mute=1&controls=0&loop=1&playlist=M6fF8q-1S8o&background=1"
              title="Hero Background"
              className="w-full h-full object-cover scale-110 filter grayscale contrast-125 brightness-50"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 brightness-50"
            style={{ backgroundImage: `url(${profile.bannerUrl})` }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 space-y-6 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>CASHMERE KID$ · OFFICIAL STORE</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            {profile.name || 'CASHMERE KID$'}
          </h1>
          
          <p className="text-base sm:text-xl text-zinc-300 font-medium leading-relaxed max-w-2xl">
            {profile.bio || 'Premium independent trap, dark synth, and custom sound design.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('browse')}
              className="px-10 py-4 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              <span>Explore The Vault</span>
            </button>
            {heroBeat && (
              <button
                onClick={() => onPlayToggle(heroBeat)}
                className="px-10 py-4 rounded-full bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-500 transition-all"
              >
                {isHeroPlaying ? 'Pause Spotlight' : 'Play Spotlight'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEARCH SECTION                                                            */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 w-full">
        <div className="w-full bg-zinc-950/90 backdrop-blur-2xl border border-purple-500/30 hover:border-purple-500/60 shadow-2xl shadow-purple-950/30 rounded-3xl p-6 flex items-center gap-4 transition-all">
          <Search className="w-6 h-6 text-purple-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beat store by title, BPM, musical key, tag, or mood..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-base sm:text-lg font-medium focus:outline-none"
          />
        </div>
      </section>

      <div className="space-y-28 lg:space-y-36 px-4 sm:px-6 lg:px-8 w-full">
        {/* ========================================================================= */}
        {/* FEATURED BEATS (HORIZONTAL SHELF)                                         */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-900/80">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SPOTLIGHT & EXECUTIVE SELECTIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">FEATURED PRODUCTIONS</h2>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-mono font-bold text-zinc-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore All Beats ({publishedBeats.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-6 snap-x scrollbar-none w-full">
            {featuredBeats.map((beat) => (
              <div key={beat.id} className="min-w-[290px] sm:min-w-[340px] snap-start">
                <BeatCard
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
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* NEW RELEASES (HORIZONTAL SHELF)                                           */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-900/80">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>FRESH FROM THE ANALOG STUDIO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">NEW RELEASES</h2>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-mono font-bold text-zinc-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-6 snap-x scrollbar-none w-full">
            {newReleasesBeats.map((beat) => (
              <div key={beat.id} className="min-w-[290px] sm:min-w-[340px] snap-start">
                <BeatCard
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
              </div>
            ))}
          </div>
        </section>
        
        {/* ========================================================================= */}
        {/* TOP TRACKS                                                                */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-900/80">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>MOST STREAMED BY ARTISTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">TOP CHARTS</h2>
            </div>
          </div>

          <div className="space-y-4 w-full">
            {topTracksBeats.slice(0, 6).map((beat, idx) => (
              <BeatRow
                key={beat.id}
                beat={beat}
                index={idx}
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
        </section>

        {/* ========================================================================= */}
        {/* COLLECTIONS                                                               */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="pb-4 border-b border-zinc-900/80">
            <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
              <Folder className="w-3.5 h-3.5 text-purple-400" />
              <span>THEMATIC SOUND SUITES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">CURATED COLLECTIONS</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {collections.slice(0, 4).map((col) => (
              <div
                key={col.id}
                className="group cursor-pointer bg-zinc-950/80 backdrop-blur-xl p-5 rounded-3xl border border-zinc-850 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 transition-all duration-300"
                onClick={() => onNavigate('collections')}
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-zinc-800 relative">
                  <img src={col.artworkUrl} alt={col.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
                <h3 className="font-extrabold text-white text-lg group-hover:text-purple-300 transition-colors">{col.name}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">Explore Collection →</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beat Picker Section */}
        <div id="beat-picker-anchor" className="pt-10 w-full">
          <StorefrontPicker
            beats={publishedBeats}
            beatPacks={beatPacks}
            currencySymbol={currencySymbol}
            onBuyClick={onBuyClick}
            onAddBeatPackToCart={onAddBeatPackToCart}
          />
        </div>

        {/* VIP Email Subscription Section */}
        <section className="pt-8 w-full">
          <div className="p-8 sm:p-12 bg-gradient-to-r from-purple-950/80 via-zinc-950 to-zinc-950 border border-purple-500/30 rounded-3xl shadow-2xl space-y-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>EXECUTIVE ARTIST LIST</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                JOIN THE CASHMERE VIP ARTIST VAULT
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
                Get instant 50% discount codes, unreleased beat previews, and exclusive free download stem packages delivered directly to your inbox.
              </p>
            </div>

            {newsletterSubscribed ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-mono font-bold">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>YOU ARE SUBSCRIBED! Welcome to the Cashmere Kid$ VIP Artist Network. Check your inbox for your 50% promo code (CASHMERE50).</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail.trim()) {
                    setNewsletterSubscribed(true);
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-xl"
              >
                <div className="relative flex-1">
                  <Mail className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950/80 transition-all cursor-pointer shrink-0"
                >
                  SUBSCRIBE NOW
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
