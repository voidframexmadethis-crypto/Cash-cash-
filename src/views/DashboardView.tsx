import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Play,
  Download,
  Users,
  TrendingUp,
  Tag,
  FileText,
  Radio,
  ShoppingBag,
  Settings,
  Trash2,
  Edit2,
  CheckCircle2,
  BarChart2,
  Zap,
  Plus,
  Percent,
  Gift,
  Copy,
  Check,
  Package,
  Mic2,
  Music,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Sliders,
  Mail,
  FileSpreadsheet,
  X,
  Menu,
  FileCode,
  Youtube,
  MapPin,
  User,
  Image as ImageIcon,
  Link2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Globe,
  Share2,
  Heart,
  PieChart,
  Calendar,
  Lock,
  Send,
  Eye,
  Filter,
  CheckSquare,
  Layers,
  MessageSquare,
  Award,
  Search,
  FolderPlus,
  RefreshCw,
  FileCheck,
  AlertCircle,
  ThumbsUp,
  SlidersHorizontal,
  Activity,
  ChevronRight,
  SendHorizontal,
  Archive,
  Save,
  CheckCircle,
  RotateCcw,
  Sliders as SlidersIcon
} from 'lucide-react';
import { Beat, FreeDownloadLead, Promotion, SaleRecord, StoreSettings, ProducerProfile, BeatPack } from '../types';
import { UploadModal } from '../components/UploadModal';

interface DashboardViewProps {
  beats: Beat[];
  salesRecords: SaleRecord[];
  leads: FreeDownloadLead[];
  promotions: Promotion[];
  settings: StoreSettings;
  onUpdateBeatPrice: (beatId: string, newPrice: number) => void;
  onToggleFreeDownload: (beatId: string, free: boolean) => void;
  onDeleteBeat: (beatId: string) => void;
  onDuplicateBeat?: (beatId: string) => void;
  onAddPromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
  onPublishBeat?: (newBeat: Beat) => void;
  onUpdateBeat?: (beat: Beat) => void;
  onReorderBeats?: (reorderedBeats: Beat[]) => void;
  currencySymbol: string;
  profile: ProducerProfile;
  onUpdateProfile: (p: ProducerProfile) => void;
  youtubeVideos: any[];
  onUpdateYoutubeVideos: (v: any[]) => void;
  onNavigateToProfile: () => void;
  beatPacks?: BeatPack[];
  onUpdateBeatPacks?: (packs: BeatPack[]) => void;
}

interface SoundKitItem {
  id: string;
  title: string;
  price: number;
  salesCount: number;
  type: string;
  coverUrl: string;
}

interface ServiceItem {
  id: string;
  title: string;
  price: number;
  deliveryDays: number;
  description: string;
}

interface InboxMessage {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  type: 'Inquiry' | 'Negotiation' | 'Support' | 'Custom Work';
  date: string;
  status: 'Open' | 'Replied' | 'Flagged' | 'Closed';
  messages: { sender: 'customer' | 'producer'; text: string; time: string }[];
}

interface ServiceOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  amount: number;
  orderDate: string;
  dueDate: string;
  status: 'Stem File Pending' | 'In Progress' | 'Client Review' | 'Completed';
  stemUrl: string;
  notes: string;
}

interface BeatCollection {
  id: string;
  title: string;
  description: string;
  artworkUrl: string;
  beatIds: string[];
  published: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  beats,
  salesRecords,
  leads,
  promotions,
  settings,
  onUpdateBeatPrice,
  onToggleFreeDownload,
  onDeleteBeat,
  onDuplicateBeat,
  onAddPromotion,
  onDeletePromotion,
  onPublishBeat,
  onUpdateBeat,
  onReorderBeats,
  currencySymbol,
  profile,
  onUpdateProfile,
  youtubeVideos,
  onUpdateYoutubeVideos,
  onNavigateToProfile,
  beatPacks = [],
  onUpdateBeatPacks,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Upload modal state & page mode
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Time interval state for analytics
  const [timeInterval, setTimeInterval] = useState<'today' | '7days' | '30days' | 'alltime'>('30days');

  // Beat Catalog Local Filter & Search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED' | 'ARCHIVED' | 'FEATURED'>('ALL');

