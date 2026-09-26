import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Instagram,
  Twitter,
  Music,
  MapPin,
  ExternalLink,
  Facebook,
  Disc,
  ShoppingBag,
  Download,
  FileText,
  CheckCircle2,
  Award,
  Sparkles,
  Users,
  Play,
  Pause,
  MessageSquare,
  Share2,
  QrCode,
  Shield,
  Heart,
  Send,
  Trash2,
  Sliders,
  Search,
  Filter,
  Grid,
  List,
  Pin,
  Flame,
  Tag,
  DollarSign,
  Package,
  Mic2,
  Calendar,
  Globe,
  Radio,
  Lock,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { ProducerProfile, SaleRecord, Beat, BeatPack, Promotion, LicenseTierKey } from '../types';

interface ProfileViewProps {
  profile: ProducerProfile;
  salesRecords?: SaleRecord[];
  currencySymbol: string;
  beats?: Beat[];
  currentBeat?: Beat | null;
  isPlaying?: boolean;
  onPlayToggle?: (beat: Beat) => void;
  onBuyClick?: (beat: Beat) => void;
  onFreeDownloadClick?: (beat: Beat) => void;
  onShareClick?: (beat: Beat) => void;
  onViewDetail?: (beat: Beat) => void;
  beatPacks?: BeatPack[];
  promotions?: Promotion[];
  onAddToCart?: (beat: Beat, licenseKey: LicenseTierKey) => void;
  onAddMerchToCart?: (item: any) => void;
}

interface GuestbookPost {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  message: string;
  date: string;
  replies: { author: string; text: string; date: string }[];
}

interface ActivityPost {
  id: string;
  text: string;
  date: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  mediaTrack?: { title: string; artworkUrl: string; bpm: number; key: string };
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  salesRecords = [],
  currencySymbol = '$',
  beats = [],
  currentBeat,
  isPlaying = false,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  beatPacks = [],
  promotions = [],
  onAddToCart,
  onAddMerchToCart,
}) => {
  // Theme Color State
  const [themeColor, setThemeColor] = useState<'purple' | 'emerald' | 'amber' | 'cyber'>('purple');

  // Follow State & Counter persistent in local storage
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    return localStorage.getItem('voodoo_profile_is_following') === 'true';
  });
  const [followerCount, setFollowerCount] = useState<number>(() => {
    const saved = localStorage.getItem('voodoo_profile_follower_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [profileViews, setProfileViews] = useState<number>(() => {
    const saved = localStorage.getItem('voodoo_profile_views_count');
    return saved ? parseInt(saved, 10) + 1 : 1;
  });

  useEffect(() => {
    localStorage.setItem('voodoo_profile_views_count', profileViews.toString());
  }, [profileViews]);

  useEffect(() => {
    localStorage.setItem('voodoo_profile_is_following', isFollowing ? 'true' : 'false');
    localStorage.setItem('voodoo_profile_follower_count', followerCount.toString());
  }, [isFollowing, followerCount]);

  // Search & Catalog Filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState<'newest' | 'oldest' | 'bpm_asc' | 'bpm_desc' | 'alpha'>('newest');
  const [catalogLayout, setCatalogLayout] = useState<'list' | 'grid'>('list');

  // Modals
  const [isDMOpen, setIsDMOpen] = useState(false);
  const [dmText, setDmText] = useState('');
  const [dmSubject, setDmSubject] = useState('');
  const [dmNotice, setDmNotice] = useState(false);

  const [isQROpen, setIsQROpen] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // License Dropdown Open per Beat ID
  const [openLicenseBeatId, setOpenLicenseBeatId] = useState<string | null>(null);

  // Guestbook Wall State persistent in localStorage
  const [guestbookPosts, setGuestbookPosts] = useState<GuestbookPost[]>(() => {
    const saved = localStorage.getItem('voodoo_guestbook_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGuestbookMessage, setNewGuestbookMessage] = useState('');
  const [guestbookReplyInputs, setGuestbookReplyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('voodoo_guestbook_posts', JSON.stringify(guestbookPosts));
  }, [guestbookPosts]);

  // Activity Feed State dynamically generated from real beats
  const [activityPosts, setActivityPosts] = useState<ActivityPost[]>(() => {
    const saved = localStorage.getItem('voodoo_activity_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fall through
      }
    }
    // Auto-generate activity timeline entries from real beats if present
    if (beats.length > 0) {
      return beats.map((beat, idx) => ({
        id: `act-beat-${beat.id}`,
        text: `⚡ NEW INSTRUMENTAL RELEASE: "${beat.title}" is now available for lease in the store catalog! High-definition 24-bit audio stems ready.`,
        date: beat.createdDate || 'Recently',
        likes: beat.likeCount || 0,
        liked: false,
        commentsCount: 0,
        mediaTrack: {
          title: beat.title,
          artworkUrl: beat.artworkUrl,
          bpm: beat.bpm,
          key: beat.key,
        }
      }));
    }
    return [];
  });

  const [newStatusText, setNewStatusText] = useState('');

  useEffect(() => {
    localStorage.setItem('voodoo_activity_posts', JSON.stringify(activityPosts));
  }, [activityPosts]);

  // Calculated Real Lifetime Metrics
  const totalPlays = beats.reduce((sum, b) => sum + (b.playCount || 0), 0);
  const totalDownloads = beats.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const totalBeatsCount = beats.length;

  // Social Icons mapping
  const socialIcons: Record<string, React.ReactNode> = {
    youtube: <Youtube className="w-4 h-4 text-red-500" />,
    instagram: <Instagram className="w-4 h-4 text-purple-400" />,
    twitter: <Twitter className="w-4 h-4 text-zinc-400" />,
    spotify: <Music className="w-4 h-4 text-emerald-400" />,
    tiktok: <Music className="w-4 h-4 text-pink-400" />,
    facebook: <Facebook className="w-4 h-4 text-blue-500" />,
    soundcloud: <Disc className="w-4 h-4 text-amber-500" />,
    appleMusic: <Music className="w-4 h-4 text-red-400" />,
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    setDmNotice(true);
    setTimeout(() => {
      setDmNotice(false);
      setIsDMOpen(false);
      setDmText('');
      setDmSubject('');
    }, 1800);
  };

  const handleAddGuestbookPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestbookMessage.trim()) return;
    const newEntry: GuestbookPost = {
      id: `gb-${Date.now()}`,
      authorName: 'Visiting Artist',
      authorHandle: '@artist_guest',
      avatarUrl: profile.avatarUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
      message: newGuestbookMessage.trim(),
      date: 'Just now',
      replies: []
    };
    setGuestbookPosts([newEntry, ...guestbookPosts]);
    setNewGuestbookMessage('');
  };

  const handleAddGuestbookReply = (postId: string) => {
    const text = guestbookReplyInputs[postId];
    if (!text || !text.trim()) return;
    setGuestbookPosts((prev) => prev.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, { author: profile.name, text: text.trim(), date: 'Just now' }]
        };
      }
      return post;
    }));
    setGuestbookReplyInputs({ ...guestbookReplyInputs, [postId]: '' });
  };

  const handleDeleteGuestbookPost = (postId: string) => {
    setGuestbookPosts(guestbookPosts.filter((p) => p.id !== postId));
  };

  const handlePostStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    const newPost: ActivityPost = {
      id: `act-${Date.now()}`,
      text: newStatusText.trim(),
      date: 'Just now',
      likes: 0,
      liked: false,
      commentsCount: 0
    };
    setActivityPosts([newPost, ...activityPosts]);
    setNewStatusText('');
  };

  const handleToggleActivityLike = (postId: string) => {
    setActivityPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    }));
  };

  // Filter & Sort Beats
  const processedBeats = beats
    .filter((b) => {
      if (!catalogSearch.trim()) return true;
      const query = catalogSearch.toLowerCase();
      return b.title.toLowerCase().includes(query) || b.genre.toLowerCase().includes(query) || b.key.toLowerCase().includes(query) || (b.tags && b.tags.some(t => t.toLowerCase().includes(query)));
    })
    .sort((a, b) => {
      if (catalogSort === 'alpha') return a.title.localeCompare(b.title);
      if (catalogSort === 'oldest') return a.id.localeCompare(b.id);
      if (catalogSort === 'bpm_asc') return a.bpm - b.bpm;
      if (catalogSort === 'bpm_desc') return b.bpm - a.bpm;
      return b.id.localeCompare(a.id);
    });

  const pinnedTrack = beats.find((b) => b.featured) || beats[0];

  // Accent Theme Classes
  const themeAccentClasses = {
    purple: 'from-purple-900/40 via-purple-950/20 to-black text-purple-400 border-purple-500/30 bg-purple-600',
    emerald: 'from-emerald-900/40 via-emerald-950/20 to-black text-emerald-400 border-emerald-500/30 bg-emerald-600',
    amber: 'from-amber-900/40 via-amber-950/20 to-black text-amber-400 border-amber-500/30 bg-amber-600',
    cyber: 'from-pink-900/40 via-cyan-950/20 to-black text-pink-400 border-cyan-500/30 bg-pink-600',
  }[themeColor];

  // Active Promo Code Banner
  const activePromo = promotions.find(p => p.active);

  return (
    <div className="space-y-12 py-8 animate-fadeIn max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left font-sans">
      
      {/* ACTIVE PROMO BANNER (Only if active promotion exists) */}
      {activePromo && (
        <div className="p-3.5 bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-950 border border-purple-500/40 rounded-2xl flex items-center justify-between text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-extrabold text-white uppercase tracking-wider">
              ACTIVE STORE PROMO: Use Code <span className="font-mono text-purple-300 font-black px-1.5 py-0.5 bg-purple-900/80 rounded border border-purple-400/30">{activePromo.code}</span> for {activePromo.discountPercent}% OFF!
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-300 font-bold hidden sm:inline-block uppercase">Verified Promo Code</span>
        </div>
      )}

      {/* ==================== 1. BRANDING HEADER ==================== */}
      <div className="relative rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Widescreen Profile Cover Banner Slot */}
        <div className="relative h-56 sm:h-80 w-full overflow-hidden bg-zinc-900">
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt={`${profile.name} Cover Banner`}
              className="w-full h-full object-cover filter brightness-90 contrast-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-950 via-zinc-900 to-black flex items-center justify-center">
              <span className="text-zinc-700 font-brand font-black text-2xl uppercase tracking-widest">{profile.name}</span>
            </div>
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${themeAccentClasses.split(' ')[0]} via-black/60 to-transparent`} />

          {/* Theme Selector Palette */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-zinc-400 font-bold px-1 uppercase">THEME:</span>
            <button onClick={() => setThemeColor('purple')} className={`w-4 h-4 rounded-full bg-purple-600 ${themeColor === 'purple' ? 'ring-2 ring-white' : ''}`} title="Purple Velvet" />
            <button onClick={() => setThemeColor('emerald')} className={`w-4 h-4 rounded-full bg-emerald-500 ${themeColor === 'emerald' ? 'ring-2 ring-white' : ''}`} title="Cyber Emerald" />
            <button onClick={() => setThemeColor('amber')} className={`w-4 h-4 rounded-full bg-amber-500 ${themeColor === 'amber' ? 'ring-2 ring-white' : ''}`} title="Gold Vault" />
            <button onClick={() => setThemeColor('cyber')} className={`w-4 h-4 rounded-full bg-pink-500 ${themeColor === 'cyber' ? 'ring-2 ring-white' : ''}`} title="Cyberpunk Neon" />
          </div>
        </div>

        {/* Profile Identity Details Bar */}
        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            
            {/* Avatar & Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-zinc-950 bg-zinc-900 shadow-2xl relative">
                  <img
                    src={profile.avatarUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 border border-purple-400 p-1.5 rounded-xl shadow-xl flex items-center justify-center text-white" title="Official Verified Producer">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-brand font-black text-white uppercase tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-500/40 text-[9px] font-mono font-black uppercase tracking-widest">
                    PRODUCER PROFILE
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-zinc-400 block uppercase tracking-wider">
                  <span className="text-purple-400">{profile.handle}</span>
                </span>

                {profile.location && (
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Public Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleFollowToggle}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isFollowing ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700' : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isFollowing ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                <span>{isFollowing ? 'FOLLOWING' : 'FOLLOW'}</span>
              </button>

              <button
                onClick={() => setIsDMOpen(true)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Send Direct Message"
              >
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>DM</span>
              </button>

              <button
                onClick={handleCopyProfileLink}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all cursor-pointer relative"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
                {copiedNotice && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                    COPIED!
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsQROpen(true)}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all cursor-pointer"
                title="Generate Profile QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real Metrics Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-900">
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Followers</span>
              <span className="font-mono text-base font-black text-white">{followerCount.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Catalog Volume</span>
              <span className="font-mono text-base font-black text-white">{totalBeatsCount} Beats</span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Catalog Stream Plays</span>
              <span className="font-mono text-base font-black text-purple-300">{totalPlays.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Profile Views</span>
              <span className="font-mono text-base font-black text-emerald-400">{profileViews.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Description */}
      {profile.bio && (
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
          <h3 className="font-brand font-black text-xs text-zinc-400 uppercase tracking-widest">ABOUT THE PRODUCER</h3>
          <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-medium">{profile.bio}</p>
        </div>
      )}

      {/* ==================== 2. PINNED SPOTLIGHT HERO BEAT ==================== */}
      {pinnedTrack && (
        <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-zinc-900/90 to-zinc-950 border-2 border-purple-500/40 rounded-3xl shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-purple-400 fill-purple-400" />
              <span className="font-brand font-black text-xs text-white uppercase tracking-widest">FEATURED SPOTLIGHT TRACK</span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-400/30 font-bold uppercase">
              FEATURED
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img src={pinnedTrack.artworkUrl} alt={pinnedTrack.title} className="w-20 h-20 rounded-2xl object-cover border border-purple-500/30 shadow-lg shrink-0" />
              <div className="space-y-1">
                <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight">{pinnedTrack.title}</h3>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 font-bold">
                  <span className="text-purple-400">{pinnedTrack.bpm} BPM</span>
                  <span>·</span>
                  <span>{pinnedTrack.key}</span>
                  <span>·</span>
                  <span className="uppercase text-zinc-300">{pinnedTrack.genre}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => onPlayToggle && onPlayToggle(pinnedTrack)}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isPlaying && currentBeat?.id === pinnedTrack.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying && currentBeat?.id === pinnedTrack.id ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</span>
              </button>

              <button
                onClick={() => onBuyClick && onBuyClick(pinnedTrack)}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-purple-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
              >
                LEASE ${pinnedTrack.pricing.mp3Lease.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. PUBLIC CATALOG SEARCH, FILTERS & TRACK MATRIX ==================== */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              STORE CATALOG ({processedBeats.length})
            </h2>
            <p className="text-xs text-zinc-500">Audition uncompressed audio previews and select licensing tiers.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by title, BPM, key..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={catalogSort}
              onChange={(e) => setCatalogSort(e.target.value as any)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-300 font-mono"
            >
              <option value="newest">Release Date (Newest)</option>
              <option value="oldest">Release Date (Oldest)</option>
              <option value="bpm_asc">BPM Speed (Slow to Fast)</option>
              <option value="bpm_desc">BPM Speed (Fast to Slow)</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>

            <div className="flex items-center p-1 bg-zinc-950 border border-zinc-850 rounded-xl">
              <button
                onClick={() => setCatalogLayout('list')}
                className={`p-1.5 rounded-lg text-zinc-400 ${catalogLayout === 'list' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : ''}`}
                title="List Layout"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCatalogLayout('grid')}
                className={`p-1.5 rounded-lg text-zinc-400 ${catalogLayout === 'grid' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : ''}`}
                title="Grid Layout"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Catalog List or Grid View */}
        {processedBeats.length > 0 ? (
          catalogLayout === 'list' ? (
            <div className="space-y-3">
              {processedBeats.map((beat) => (
                <div
                  key={beat.id}
                  className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => onPlayToggle && onPlayToggle(beat)}
                      className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 hover:scale-105 transition-transform cursor-pointer relative overflow-hidden"
                    >
                      <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover opacity-60 absolute inset-0" />
                      <div className="relative z-10 bg-black/60 p-2 rounded-full">
                        {isPlaying && currentBeat?.id === beat.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-purple-300" />}
                      </div>
                    </button>

                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white uppercase group-hover:text-purple-300 transition-colors truncate">
                          {beat.title}
                        </h4>
                        {beat.featured && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-950 text-purple-300 border border-purple-500/20 font-bold uppercase">
                            PINNED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <span className="text-purple-400 font-bold">{beat.bpm} BPM</span>
                        <span>·</span>
                        <span>{beat.key}</span>
                        <span>·</span>
                        <span className="uppercase">{beat.genre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {beat.freeDownload && (
                      <button
                        onClick={() => onFreeDownloadClick && onFreeDownloadClick(beat)}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-purple-400" />
                        <span>Free Download</span>
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setOpenLicenseBeatId(openLicenseBeatId === beat.id ? null : beat.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>LEASE ${beat.pricing.mp3Lease.toFixed(2)}</span>
                      </button>

                      {/* License Choice Sub-menu Dropdown */}
                      {openLicenseBeatId === beat.id && (
                        <div className="absolute right-0 top-11 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 z-30 shadow-2xl space-y-1 animate-fadeIn text-left">
                          <div className="px-3 py-1 text-[9px] font-mono text-zinc-500 uppercase font-bold border-b border-zinc-900 pb-1">
                            SELECT LICENSE TIER
                          </div>
                          <button
                            onClick={() => {
                              if (onAddToCart) onAddToCart(beat, 'mp3Lease');
                              setOpenLicenseBeatId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-zinc-900 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer"
                          >
                            <span>Standard MP3 Lease</span>
                            <span className="font-mono text-purple-300 font-bold">${beat.pricing.mp3Lease.toFixed(2)}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (onAddToCart) onAddToCart(beat, 'premiumLease');
                              setOpenLicenseBeatId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-zinc-900 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer"
                          >
                            <span>WAV Lease</span>
                            <span className="font-mono text-purple-300 font-bold">${beat.pricing.premiumLease.toFixed(2)}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (onAddToCart) onAddToCart(beat, 'unlimited');
                              setOpenLicenseBeatId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-zinc-900 rounded-xl flex justify-between items-center text-xs text-white cursor-pointer"
                          >
                            <span>Unlimited Lease</span>
                            <span className="font-mono text-purple-300 font-bold">${beat.pricing.unlimited.toFixed(2)}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {processedBeats.map((beat) => (
                <div key={beat.id} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-3xl space-y-3 hover:border-purple-500/30 transition-all group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={beat.artworkUrl} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={() => onPlayToggle && onPlayToggle(beat)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl">
                        {isPlaying && currentBeat?.id === beat.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                      </div>
                    </button>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase group-hover:text-purple-300 transition-colors truncate">{beat.title}</h4>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{beat.bpm} BPM · {beat.key} · {beat.genre}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                    <span className="font-mono text-sm font-black text-purple-300">${beat.pricing.mp3Lease.toFixed(2)}</span>
                    <button
                      onClick={() => onBuyClick && onBuyClick(beat)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                    >
                      Lease
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-12 text-center bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-2">
            <Radio className="w-8 h-8 text-zinc-700 mx-auto" />
            <h4 className="font-brand font-black text-white text-xs uppercase tracking-wider">NO MATCHING INSTRUMENTALS</h4>
            <p className="text-xs text-zinc-500">Try adjusting your search criteria or filter constraints.</p>
          </div>
        )}
      </div>

      {/* ==================== 4. BEAT PACKS (Rendered from real beatPacks prop) ==================== */}
      {beatPacks.length > 0 && (
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
          <h3 className="font-brand font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            BEAT PACK BUNDLES ({beatPacks.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {beatPacks.map((pack) => (
              <div key={pack.id} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex items-center gap-4">
                <img src={pack.artworkUrl} alt={pack.name} className="w-16 h-16 rounded-xl object-cover border border-zinc-800" />
                <div>
                  <h4 className="font-extrabold text-xs text-white uppercase">{pack.name}</h4>
                  <div className="font-mono text-xs text-purple-300 font-bold">${pack.price.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">{pack.beatIds.length} beats included</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 5. GUESTBOOK WALL & ACTIVITY FEED ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Guestbook Wall */}
        <div className="md:col-span-6 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-brand font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              COMMUNITY GUESTBOOK WALL
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">{guestbookPosts.length} Messages</span>
          </div>

          <form onSubmit={handleAddGuestbookPost} className="space-y-2">
            <textarea
              rows={2}
              placeholder="Leave a public comment or note on the profile wall..."
              value={newGuestbookMessage}
              onChange={(e) => setNewGuestbookMessage(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Post Comment
            </button>
          </form>

          {guestbookPosts.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {guestbookPosts.map((post) => (
                <div key={post.id} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={post.avatarUrl} alt={post.authorName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-white">{post.authorName}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{post.authorHandle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-zinc-500">{post.date}</span>
                      <button onClick={() => handleDeleteGuestbookPost(post.id)} className="text-zinc-600 hover:text-red-400" title="Delete Comment">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{post.message}</p>

                  {post.replies.map((r, i) => (
                    <div key={i} className="p-2.5 bg-purple-950/40 border border-purple-500/20 rounded-xl ml-4 text-[11px] space-y-0.5">
                      <span className="font-bold text-purple-300">{r.author} (Producer Response):</span>
                      <p className="text-zinc-200">{r.text}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Reply as producer..."
                      value={guestbookReplyInputs[post.id] || ''}
                      onChange={(e) => setGuestbookReplyInputs({ ...guestbookReplyInputs, [post.id]: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-white"
                    />
                    <button onClick={() => handleAddGuestbookReply(post.id)} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-1">
              <p className="text-xs text-zinc-500 font-medium">No wall comments posted yet. Be the first artist to leave a note!</p>
            </div>
          )}
        </div>

        {/* Activity Feed Updates */}
        <div className="md:col-span-6 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-brand font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              PRODUCER ACTIVITY TIMELINE
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">{activityPosts.length} Timeline Entries</span>
          </div>

          <form onSubmit={handlePostStatusUpdate} className="space-y-2">
            <textarea
              rows={2}
              placeholder="Post a studio announcement or status update..."
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Publish Status
            </button>
          </form>

          {activityPosts.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {activityPosts.map((act) => (
                <div key={act.id} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={profile.avatarUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'} alt={profile.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-white">{profile.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">{act.date}</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">{act.text}</p>

                  {act.mediaTrack && (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                      <img src={act.mediaTrack.artworkUrl} alt={act.mediaTrack.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <h5 className="font-extrabold text-xs text-white uppercase">{act.mediaTrack.title}</h5>
                        <span className="text-[10px] text-zinc-500 font-mono">{act.mediaTrack.bpm} BPM · {act.mediaTrack.key}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-1 border-t border-zinc-850 text-zinc-400">
                    <button onClick={() => handleToggleActivityLike(act.id)} className={`flex items-center gap-1.5 font-mono text-[10px] font-bold ${act.liked ? 'text-red-400' : 'hover:text-white'}`}>
                      <Heart className={`w-3.5 h-3.5 ${act.liked ? 'fill-red-400' : ''}`} />
                      <span>{act.likes} Likes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-1">
              <p className="text-xs text-zinc-500 font-medium">No activity timeline posts published yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Direct Messaging Modal */}
      {isDMOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="font-brand font-black text-sm text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                DIRECT MESSAGING PORTAL
              </h3>
              <button onClick={() => setIsDMOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dmNotice ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-brand font-black text-white text-xs uppercase">MESSAGE SENT SUCCESSFULLY</h4>
                <p className="text-xs text-zinc-300">Your direct inquiry has been dispatched to the producer inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSendDM} className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Subject / Inquiry Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Beat Request / Exclusive Rights Inquiry"
                    value={dmSubject}
                    onChange={(e) => setDmSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    placeholder="Write your custom business proposal or collaboration query..."
                    value={dmText}
                    onChange={(e) => setDmText(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer">
                  Send Direct Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {isQROpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 text-left">
              <h3 className="font-brand font-black text-sm text-white uppercase">PROFILE QR CODE</h3>
              <button onClick={() => setIsQROpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-white rounded-2xl max-w-[200px] mx-auto border-4 border-purple-600 shadow-xl">
              <QrCode className="w-32 h-32 text-black mx-auto" />
            </div>
            <p className="text-xs text-zinc-400">Scan code with any mobile camera to navigate straight to this storefront profile.</p>
          </div>
        </div>
      )}
    </div>
  );
};