  // Destructive Action Confirmation Modal
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm Delete',
    onConfirm: () => {},
  });

  // Global Save State Indicators
  const [globalSaveState, setGlobalSaveState] = useState<'idle' | 'saving' | 'saved' | 'unsaved' | 'error'>('idle');
  const [globalSaveMessage, setGlobalSaveMessage] = useState<string>('');

  // Collections State
  const [collections, setCollections] = useState<BeatCollection[]>(() => {
    const saved = localStorage.getItem('voodoo_collections');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      {
        id: 'col-1',
        title: 'Runway Dark Trap Collection',
        description: 'Boutique 808 glides and high-fashion synth textures.',
        artworkUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
        beatIds: beats.slice(0, 3).map((b) => b.id),
        published: true,
      },
      {
        id: 'col-2',
        title: 'Tokyo Nighthawk Collection',
        description: 'Ambient nocturnal freestyle trap instrumentals.',
        artworkUrl: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
        beatIds: beats.slice(2, 5).map((b) => b.id),
        published: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('voodoo_collections', JSON.stringify(collections));
  }, [collections]);

  // Collection creation modal / form
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);

  // Audio Mastering local states
  const [eqLow, setEqLow] = useState<number>(3.0);
  const [eqMid, setEqMid] = useState<number>(-1.5);
  const [eqHigh, setEqHigh] = useState<number>(4.2);
  const [compThreshold, setCompThreshold] = useState<number>(-18.5);
  const [compRatio, setCompRatio] = useState<number>(3.5);
  const [limiterThreshold, setLimiterThreshold] = useState<number>(-2.5);
  const [limiterCeiling, setLimiterCeiling] = useState<number>(-0.2);
  const [watermarkInterval, setWatermarkInterval] = useState<number>(15);

  // Profile Settings local state
  const [profileName, setProfileName] = useState(profile.name || 'CASHMERE KID$');
  const [profileHandle, setProfileHandle] = useState(profile.handle || '@cashmerekid');
  const [profileAvatar, setProfileAvatar] = useState(profile.avatarUrl || '');
  const [profileBanner, setProfileBanner] = useState(profile.bannerUrl || '');
  const [profileLocation, setProfileLocation] = useState(profile.location || 'Atlanta / Los Angeles / Tokyo');
  const [profileBio, setProfileBio] = useState(profile.bio || '');

  // Social links
  const [socialInsta, setSocialInsta] = useState(profile.socialLinks?.instagram || '');
  const [socialYoutube, setSocialYoutube] = useState(profile.socialLinks?.youtube || '');
  const [socialTwitter, setSocialTwitter] = useState(profile.socialLinks?.twitter || '');
  const [socialSpotify, setSocialSpotify] = useState(profile.socialLinks?.spotify || '');
  const [socialTiktok, setSocialTiktok] = useState(profile.socialLinks?.tiktok || '');
  const [socialSoundcloud, setSocialSoundcloud] = useState(profile.socialLinks?.soundcloud || '');
  const [socialFacebook, setSocialFacebook] = useState(profile.socialLinks?.facebook || '');
  const [socialAppleMusic, setSocialAppleMusic] = useState(profile.socialLinks?.appleMusic || '');

  // YouTube video form state
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoId, setNewVideoId] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('OFFICIAL VISUALIZER');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('3:00');

  // Edit beat modal state
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(29.99);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBpm, setEditBpm] = useState<number>(140);
  const [editKey, setEditKey] = useState<string>('C Minor');
  const [editGenre, setEditGenre] = useState<string>('TRAP');
  const [editUnlimitedPrice, setEditUnlimitedPrice] = useState<number>(199.99);
  const [editFeatured, setEditFeatured] = useState<boolean>(false);
  const [editPublished, setEditPublished] = useState<boolean>(true);
  const [editArtworkUrl, setEditArtworkUrl] = useState<string>('');

  // Promo Code Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(20);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoExp, setNewPromoExp] = useState('2026-12-31');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // BOGO / Bulk Deals state
  const [bogoEnabled, setBogoEnabled] = useState(true);
  const [bogoDealType, setBogoDealType] = useState<'buy2get1' | 'buy3get2'>('buy2get1');

  // SoundKits list
  const [soundKits, setSoundKits] = useState<SoundKitItem[]>([
    {
      id: 'sk-1',
      title: 'VOODOO VAULT Vol. 1 (808s & Drums)',
      price: 34.99,
      salesCount: 14,
      type: 'Drum Kit',
      coverUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
    },
    {
      id: 'sk-2',
      title: 'ANALOG VOODOO SYNTH PRESETS',
      price: 24.99,
      salesCount: 8,
      type: 'Serum Presets',
      coverUrl: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
    },
  ]);

  // Services list
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'srv-1',
      title: 'Vocal Mixing & Mastering',
      price: 149.99,
      deliveryDays: 3,
      description: 'Industry standard vocal tuning, analog warmth EQ, compression and mastering.',
    },
    {
      id: 'srv-2',
      title: 'Exclusive Custom Beat Production',
      price: 499.99,
      deliveryDays: 5,
      description: 'Tailored 1-on-1 production built exclusively for your album release.',
    },
  ]);

  // CRM Inbox Messages
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([
    {
      id: 'msg-101',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus.vance@soundcloud.com',
      subject: 'Custom stems request for "VOODOO NIGHTS"',
      type: 'Inquiry',
      date: '2026-09-25 14:32',
      status: 'Open',
      messages: [
        { sender: 'customer', text: 'Hey Cashmere! Love the 808s on VOODOO NIGHTS. Do you offer track stems for vocal arrangements?', time: '14:32' },
      ],
    },
    {
      id: 'msg-102',
      customerName: 'Elena Rostova',
      customerEmail: 'elena.rostova@warner.com',
      subject: 'Exclusive License Negotiation - "VELVET DRIP"',
      type: 'Negotiation',
      date: '2026-09-24 19:10',
      status: 'Replied',
      messages: [
        { sender: 'customer', text: 'We would like to make a counter offer of $750 for full Exclusive Rights on VELVET DRIP.', time: '19:10' },
        { sender: 'producer', text: 'Hi Elena, our floor threshold for Exclusive Rights is $899.99. I can meet you at $850 with full WAV stems.', time: '20:15' },
      ],
    },
  ]);

  // Pixel Settings
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('G-882390192X');
  const [metaPixelId, setMetaPixelId] = useState('192039102938102');
  const [tikTokPixelId, setTikTokPixelId] = useState('TT-90182309123');

  // Metrics derived from actual data
  const totalRevenue = salesRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPlays = beats.reduce((sum, b) => sum + (b.playCount || 0), 0);
  const totalDownloads = beats.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const publishedBeats = beats.filter((b) => b.published !== false);
  const draftBeats = beats.filter((b) => b.published === false);

  // Organized Information Architecture (Prompt Section 2)
  const sidebarLinks = [
    {
      section: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'analytics', label: 'Studio Analytics', icon: BarChart2 },
      ],
    },
    {
      section: 'CATALOG',
      items: [
        { id: 'catalog', label: 'Beats Library', icon: Radio },
        { id: 'beatpacks', label: 'Beat Packs', icon: Package },
        { id: 'collections', label: 'Collections', icon: Layers },
        { id: 'soundkits', label: 'Merch & Kits', icon: ShoppingBag },
      ],
    },
    {
      section: 'CREATE',
      items: [
        { id: 'upload_beat', label: 'Upload Beat', icon: Plus },
        { id: 'upload_pack', label: 'Upload Beat Pack', icon: FolderPlus },
      ],
    },
    {
      section: 'AUDIO',
      items: [
        { id: 'mastering', label: 'Player & Mastering', icon: SlidersIcon },
      ],
    },
    {
      section: 'COMMERCE',
      items: [
        { id: 'sales', label: 'Sales & Orders', icon: DollarSign },
        { id: 'downloads', label: 'Artist Leads', icon: Download },
        { id: 'crm', label: 'Customer CRM', icon: MessageSquare },
        { id: 'promotions', label: 'Coupon Campaigns', icon: Tag },
        { id: 'services', label: 'Bespoke Services', icon: Mic2 },
      ],
    },
    {
      section: 'STOREFRONT',
      items: [
        { id: 'featured_content', label: 'Featured Content', icon: Sparkles },
        { id: 'youtube_videos', label: 'YouTube Videos', icon: Youtube },
      ],
    },
    {
      section: 'PROFILE',
      items: [
        { id: 'profile_settings', label: 'Public Profile & Links', icon: User },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Store Settings', icon: Settings },
        { id: 'integrations', label: 'Payment Settings', icon: DollarSign },
        { id: 'legal_services', label: 'Legal Contracts', icon: FileText },
        { id: 'splits_copyright', label: 'Splits & Copyright', icon: Shield },
        { id: 'marketing_security', label: 'Marketing & Security', icon: Zap },
      ],
    },
  ];

  const triggerSaveState = (msg: string) => {
    setGlobalSaveState('saving');
    setGlobalSaveMessage(msg);
    setTimeout(() => {
      setGlobalSaveState('saved');
      setTimeout(() => setGlobalSaveState('idle'), 2500);
    }, 500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      alert('No artist leads available to export yet.');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Beat Title,Date,Country', ...leads.map((l) => `${l.email},"${l.beatTitle}",${l.downloadDate},${l.ipCountry}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cashmere_kid_artist_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBuyersCSV = () => {
    const csvHeader = 'Customer Name,Email,Beat Purchased,License,Amount,Date,Status\n';
    const csvRows = salesRecords
      .map((r) => `"${r.customerName}","${r.customerEmail}","${r.beatTitle}","${r.licenseType}",${r.amount},"${r.date}","${r.status}"`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyer_contacts_export_${Date.now()}.csv`;
    a.click();
  };

  const startEditingBeat = (beat: Beat) => {
    setEditingBeat(beat);
    setEditPriceVal(beat.pricing.mp3Lease);
    setEditTitle(beat.title);
    setEditBpm(beat.bpm);
    setEditKey(beat.key);
    setEditGenre(beat.genre);
    setEditUnlimitedPrice(beat.pricing.unlimited);
    setEditFeatured(!!beat.featured);
    setEditPublished(beat.published !== false);
    setEditArtworkUrl(beat.artworkUrl || '');
  };

  const saveEditedBeat = () => {
    if (!editingBeat || !onUpdateBeat) return;
    const updated: Beat = {
      ...editingBeat,
      title: editTitle,
      bpm: editBpm,
      key: editKey,
      genre: editGenre as any,
      featured: editFeatured,
      published: editPublished,
      artworkUrl: editArtworkUrl,
      pricing: {
        ...editingBeat.pricing,
        mp3Lease: editPriceVal,
        unlimited: editUnlimitedPrice,
      },
    };
    onUpdateBeat(updated);
    setEditingBeat(null);
    triggerSaveState('Beat parameters updated');
  };

  const handleSaveProfile = () => {
    triggerSaveState('Saving Profile Settings...');
    const updatedProfile: ProducerProfile = {
      name: profileName.trim(),
      handle: profileHandle.trim(),
      avatarUrl: profileAvatar.trim(),
      bannerUrl: profileBanner.trim(),
      location: profileLocation.trim(),
      bio: profileBio.trim(),
      verified: profile.verified,
      socialLinks: {
        instagram: socialInsta.trim(),
        youtube: socialYoutube.trim(),
        twitter: socialTwitter.trim(),
        spotify: socialSpotify.trim(),
        tiktok: socialTiktok.trim(),
        soundcloud: socialSoundcloud.trim(),
        facebook: socialFacebook.trim(),
        appleMusic: socialAppleMusic.trim(),
      } as any,
    };
    onUpdateProfile(updatedProfile);
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoId.trim()) return;
    const newVideo = {
      id: `video-${Date.now()}`,
      youtubeId: newVideoId.trim(),
      title: newVideoTitle.toUpperCase().trim(),
      category: newVideoCategory,
      duration: newVideoDuration,
      description: newVideoDesc.trim() || 'Custom studio video uploaded to YouTube Vault.',
      thumbnail: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
    };
    onUpdateYoutubeVideos([newVideo, ...youtubeVideos]);
    setNewVideoTitle('');
    setNewVideoId('');
    setNewVideoDesc('');
    triggerSaveState('YouTube Video Embedded');
  };

  // Filter beats for beats catalog view
  const filteredCatalogBeats = beats.filter((beat) => {
    const matchesSearch =
      catalogSearch === '' ||
      beat.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      beat.genre.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      beat.key.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      beat.bpm.toString().includes(catalogSearch);

    if (catalogStatusFilter === 'PUBLISHED') return matchesSearch && beat.published !== false;
    if (catalogStatusFilter === 'DRAFT') return matchesSearch && beat.published === false;
    if (catalogStatusFilter === 'UNPUBLISHED') return matchesSearch && beat.published === false;
    if (catalogStatusFilter === 'FEATURED') return matchesSearch && beat.featured;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-zinc-950 border-b border-zinc-900 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-brand font-black text-sm uppercase tracking-wider text-white">PRODUCER STUDIO</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Brand Lockup */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                PRIVATE CONTROL CENTER
              </span>
              <h1 className="font-brand font-black text-lg text-white tracking-tight uppercase">
                {profileName || 'CASHMERE KID$'}
              </h1>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-zinc-500 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsUploadModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Beat Track</span>
            </button>
          </div>

          {/* Sidebar Nav Sections */}
          <nav className="space-y-5">
            {sidebarLinks.map((sec) => (
              <div key={sec.section} className="space-y-1">
                <div className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase tracking-widest px-2 py-1">
                  {sec.section}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'upload_beat' || item.id === 'upload_pack') {
                          setIsUploadModalOpen(true);
                        } else {
                          setActiveTab(item.id);
                        }
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-900 bg-black/40 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">Vault Engine Online</span>
          </div>
          <button
            onClick={onNavigateToProfile}
            className="text-purple-400 hover:text-white text-[11px] font-bold underline"
          >
            View Profile →
          </button>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-x-hidden min-w-0">
        {/* Global Save Indicator Badge */}
        {globalSaveState !== 'idle' && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-purple-500/50 shadow-2xl flex items-center gap-2 text-xs font-mono font-bold animate-fadeIn">
            {globalSaveState === 'saving' && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
            {globalSaveState === 'saved' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <span className="text-white">{globalSaveMessage || 'Changes Saved'}</span>
          </div>
        )}

        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">
                CASHMERE KID$ CONTROL CENTER
              </span>
              <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight mt-1">
                STUDIO OVERVIEW
              </h2>
            </div>

            {/* Metrics Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Gross Sales Revenue</span>
                <div className="text-2xl font-mono font-black text-white">{currencySymbol}{totalRevenue.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-400 font-bold">100% Direct Payouts</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Published Catalog</span>
                <div className="text-2xl font-mono font-black text-purple-300">{publishedBeats.length} Tracks</div>
                <span className="text-[10px] text-zinc-400 font-medium">{draftBeats.length} Drafts Saved</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Beat Pack Bundles</span>
                <div className="text-2xl font-mono font-black text-white">{beatPacks.length} Packs</div>
                <span className="text-[10px] text-purple-400 font-bold">Active Stem Bundles</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Captured Leads</span>
                <div className="text-2xl font-mono font-black text-white">{leads.length} Contacts</div>
                <span className="text-[10px] text-purple-400 font-bold">Exportable CSV</span>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-brand">QUICK WORKSPACE SHORTCUTS</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="p-4 bg-zinc-900 hover:bg-zinc-850 rounded-2xl border border-zinc-800 text-center hover:border-purple-500/30 transition-all flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Upload Beat</span>
                </button>
                <button
                  onClick={() => setActiveTab('beatpacks')}
                  className="p-4 bg-zinc-900 hover:bg-zinc-850 rounded-2xl border border-zinc-800 text-center hover:border-purple-500/30 transition-all flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Package className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Manage Beat Packs</span>
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className="p-4 bg-zinc-900 hover:bg-zinc-850 rounded-2xl border border-zinc-800 text-center hover:border-purple-500/30 transition-all flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Collections</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile_settings')}
                  className="p-4 bg-zinc-900 hover:bg-zinc-850 rounded-2xl border border-zinc-800 text-center hover:border-purple-500/30 transition-all flex flex-col items-center gap-2 cursor-pointer"
                >
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Recorded Sales Orders */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="font-brand font-black text-sm text-white uppercase tracking-widest">RECORDED SALES ACTIVITY</h3>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">{salesRecords.length} ORDERS TOTAL</span>
              </div>

              {salesRecords.length > 0 ? (
                <div className="space-y-3">
                  {salesRecords.map((sale) => (
                    <div key={sale.id} className="p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{sale.beatTitle}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/20 font-mono">
                            {sale.licenseType}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{sale.customerEmail} · Order #{sale.orderId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-purple-300">{currencySymbol}{sale.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">{sale.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-2">
                  <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto" />
                  <h4 className="font-brand font-black text-white text-xs tracking-wider uppercase">NO ORDERS RECORDED YET</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    Your store is active and connected to direct escrow payment processing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. STUDIO ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">STUDIO REPORTING & ANALYTICS</h2>
                <p className="text-xs text-zinc-500">Real-time revenue monitoring, regional traffic, and listener activity.</p>
              </div>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
                {(['today', '7days', '30days', 'alltime'] as const).map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setTimeInterval(interval)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      timeInterval === interval ? 'bg-purple-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {interval === 'today' ? 'Today' : interval === '7days' ? '7 Days' : interval === '30days' ? '30 Days' : 'All-Time'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Gross Revenue</span>
                <div className="text-2xl font-mono font-black text-white">{currencySymbol}{totalRevenue.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-400 font-bold">Verified Sales</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Plays</span>
                <div className="text-2xl font-mono font-black text-purple-300">{totalPlays}</div>
                <span className="text-[10px] text-purple-400 font-bold">Streams Count</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Downloads</span>
                <div className="text-2xl font-mono font-black text-white">{totalDownloads}</div>
                <span className="text-[10px] text-zinc-400 font-bold">Tagged Audios</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Platform Fee Saved</span>
                <div className="text-2xl font-mono font-black text-emerald-400">{currencySymbol}{(totalRevenue * 0.15).toFixed(2)}</div>
                <span className="text-[10px] text-zinc-400 font-bold">0% Direct Payouts</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. BEATS CATALOG LIBRARY TAB ==================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">BEATS LIBRARY MANAGEMENT</h2>
                <p className="text-xs text-zinc-500">Edit parameters, toggle visibility, assign featured status, or duplicate tracks.</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Beat Track</span>
              </button>
            </div>

            {/* Catalog Search & Status Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search library by title, genre, key, BPM..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {(['ALL', 'PUBLISHED', 'DRAFT', 'UNPUBLISHED', 'FEATURED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setCatalogStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      catalogStatusFilter === status
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Beats List */}
            <div className="space-y-3">
              {filteredCatalogBeats.map((beat) => (
                <div
                  key={beat.id}
                  className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={beat.artworkUrl}
                      alt={beat.title}
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white truncate">{beat.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            beat.published !== false
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {beat.published !== false ? 'PUBLISHED' : 'DRAFT / UNPUBLISHED'}
                        </span>
                        {beat.featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 font-bold uppercase">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        {beat.bpm} BPM · {beat.key} · {beat.genre} · MP3: {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => startEditingBeat(beat)}
                      className="p-2 text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Edit Beat Parameters"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {onDuplicateBeat && (
                      <button
                        onClick={() => {
                          onDuplicateBeat(beat.id);
                          triggerSaveState(`Duplicated "${beat.title}"`);
                        }}
                        className="p-2 text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Duplicate Beat"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onUpdateBeat) {
                          onUpdateBeat({ ...beat, published: beat.published === false });
                          triggerSaveState(beat.published === false ? `Published "${beat.title}"` : `Unpublished "${beat.title}"`);
                        }
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        beat.published !== false
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          : 'bg-purple-950 border-purple-500/40 text-purple-300'
                      }`}
                    >
                      {beat.published !== false ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => {
                        setConfirmModalData({
                          isOpen: true,
                          title: `Delete "${beat.title}"?`,
                          message: 'Are you sure you want to delete this beat track? This action cannot be undone.',
                          confirmLabel: 'Delete Beat Track',
                          onConfirm: () => {
                            onDeleteBeat(beat.id);
                            setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
                            triggerSaveState(`Deleted "${beat.title}"`);
                          },
                        });
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="Delete Beat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 4. BEAT PACKS TAB ==================== */}
        {activeTab === 'beatpacks' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">BEAT PACK BUNDLE MANAGEMENT</h2>
                <p className="text-xs text-zinc-500">Manage multi-audio stem packages and volume bundles.</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Upload Beat Pack ZIP</span>
              </button>
            </div>

            <div className="space-y-4">
              {beatPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={pack.artworkUrl}
                      alt={pack.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-white">{pack.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            pack.published
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {pack.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 max-w-md mt-1">{pack.description}</p>
                      <div className="font-mono text-xs text-purple-300 font-bold mt-2">
                        Price: {currencySymbol}{pack.price.toFixed(2)} · {pack.beatIds?.length || 0} Included Tracks
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onUpdateBeatPacks) {
                          const updated = beatPacks.map((p) => (p.id === pack.id ? { ...p, published: !p.published } : p));
                          onUpdateBeatPacks(updated);
                          triggerSaveState(pack.published ? `Unpublished ${pack.name}` : `Published ${pack.name}`);
                        }
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {pack.published ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => {
                        setConfirmModalData({
                          isOpen: true,
                          title: `Delete Beat Pack "${pack.name}"?`,
                          message: 'Are you sure you want to remove this beat pack archive?',
                          confirmLabel: 'Delete Pack',
                          onConfirm: () => {
                            if (onUpdateBeatPacks) {
                              onUpdateBeatPacks(beatPacks.filter((p) => p.id !== pack.id));
                              triggerSaveState(`Deleted ${pack.name}`);
                            }
                            setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
                          },
                        });
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="Delete Beat Pack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 5. COLLECTIONS TAB ==================== */}
        {activeTab === 'collections' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">REAL COLLECTIONS MANAGEMENT</h2>
                <p className="text-xs text-zinc-500">Organize beats and beat packs into curated storefront collections.</p>
              </div>
              <button
                onClick={() => setShowAddCollection(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Collection</span>
              </button>
            </div>

            {/* Create Collection Drawer / Form */}
            {showAddCollection && (
              <div className="p-6 bg-zinc-950 border border-purple-500/30 rounded-3xl space-y-4 animate-fadeIn">
                <h3 className="font-extrabold text-sm text-white uppercase">CREATE STOREFRONT COLLECTION</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="Collection Title (e.g. VELVET FASHION TRAP)"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    placeholder="Collection Description..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!newColTitle.trim()) return;
                        const newCol: BeatCollection = {
                          id: `col-${Date.now()}`,
                          title: newColTitle.trim(),
                          description: newColDesc.trim() || 'Curated storefront beat collection.',
                          artworkUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
                          beatIds: beats.slice(0, 3).map((b) => b.id),
                          published: true,
                        };
                        setCollections([newCol, ...collections]);
                        setNewColTitle('');
                        setNewColDesc('');
                        setShowAddCollection(false);
                        triggerSaveState('Collection Created');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Save Collection
                    </button>
                    <button
                      onClick={() => setShowAddCollection(false)}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map((col) => (
                <div key={col.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={col.artworkUrl} alt={col.title} className="w-12 h-12 rounded-xl object-cover border border-purple-500/20" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{col.title}</h4>
                      <p className="text-xs text-zinc-400">{col.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs font-mono text-zinc-500">
                    <span>{col.beatIds.length} Included Beats</span>
                    <button
                      onClick={() => {
                        setCollections(collections.filter((c) => c.id !== col.id));
                        triggerSaveState('Collection Removed');
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. AUDIO PLAYER & MASTERING TAB ==================== */}
        {activeTab === 'mastering' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">AUDIO PLAYER & MASTERING PARAMETERS</h2>
              <p className="text-xs text-zinc-500">Configure Web Audio DSP equalizer, dynamic limiting, and audition watermark intervals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <h3 className="font-bold text-sm text-white uppercase">Studio Equalizer (3-Band)</h3>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-zinc-400"><span>Low Shelf (80Hz):</span><span>{eqLow > 0 ? `+${eqLow}` : eqLow} dB</span></div>
                    <input type="range" min="-6" max="6" step="0.5" value={eqLow} onChange={(e) => setEqLow(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400"><span>Mid Parametric (1.2kHz):</span><span>{eqMid > 0 ? `+${eqMid}` : eqMid} dB</span></div>
                    <input type="range" min="-6" max="6" step="0.5" value={eqMid} onChange={(e) => setEqMid(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-400"><span>High Air (10kHz):</span><span>{eqHigh > 0 ? `+${eqHigh}` : eqHigh} dB</span></div>
                    <input type="range" min="-6" max="6" step="0.5" value={eqHigh} onChange={(e) => setEqHigh(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <h3 className="font-bold text-sm text-white uppercase">Audition Producer Tag Watermark</h3>
                <div className="space-y-3 text-xs">
                  <span className="text-zinc-400 block">Watermark Audio Tag Trigger Interval:</span>
                  <div className="flex gap-2">
                    {[10, 15, 30, 45].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          setWatermarkInterval(sec);
                          triggerSaveState(`Watermark Interval set to ${sec}s`);
                        }}
                        className={`px-3 py-2 rounded-xl font-mono font-bold cursor-pointer ${
                          watermarkInterval === sec ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        Every {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 7. COMMERCE: SALES & ORDERS ==================== */}
        {activeTab === 'sales' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">CONFIRMED SALES ORDERS</h2>
                <p className="text-xs text-zinc-500">Real completed transactions and escrow settlement logs.</p>
              </div>
              <button onClick={handleExportBuyersCSV} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-800 flex items-center gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>Export Buyer CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              {salesRecords.map((r) => (
                <div key={r.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white">{r.beatTitle} ({r.licenseType})</h4>
                    <span className="text-zinc-400 font-mono">{r.customerName} · {r.customerEmail} · Order #{r.orderId}</span>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <div className="text-purple-300">{currencySymbol}{r.amount.toFixed(2)}</div>
                    <div className="text-emerald-400 text-[10px]">{r.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 8. COMMERCE: ARTIST LEADS ==================== */}
        {activeTab === 'downloads' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">ARTIST LEADS CAPTURED</h2>
                <p className="text-xs text-zinc-500">Verified email addresses acquired from free download requests.</p>
              </div>
              <button onClick={handleExportLeads} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Export Leads CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              {leads.map((l) => (
                <div key={l.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white">{l.email}</h4>
                    <span className="text-zinc-400 font-mono">Downloaded: {l.beatTitle} · {l.downloadDate}</span>
                  </div>
                  <span className="font-mono text-purple-300 font-bold">{l.ipCountry}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 9. COMMERCE: CUSTOMER CRM ==================== */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">CUSTOMER CRM INBOX</h2>
              <p className="text-xs text-zinc-500">Direct artist communication and license negotiation inbox.</p>
            </div>

            <div className="space-y-4">
              {inboxMessages.map((msg) => (
                <div key={msg.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{msg.subject}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 font-mono font-bold uppercase">{msg.type}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{msg.customerName} ({msg.customerEmail}) · {msg.date}</p>
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    {msg.messages.map((m, idx) => (
                      <div key={idx} className={`p-3 rounded-xl text-xs ${m.sender === 'producer' ? 'bg-purple-950/40 text-purple-200 ml-6' : 'bg-zinc-900 text-zinc-300'}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 10. COMMERCE: COUPON CAMPAIGNS ==================== */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">COUPON CAMPAIGNS & PROMOTIONS</h2>
              <p className="text-xs text-zinc-500">Configure promotional discount codes for checkout.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-sm text-white uppercase">ADD NEW PROMO CODE</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} placeholder="PROMO CODE (e.g. VIP50)" className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase font-mono" />
                <input type="number" value={newPromoDiscount} onChange={(e) => setNewPromoDiscount(parseFloat(e.target.value))} placeholder="Discount %" className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                <button
                  onClick={() => {
                    if (!newPromoCode.trim()) return;
                    onAddPromotion({
                      id: `promo-${Date.now()}`,
                      code: newPromoCode.toUpperCase().trim(),
                      discountPercent: newPromoDiscount,
                      description: 'Custom promotional discount.',
                      expirationDate: newPromoExp,
                      active: true,
                      usageCount: 0,
                    });
                    setNewPromoCode('');
                    triggerSaveState('Promotion Code Created');
                  }}
                  className="py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {promotions.map((p) => (
                <div key={p.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-purple-300 text-sm">{p.code}</span>
                    <span className="text-zinc-400 block">{p.discountPercent}% Discount · Expires {p.expirationDate}</span>
                  </div>
                  <button onClick={() => onDeletePromotion(p.id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 11. COMMERCE: BESPOKE SERVICES ==================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">BESPOKE SERVICES & FREELANCE INTAKE</h2>
              <p className="text-xs text-zinc-500">Custom beat production, mixing, and mastering service tiers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{srv.title}</h4>
                    <span className="font-mono text-purple-300 font-bold">{currencySymbol}{srv.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{srv.description}</p>
                  <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                    Delivery Time: {srv.deliveryDays} Business Days
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 12. STOREFRONT: FEATURED CONTENT ==================== */}
        {activeTab === 'featured_content' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">FEATURED CONTENT & STOREFRONT PRESENTATION</h2>
              <p className="text-xs text-zinc-500">Select spotlight releases and pin beats to top storefront positions.</p>
            </div>

            <div className="space-y-3">
              {beats.map((beat) => (
                <div key={beat.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{beat.title}</h4>
                      <span className="text-zinc-400 font-mono">{beat.bpm} BPM · {beat.key}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onUpdateBeat) {
                        onUpdateBeat({ ...beat, featured: !beat.featured });
                        triggerSaveState(beat.featured ? `Unpinned ${beat.title}` : `Pinned ${beat.title} to Featured Spotlight`);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      beat.featured ? 'bg-purple-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {beat.featured ? 'Featured Spotlight' : 'Pin to Spotlight'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 13. STOREFRONT: YOUTUBE VIDEOS ==================== */}
        {activeTab === 'youtube_videos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">YOUTUBE VIDEOS EMBEDDING</h2>
              <p className="text-xs text-zinc-500">Embed studio visualizers and beat videos onto public store page.</p>
            </div>

            <form onSubmit={handleAddVideo} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-sm text-white uppercase">EMBED NEW YOUTUBE VIDEO</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="Video Title" className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                <input type="text" value={newVideoId} onChange={(e) => setNewVideoId(e.target.value)} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                Embed Video
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {youtubeVideos.map((v) => (
                <div key={v.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
                  <h4 className="font-bold text-white text-xs">{v.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">ID: {v.youtubeId} · Category: {v.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 14. PROFILE: PUBLIC PROFILE ==================== */}
        {activeTab === 'profile_settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">PUBLIC PRODUCER PROFILE SETTINGS</h2>
              <p className="text-xs text-zinc-500">Manage display branding, cover banners, bio description, and social media channels.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Producer Brand Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Handle / Username</label>
                  <input type="text" value={profileHandle} onChange={(e) => setProfileHandle(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Bio Description</label>
                <textarea rows={3} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Instagram Handle</label>
                  <input type="text" value={socialInsta} onChange={(e) => setSocialInsta(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">YouTube Channel URL</label>
                  <input type="text" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                </div>
              </div>

              <button onClick={handleSaveProfile} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer">
                Save Profile Settings
              </button>
            </div>
          </div>
        )}

        {/* ==================== 15. SETTINGS: STORE CONFIGURATION ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">STOREFRONT CONFIGURATION SETTINGS</h2>
              <p className="text-xs text-zinc-500">Store title, currency symbols, and invoice defaults.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Store Name</label>
                  <input type="text" value={settings.storeName} readOnly className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Currency Symbol</label>
                  <input type="text" value={settings.currencySymbol} readOnly className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 16. SETTINGS: PAYMENT INTEGRATIONS ==================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">DIRECT ESCROW PAYMENT GATEWAYS</h2>
              <p className="text-xs text-zinc-500">Connect Stripe and PayPal account credentials for automated payouts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">Stripe Express Payouts</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-zinc-400">Accept Credit Cards, Apple Pay, and Google Pay with zero extra platform fees.</p>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">PayPal Business API</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-zinc-400">Instant client payouts and buyer protection for international beat licensing.</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 17. SETTINGS: LEGAL CONTRACTS ==================== */}
        {activeTab === 'legal_services' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">LEGAL CONTRACTS & LICENSE AGREEMENTS</h2>
              <p className="text-xs text-zinc-500">Automated licensing contracts delivered to buyers upon checkout.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
              <h4 className="font-extrabold text-sm text-white">Standard MP3 & Premium Lease Contract</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Non-exclusive licensing agreement granting buyer non-exclusive rights for commercial distribution on streaming platforms.
              </p>
            </div>
          </div>
        )}

        {/* ==================== 18. SETTINGS: SPLITS & COPYRIGHT ==================== */}
        {activeTab === 'splits_copyright' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">SPLITS & COPYRIGHT MANAGEMENT</h2>
              <p className="text-xs text-zinc-500">PRO affiliations, Content ID protection, and multi-producer royalty splits.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-white">YouTube Content ID Protection</h4>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold">ACTIVE</span>
              </div>
              <p className="text-xs text-zinc-400">Automated copyright claim detection protecting your instrumental compositions.</p>
            </div>
          </div>
        )}

        {/* ==================== 19. SETTINGS: MARKETING & SECURITY ==================== */}
        {activeTab === 'marketing_security' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">MARKETING PIXELS & SECURITY BLOCKS</h2>
              <p className="text-xs text-zinc-500">Tracking pixel injection and automated transaction screening filters.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Google Analytics Measurement ID (G-ID)</label>
                <input type="text" value={googleAnalyticsId} onChange={(e) => setGoogleAnalyticsId(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Meta (Facebook) Pixel ID</label>
                <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">TikTok Pixel ID</label>
                <input type="text" value={tikTokPixelId} onChange={(e) => setTikTokPixelId(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
              </div>
              <button onClick={() => triggerSaveState('Tracking Pixels Updated')} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer">
                Save Tracking Pixels
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal Overlay */}
      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onPublishBeat={(newBeat) => {
            if (onPublishBeat) onPublishBeat(newBeat);
            setIsUploadModalOpen(false);
            triggerSaveState(`Published new beat "${newBeat.title}"`);
          }}
          currencySymbol={currencySymbol}
        />
      )}

      {/* Reusable Destructive Action Confirmation Modal */}
      {confirmModalData.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-white text-base">{confirmModalData.title}</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{confirmModalData.message}</p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={confirmModalData.onConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                {confirmModalData.confirmLabel}
              </button>
              <button
                onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-zinc-900 text-zinc-400 font-bold text-xs rounded-xl hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Beat Parameters Modal Overlay */}
      {editingBeat && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="font-brand font-black text-sm text-white uppercase tracking-wider">EDIT BEAT PARAMETERS</h3>
              <button onClick={() => setEditingBeat(null)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Beat Artwork</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                    <img src={editArtworkUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'} alt="Artwork" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file"
                    id="editBeatDeviceArtworkInput"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setEditArtworkUrl(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="editBeatDeviceArtworkInput"
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs text-center rounded-xl cursor-pointer transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload Device Image</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">BPM Tempo</label>
                  <input
                    type="number"
                    value={editBpm}
                    onChange={(e) => setEditBpm(parseInt(e.target.value) || 140)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Key Scale</label>
                  <input
                    type="text"
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">MP3 Lease ($)</label>
                  <input
                    type="number"
                    value={editPriceVal}
                    onChange={(e) => setEditPriceVal(parseFloat(e.target.value) || 29.99)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Unlimited Lease ($)</label>
                  <input
                    type="number"
                    value={editUnlimitedPrice}
                    onChange={(e) => setEditUnlimitedPrice(parseFloat(e.target.value) || 199.99)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span>Pin to Featured Spotlight</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span>Published on Storefront</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={saveEditedBeat}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingBeat(null)}
                className="px-4 py-2.5 bg-zinc-900 text-zinc-400 font-bold text-xs rounded-xl hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
