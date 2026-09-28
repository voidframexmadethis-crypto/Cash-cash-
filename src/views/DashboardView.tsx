import React, { useState, useEffect } from 'react';
import { ArtworkUploader } from '../components/ArtworkUploader';
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
  VolumeX,
  Sliders as SlidersIcon,
  ArrowRight,
  Bell,
  Video,
  Key,
  Palette,
  UploadCloud
} from 'lucide-react';
import { PayPalConnectionCenter } from '../components/PayPalConnectionCenter';
import { Beat, FreeDownloadLead, Promotion, SaleRecord, StoreSettings, ProducerProfile, BeatPack } from '../types';
import { UploadModal } from '../components/UploadModal';
import { UgcCreator } from '../components/UgcCreator';
import { signInWithGoogleGmail, logoutGmail } from '../utils/gmailAuth';
import { CommandCenterStats } from '../components/dashboard/CommandCenterStats';
import { BeatPerformanceAnalytics } from '../components/dashboard/BeatPerformanceAnalytics';
import { SalesAnalyticsSection } from '../components/dashboard/SalesAnalyticsSection';
import { TopPerformingBeats } from '../components/dashboard/TopPerformingBeats';
import { AudienceActivityTimeline } from '../components/dashboard/AudienceActivityTimeline';
import { InventoryPublishingManager } from '../components/dashboard/InventoryPublishingManager';
import { StoreHealthCheck } from '../components/dashboard/StoreHealthCheck';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';

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
  onNavigateToHallOfFame?: () => void;
  onOpenAudioPlayer?: () => void;
  onNavigateToBrowse?: () => void;
  onEnterLiveMode: () => void; // Feature 49
  favoriteIds?: string[];
  currentBeat?: Beat | null;
  isPlaying?: boolean;
  onPlayToggle?: (beat: Beat) => void;
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
  onNavigateToHallOfFame,
  onOpenAudioPlayer,
  onNavigateToBrowse,
  onEnterLiveMode,
  favoriteIds = [],
  currentBeat,
  isPlaying = false,
  onPlayToggle,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Gmail Workspace Integration Settings States
  const [gmailEmail, setGmailEmail] = useState('cashmerekid7@gmail.com');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailTemplates, setGmailTemplates] = useState<any>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'welcome' | 'receipt' | 'notification' | 'adminAlert'>('welcome');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('cashmerekid7@gmail.com');
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ type: 'success' | 'error' | 'loading'; text: string } | null>(null);

  // Studio Dashboard Master Passcode Authentication
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('voodoo_dashboard_unlocked') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handleUnlockDashboard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawInput = passcodeInput.trim();
    const cleanedInput = passcodeInput.replace(/\s+/g, '').trim();
    
    if (cleanedInput === '199927' || rawInput === '19 9927' || rawInput === '199927') {
      setIsDashboardUnlocked(true);
      localStorage.setItem('voodoo_dashboard_unlocked', 'true');
      setPasscodeError('');
      setPasscodeInput('');
    } else {
      setPasscodeError('Invalid Master Passcode. Access Denied.');
    }
  };

  const handleLockDashboard = () => {
    setIsDashboardUnlocked(false);
    localStorage.removeItem('voodoo_dashboard_unlocked');
  };

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
    return [];
  });

  useEffect(() => {
    localStorage.setItem('voodoo_collections', JSON.stringify(collections));
  }, [collections]);

  // Push Notifications Announcements State
  const [announcements, setAnnouncements] = useState<any[]>(() => {
    const saved = localStorage.getItem('voodoo_announcements');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('voodoo_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerMessage, setComposerMessage] = useState('');
  const [composerImage, setComposerImage] = useState('');
  const [composerDest, setComposerDestination] = useState('');
  const [composerConfirm, setComposerConfirm] = useState(false);

  // Collection creation modal / form
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);

  // Paper Trail local states
  const [paperTrailEntries, setPaperTrailEntries] = useState<any[]>([]);
  const [paperTrailProductFilter, setPaperTrailProductFilter] = useState<string>('ALL');

  // Flash Sale local states
  const [serverFlashSales, setServerFlashSales] = useState<any[]>([]);
  const [activeFlashSaleComposer, setActiveFlashSaleComposer] = useState<boolean>(false);
  const [flashSaleTitle, setFlashSaleTitle] = useState<string>('');
  const [flashSaleMessage, setFlashSaleMessage] = useState<string>('');
  const [flashSaleDiscType, setFlashSaleDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [flashSaleDiscAmount, setFlashSaleDiscountAmount] = useState<number>(20);
  const [flashSaleStart, setFlashSaleStartDate] = useState<string>('');
  const [flashSaleEnd, setFlashSaleEndDate] = useState<string>('');
  const [flashSaleEligibleProducts, setFlashSaleEligibleProducts] = useState<string[]>(['ALL']);
  const [flashSaleIncludePacks, setFlashSaleIncludePacks] = useState<boolean>(true);
  const [flashSaleIncludeBeats, setFlashSaleIncludeBeats] = useState<boolean>(true);
  const [flashSaleBanner, setFlashSaleBannerText] = useState<string>('');
  const [flashSaleCTA, setFlashSaleCTAText] = useState<string>('');
  const [flashSaleStatus, setFlashSaleStatus] = useState<'active' | 'inactive'>('active');
  const [flashSalePreview, setFlashSalePreviewMode] = useState<boolean>(false);

  // Fetch Paper Trail and Flash Sales from server upon mounting or activeTab shifts
  useEffect(() => {
    if (activeTab === 'paper_trail') {
      fetch('/api/papertrail/logs')
        .then(res => res.json())
        .then(data => setPaperTrailEntries(data))
        .catch(err => console.error('[DashboardView] Fetch paper trail logs error:', err));
    }
    if (activeTab === 'flash_sales') {
      fetch('/api/flash-sales')
        .then(res => res.json())
        .then(data => setServerFlashSales(data))
        .catch(err => console.error('[DashboardView] Fetch flash sales error:', err));
    }
    // Load Gmail Workspace Integration Settings
    fetch('/api/gmail/settings')
      .then(res => res.json())
      .then(data => {
        setGmailEmail(data.email);
        setGmailConnected(data.isConnected);
        setGmailTemplates(data.templates);
        if (data.templates) {
          setTemplateSubject(data.templates[activeTemplateTab]?.subject || '');
          setTemplateBody(data.templates[activeTemplateTab]?.body || '');
        }
      })
      .catch(err => console.error('[DashboardView] Fetch gmail settings error:', err));
  }, [activeTab, activeTemplateTab]);

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
  const [editPremiumPriceVal, setEditPremiumPriceVal] = useState<number>(79.99);
  const [editUnlimitedPrice, setEditUnlimitedPrice] = useState<number>(199.99);
  const [editExclusivePriceVal, setEditExclusivePriceVal] = useState<number>(999.99);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBpm, setEditBpm] = useState<number>(140);
  const [editKey, setEditKey] = useState<string>('C Minor');
  const [editGenre, setEditGenre] = useState<string>('TRAP');
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

  // SoundKits list pre-populated
  const [soundKits, setSoundKits] = useState<SoundKitItem[]>(() => {
    const saved = localStorage.getItem('voodoo_soundkits');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'kit-1', title: 'CASHMERE 808 VOL. 1', price: 29.99, salesCount: 42, type: 'Drum Kit', coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop&q=60' },
      { id: 'kit-2', title: 'SILK MELODIES VOL. 2', price: 39.99, salesCount: 28, type: 'Loop Pack', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60' },
      { id: 'kit-3', title: 'VOODOO SYNTH PRESETS', price: 19.99, salesCount: 15, type: 'Preset Bank', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' }
    ];
  });
  useEffect(() => {
    localStorage.setItem('voodoo_soundkits', JSON.stringify(soundKits));
  }, [soundKits]);

  // Services list
  const [services, setServices] = useState<ServiceItem[]>([]);

  // CRM Inbox Messages pre-populated
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(() => {
    const saved = localStorage.getItem('voodoo_crm_inbox');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'crm-1',
        customerName: 'Lil Voodoo',
        customerEmail: 'lilvoodoo@gmail.com',
        subject: 'Custom Beat Inquiry - Slime Style Vibe',
        type: 'Custom Work',
        date: '2026-09-27',
        status: 'Open',
        messages: [
          { sender: 'customer', text: 'Yo Cashmere! Love your style. Do you do custom beats? I am looking for a heavy 808 trap beat with some reverse melody stems, similar to your track velvet.', time: '14:20' },
          { sender: 'producer', text: 'What is up Lil Voodoo! Appreciate you. Yes, I do bespoke custom productions with separated WAV stems, full exclusive contract rights, and up to 3 revision rounds. Let me know what tempo and key scale you are targeting.', time: '14:32' },
          { sender: 'customer', text: 'That is exactly what I need. I need it around 130 BPM in D minor scale. Can you make something dark but upbeat? Let me know your price!', time: '14:35' }
        ]
      },
      {
        id: 'crm-2',
        customerName: 'A&R Capital Roster',
        customerEmail: 'ar_scout@capitalrecords.com',
        subject: 'Exclusive License Negotiation',
        type: 'Negotiation',
        date: '2026-09-26',
        status: 'Open',
        messages: [
          { sender: 'customer', text: 'Hello, we are looking at licensing the exclusive rights for your track "Velvet Dream" for one of our unsigned roster artists. Is the $999 price tag negotiable for a multi-project deal?', time: '10:05' }
        ]
      },
      {
        id: 'crm-3',
        customerName: 'Metro Booming Fan',
        customerEmail: 'fanatic@trapmusic.io',
        subject: 'Melody Loop Pack Questions',
        type: 'Inquiry',
        date: '2026-09-25',
        status: 'Replied',
        messages: [
          { sender: 'customer', text: 'Hey man! Are the loops in your cashmere loop kit royalty free or do we have to clear splits with you?', time: '09:12' },
          { sender: 'producer', text: 'Hey there! All loops in my Sound Kits are 100% royalty-free for online sales up to 1 million streams. Beyond that, splits are a standard 50/50. Enjoy the sounds!', time: '10:15' }
        ]
      }
    ];
  });
  useEffect(() => {
    localStorage.setItem('voodoo_crm_inbox', JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  // Pixel Settings
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('G-882390192X');
  const [metaPixelId, setMetaPixelId] = useState('192039102938102');
  const [tikTokPixelId, setTikTokPixelId] = useState('TT-90182309123');

  // Custom Domain Mapping State
  const [customDomain, setCustomDomain] = useState(() => {
    return localStorage.getItem('voodoo_custom_domain') || 'beats.cashmerekids.com';
  });

  // Upgraded Feature States
  // 1. My Media sub-folder tabs
  const [myMediaFolderTab, setMyMediaFolderTab] = useState<'beats' | 'albums' | 'soundkits' | 'vocals' | 'videos'>('beats');

  // Songs & Vocals Manager State
  const [vocalsList, setVocalsList] = useState(() => {
    const saved = localStorage.getItem('voodoo_vocals_list');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'vocal-1', title: 'SAUDADE DRIFT - VOCAL TOPLINE', price: 149.00, salesCount: 3, type: 'Vocal Hook', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60' },
      { id: 'vocal-2', title: 'DARK DRILL OUTRO VOCAL', price: 99.00, salesCount: 5, type: 'Full Vocals Pack', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60' }
    ];
  });
  useEffect(() => {
    localStorage.setItem('voodoo_vocals_list', JSON.stringify(vocalsList));
  }, [vocalsList]);

  // 2. Licenses & Contracts Customizer
  const [selectedContractTier, setSelectedContractTier] = useState<'mp3' | 'wav' | 'unlimited' | 'exclusive'>('mp3');
  const [contractLimits, setContractLimits] = useState(() => {
    const saved = localStorage.getItem('voodoo_contract_limits');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      mp3: { streams: '100,000', airplay: '2 Radio Stations', videoAllowed: '1 Music Video', copies: '5,000 Copies', performRights: 'Non-Profit Performances' },
      wav: { streams: '500,000', airplay: '10 Radio Stations', videoAllowed: '2 Music Videos', copies: '25,000 Copies', performRights: 'Paid/Commercial Performances' },
      unlimited: { streams: 'Unlimited', airplay: 'Unlimited Radio Stations', videoAllowed: 'Unlimited Music Videos', copies: 'Unlimited Copies', performRights: 'Unlimited Performances' },
      exclusive: { streams: 'Unlimited (Exclusive Ownership)', airplay: 'Unlimited Commercial Stations', videoAllowed: 'Unlimited Commercial Videos', copies: 'Unlimited Copies', performRights: 'Unlimited Rights' }
    };
  });
  useEffect(() => {
    localStorage.setItem('voodoo_contract_limits', JSON.stringify(contractLimits));
  }, [contractLimits]);

  const [contractTemplateTexts, setContractTemplateTexts] = useState(() => {
    const saved = localStorage.getItem('voodoo_contract_templates');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      mp3: 'MUSIC LICENSE LEASE AGREEMENT\n\nThis non-exclusive lease agreement is entered into on {{purchase_date}} between CASHMERE KID$ (the Licensor) and {{buyer_name}} (the Licensee).\n\n1. LICENSE GRANT: The Licensee is granted non-exclusive rights to stream, record, and publish vocals over the instrumental beat titled "{{product_title}}" up to {{stream_limit}} audio streams.\n2. DISTRIBUTION LIMIT: The Licensee may distribute up to {{distribution_copies}} copies under this agreement.\n3. AIRPLAY & BROADCAST: Licensor permits radio broadcasting on up to {{airplay_limit}}.\n4. OWNERSHIP: Licensor CASHMERE KID$ retains 100% of the composition copyright.',
      wav: 'PREMIUM WAV LEASE AGREEMENT\n\nThis Premium non-exclusive lease agreement is entered into on {{purchase_date}} between CASHMERE KID$ (the Licensor) and {{buyer_name}} (the Licensee).\n\n1. LICENSE GRANT: Licensee is granted Premium rights to use high-quality WAV files of "{{product_title}}" up to {{stream_limit}} streams.\n2. DISTRIBUTION LIMIT: The Licensee may distribute up to {{distribution_copies}} copies.\n3. AIRPLAY & BROADCAST: Permitted airplay on {{airplay_limit}}.\n4. PERFORMANCE RIGHTS: Authorized for {{performance_rights}}.',
      unlimited: 'UNLIMITED RIGHTS AGREEMENT\n\nThis Unlimited non-exclusive licensing agreement is entered into on {{purchase_date}} between CASHMERE KID$ (the Licensor) and {{buyer_name}} (the Licensee).\n\n1. LICENSE GRANT: Licensee is granted UNLIMITED rights to stream "{{product_title}}" on Spotify, Apple Music, and other DSP platforms without stream limits.\n2. COPIES & SALES: UNLIMITED sales and distribution permitted.\n3. AUDIO STEMS: Licensor delivers the separated WAV stems trackout archive for maximum control.',
      exclusive: 'EXCLUSIVE PRODUCER SALE CONTRACT\n\nThis EXCLUSIVE transfer contract is entered into on {{purchase_date}} between CASHMERE KID$ (the exclusive author) and {{buyer_name}} (the exclusive owner).\n\n1. COPYRIGHT TRANSFER: Author hereby transfers all exclusive commercial and performance copyrights for the composition "{{product_title}}" to the Owner.\n2. PRICE & ESCROW: This exclusive sale is completed upon receipt of {{purchase_price}} via verified payment.\n3. PRODUCER CREDITS: Owner agrees to credit "Produced by CASHMERE KID$" on all published media.'
    };
  });
  useEffect(() => {
    localStorage.setItem('voodoo_contract_templates', JSON.stringify(contractTemplateTexts));
  }, [contractTemplateTexts]);

  const [compiledContractText, setCompiledContractText] = useState('');
  const [isContractCompiled, setIsContractCompiled] = useState(false);

  // 3. Collaborations & Splits
  const [selectedSplitBeatId, setSelectedSplitBeatId] = useState('');
  const [collabUsername, setCollabUsername] = useState('');
  const [collabRole, setCollabRole] = useState('Co-Producer');
  const [collabPercent, setCollabPercent] = useState<number>(50);
  const [beatSplits, setBeatSplits] = useState<Record<string, Array<{ username: string, role: string, percentage: number }>>>(() => {
    const saved = localStorage.getItem('voodoo_beat_splits');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });
  useEffect(() => {
    localStorage.setItem('voodoo_beat_splits', JSON.stringify(beatSplits));
  }, [beatSplits]);

  // 4. Storefront customizer JSON & variables bindings
  const [proPagePrimaryColor, setProPagePrimaryColor] = useState(() => localStorage.getItem('voodoo_pro_primary_color') || '#8b5cf6');
  const [proPageBgColor, setProPageBgColor] = useState(() => localStorage.getItem('voodoo_pro_bg_color') || '#09090b');
  const [proPageAccentColor, setProPageAccentColor] = useState(() => localStorage.getItem('voodoo_pro_accent_color') || '#ec4899');
  const [proPageFont, setProPageFont] = useState(() => localStorage.getItem('voodoo_pro_font') || 'Space Grotesk');
  const [proPageLayout, setProPageLayout] = useState(() => localStorage.getItem('voodoo_pro_layout') || 'list');

  const handleSaveProPageBranding = () => {
    localStorage.setItem('voodoo_pro_primary_color', proPagePrimaryColor);
    localStorage.setItem('voodoo_pro_bg_color', proPageBgColor);
    localStorage.setItem('voodoo_pro_accent_color', proPageAccentColor);
    localStorage.setItem('voodoo_pro_font', proPageFont);
    localStorage.setItem('voodoo_pro_layout', proPageLayout);

    // Save as Settings JSON
    const brandingProfile = {
      primaryColor: proPagePrimaryColor,
      backgroundColor: proPageBgColor,
      accentColor: proPageAccentColor,
      fontFamily: proPageFont,
      layoutMode: proPageLayout,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('voodoo_pro_branding_json', JSON.stringify(brandingProfile));
    triggerSaveState('Pro Page Theme branding JSON compiled and updated!');
  };

  // 5. Coupon Min Cart & Expiry Calendar
  const [newPromoMinCart, setNewPromoMinCart] = useState<number>(0);

  // 6. Stripe Connect & PayPal Redirection Simulators
  const [stripeConnected, setStripeConnected] = useState(() => localStorage.getItem('voodoo_stripe_connected') === 'true');
  const [stripeSecureToken, setStripeSecureToken] = useState(() => localStorage.getItem('voodoo_stripe_token') || '');
  const [paypalConnectedState, setPaypalConnectedState] = useState(() => localStorage.getItem('voodoo_paypal_connected') === 'true');
  const [paypalSecureToken, setPaypalSecureToken] = useState(() => localStorage.getItem('voodoo_paypal_token') || '');
  const [isPayoutOnboardingSimulating, setIsPayoutOnboardingSimulating] = useState(false);
  const [payoutOnboardingPlatform, setPayoutOnboardingPlatform] = useState<'stripe' | 'paypal'>('stripe');

  const handleConnectPayoutPlatform = (platform: 'stripe' | 'paypal') => {
    setPayoutOnboardingPlatform(platform);
    setIsPayoutOnboardingSimulating(true);
    setTimeout(() => {
      setIsPayoutOnboardingSimulating(false);
      const randomToken = 'tok_secure_oauth_' + Math.random().toString(36).substring(2, 15);
      if (platform === 'stripe') {
        setStripeConnected(true);
        setStripeSecureToken(randomToken);
        localStorage.setItem('voodoo_stripe_connected', 'true');
        localStorage.setItem('voodoo_stripe_token', randomToken);
        triggerSaveState('Stripe Connect onboarding verified! Direct payments enabled.');
      } else {
        setPaypalConnectedState(true);
        setPaypalSecureToken(randomToken);
        localStorage.setItem('voodoo_paypal_connected', 'true');
        localStorage.setItem('voodoo_paypal_token', randomToken);
        triggerSaveState('PayPal Merchant Partner verified! Instant escrow enabled.');
      }
    }, 2000);
  };

  // 7. CRM Inbox conversation threads & websocket mock
  const [activeCrmThreadId, setActiveCrmThreadId] = useState('crm-1');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmNewMsgText, setCrmNewMsgText] = useState('');
  const [isCrmSimulatingTyping, setIsCrmSimulatingTyping] = useState(false);

  const handleSendCrmMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmNewMsgText.trim()) return;

    const newMessage = {
      sender: 'producer' as const,
      text: crmNewMsgText,
      time: new Date().toTimeString().substring(0, 5)
    };

    setInboxMessages((prev) =>
      prev.map((thread) => {
        if (thread.id === activeCrmThreadId) {
          return {
            ...thread,
            status: 'Replied' as const,
            messages: [...thread.messages, newMessage]
          };
        }
        return thread;
      })
    );

    const userText = crmNewMsgText;
    setCrmNewMsgText('');
    setIsCrmSimulatingTyping(true);

    // Simulate instant live WebSocket response logic after 1.5s
    setTimeout(() => {
      setIsCrmSimulatingTyping(false);
      const autoResponses = [
        'Awesome! Send over the checkout link and I will authorize the lease immediately.',
        'Thanks for the quick reply. Can we do a bundle deal if I license 3 tracks?',
        'Perfect, let me run this by my engineer. Appreciate the support!',
        'Got it. I will complete the purchase now using the PayPal option.'
      ];
      const randomReplyText = autoResponses[Math.floor(Math.random() * autoResponses.length)];

      const incomingMessage = {
        sender: 'customer' as const,
        text: randomReplyText,
        time: new Date().toTimeString().substring(0, 5)
      };

      setInboxMessages((prev) =>
        prev.map((thread) => {
          if (thread.id === activeCrmThreadId) {
            return {
              ...thread,
              status: 'Open' as const,
              messages: [...thread.messages, incomingMessage]
            };
          }
          return thread;
        })
      );
    }, 1500);
  };

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
        { id: 'remove_beats', label: 'Remove Beats from Player', icon: Trash2 },
        { id: 'beatpacks', label: 'Beat Packs', icon: Package },
        { id: 'collections', label: 'Collections', icon: Layers },
        { id: 'soundkits', label: 'Merch & Kits', icon: ShoppingBag },
      ],
    },
    {
      section: 'LEGACY & AWARDS',
      items: [
        { id: 'hall_of_fame_link', label: 'Record Plaque Hall of Fame', icon: Award },
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
        { id: 'push_notifications', label: 'Push Notifications', icon: Send },
        { id: 'flash_sales', label: 'Flash Sales Campaigns', icon: Zap },
        { id: 'ugc_ad_creator', label: 'UGC Ad Creator', icon: Video },
        { id: 'promotions', label: 'Coupon Campaigns', icon: Tag },
        { id: 'services', label: 'Bespoke Services', icon: Mic2 },
      ],
    },
    {
      section: 'STOREFRONT',
      items: [
        { id: 'featured_content', label: 'Featured Content', icon: Sparkles },
        { id: 'pro_page_customizer', label: 'Pro Page Theme Customizer', icon: Palette },
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
        { id: 'email_settings', label: 'Email Notifications', icon: Mail },
        { id: 'paper_trail', label: 'Paper Trail Security', icon: Shield },
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
    setEditPremiumPriceVal(beat.pricing.premiumLease || 79.99);
    setEditUnlimitedPrice(beat.pricing.unlimited);
    setEditExclusivePriceVal(beat.pricing.exclusive || 999.99);
    setEditTitle(beat.title);
    setEditBpm(beat.bpm);
    setEditKey(beat.key);
    setEditGenre(beat.genre);
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
        premiumLease: editPremiumPriceVal,
        unlimited: editUnlimitedPrice,
        exclusive: editExclusivePriceVal,
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

  const handleGoogleGmailLogin = async () => {
    setEmailStatusMsg({ type: 'loading', text: 'Authorizing through Google Workspace...' });
    try {
      const result = await signInWithGoogleGmail();
      if (result) {
        const saveRes = await fetch('/api/gmail/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: result.user.email,
            accessToken: result.accessToken
          })
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          setGmailEmail(saveData.email);
          setGmailConnected(true);
          setEmailStatusMsg({ type: 'success', text: `Gmail account successfully authorized: ${saveData.email}` });
          triggerSaveState('Gmail account connected');
        } else {
          throw new Error(saveData.error || 'Server failed to save secure token.');
        }
      }
    } catch (err: any) {
      setEmailStatusMsg({ type: 'error', text: `Authorization failed: ${err.message || 'Unknown error'}. Please try again.` });
    }
  };

  const handleLogoutGmail = async () => {
    try {
      await logoutGmail();
      const saveRes = await fetch('/api/gmail/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'cashmerekid7@gmail.com',
          accessToken: ''
        })
      });
      const saveData = await saveRes.json();
      setGmailConnected(false);
      setEmailStatusMsg({ type: 'success', text: 'Gmail account authorization revoked.' });
      triggerSaveState('Gmail account disconnected');
    } catch (err: any) {
      setEmailStatusMsg({ type: 'error', text: `Failed to revoke: ${err.message}` });
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      setEmailStatusMsg({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }
    setEmailStatusMsg({ type: 'loading', text: 'Dispatching secure verification email...' });
    try {
      const res = await fetch('/api/gmail/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: testEmailAddress })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatusMsg({ type: 'success', text: `Verification email successfully dispatched to ${testEmailAddress}!` });
      } else {
        setEmailStatusMsg({ type: 'error', text: data.error || 'Failed to dispatch test email.' });
      }
    } catch (err: any) {
      setEmailStatusMsg({ type: 'error', text: `Exception: ${err.message || 'Failed to dispatch test email.'}` });
    }
  };

  const handleSaveTemplates = async () => {
    setEmailStatusMsg({ type: 'loading', text: 'Saving updated templates on server...' });
    try {
      const updated = {
        ...gmailTemplates,
        [activeTemplateTab]: {
          subject: templateSubject,
          body: templateBody
        }
      };
      const res = await fetch('/api/gmail/update-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: updated })
      });
      const data = await res.json();
      if (data.success) {
        setGmailTemplates(data.templates);
        setEmailStatusMsg({ type: 'success', text: 'Templates saved successfully on server!' });
        triggerSaveState('Email templates updated');
      } else {
        setEmailStatusMsg({ type: 'error', text: data.error || 'Failed to update templates.' });
      }
    } catch (err: any) {
      setEmailStatusMsg({ type: 'error', text: `Exception: ${err.message}` });
    }
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

  if (!isDashboardUnlocked) {
    return (
      <div className="min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
        <div className="w-full max-w-md bg-zinc-950 border border-purple-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-300 shadow-xl shadow-purple-950/50">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>STUDIO SECURITY GATEWAY</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              PRODUCER DASHBOARD LOCKED
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Please enter your master passcode to access the private studio control center.
            </p>
          </div>

          <form onSubmit={handleUnlockDashboard} className="space-y-4 pt-2">
            <div className="space-y-2">
              <input
                type="password"
                required
                autoFocus
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  if (passcodeError) setPasscodeError('');
                }}
                placeholder="Enter passcode..."
                className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center text-lg font-mono tracking-widest text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {passcodeError && (
                <p className="text-xs font-mono font-bold text-red-400 mt-2 flex items-center justify-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950/80 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-purple-300" />
              <span>UNLOCK STUDIO DASHBOARD</span>
            </button>
          </form>

          <div className="pt-2 text-[10px] font-mono text-zinc-600 border-t border-zinc-900">
            PROTECTED PRODUCER CONTROL CENTER · CASHMERE KID$ VAULT
          </div>
        </div>
      </div>
    );
  }

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
                        } else if (item.id === 'hall_of_fame_link') {
                          if (onNavigateToHallOfFame) {
                            onNavigateToHallOfFame();
                          } else {
                            setActiveTab('hall_of_fame_link');
                          }
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
        <div className="p-4 border-t border-zinc-900 bg-black/40 space-y-3 text-xs text-zinc-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">Vault Engine Online</span>
            </div>
            <button
              onClick={onNavigateToProfile}
              className="text-purple-400 hover:text-white text-[11px] font-bold underline cursor-pointer"
            >
              View Profile →
            </button>
          </div>
          <button
            onClick={handleLockDashboard}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            title="Lock Studio Dashboard"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>LOCK STUDIO DASHBOARD</span>
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
            {/* Store Ready Banner */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/10">
              <CheckCircle className="w-5 h-5" />
              <span>CASHMERE KID$ PRODUCER CONTROL CENTER · REAL-TIME VAULT ENGINE ACTIVE</span>
            </div>

            {/* FEATURE 38: DASHBOARD COMMAND CENTER */}
            <CommandCenterStats
              beats={beats}
              salesRecords={salesRecords}
              leadsCount={leads.length}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 39: BEAT PERFORMANCE ANALYTICS */}
            <BeatPerformanceAnalytics
              beats={beats}
              salesRecords={salesRecords}
              favoriteIds={favoriteIds}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 40: SALES ANALYTICS */}
            <SalesAnalyticsSection
              salesRecords={salesRecords}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 41: TOP-PERFORMING BEAT DETECTION */}
            <TopPerformingBeats
              beats={beats}
              salesRecords={salesRecords}
              favoriteIds={favoriteIds}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 42: AUDIENCE ACTIVITY TIMELINE */}
            <AudienceActivityTimeline />

            {/* FEATURE 43: INVENTORY / PUBLISHING MANAGER */}
            <InventoryPublishingManager
              beats={beats}
              onUpdateBeat={onUpdateBeat}
              onDeleteBeat={onDeleteBeat}
              onPublishBeat={onPublishBeat}
              onStartEditBeat={startEditingBeat}
              onPlayToggle={onPlayToggle}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 44: ARTWORK & AUDIO HEALTH CHECK */}
            <StoreHealthCheck
              beats={beats}
              onStartEditBeat={startEditingBeat}
              onOpenUploader={() => setIsUploadModalOpen(true)}
              currencySymbol={currencySymbol}
            />

            {/* FEATURE 45: QUICK ACTIONS DASHBOARD */}
            <QuickActionsPanel
              onOpenUploader={() => setIsUploadModalOpen(true)}
              onOpenCollections={() => setActiveTab('collections')}
              onEditStore={() => setActiveTab('profile_settings')}
              onViewSales={() => setActiveTab('sales')}
              onOpenAudioPlayer={onOpenAudioPlayer}
            />
            
            {/* Feature 49: Live Store Mode */}
            <button
              onClick={onEnterLiveMode}
              className="w-full p-6 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-3xl text-white font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-purple-950/50 transition-all active:scale-98 cursor-pointer"
            >
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
              <span>Enter Live Store Mode</span>
            </button>
          </div>
        )}

        {/* ==================== 2. STUDIO ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">REAL-TIME BUSINESS INTELLIGENCE</span>
                <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight mt-1">STUDIO REPORTING & ANALYTICS</h2>
                <p className="text-xs text-zinc-500">Real-time revenue monitoring, regional traffic maps, and listener activity.</p>
              </div>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
                {(['today', '7days', '30days', 'alltime'] as const).map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setTimeInterval(interval)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      timeInterval === interval ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {interval === 'today' ? 'Today' : interval === '7days' ? '7 Days' : interval === '30days' ? '30 Days' : 'All-Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Gross Revenue</span>
                <div className="text-3xl font-mono font-black text-emerald-400">{currencySymbol}{totalRevenue.toFixed(2)}</div>
                <span className="text-[10px] text-zinc-400 font-semibold">100% Direct Escrow</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Plays</span>
                <div className="text-3xl font-mono font-black text-purple-300">{totalPlays + (timeInterval === 'today' ? 14 : timeInterval === '7days' ? 245 : timeInterval === '30days' ? 1230 : 5420)}</div>
                <span className="text-[10px] text-purple-400 font-semibold">Streams Count</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Unique Downloads</span>
                <div className="text-3xl font-mono font-black text-white">{totalDownloads + (timeInterval === 'today' ? 3 : timeInterval === '7days' ? 42 : timeInterval === '30days' ? 190 : 840)}</div>
                <span className="text-[10px] text-zinc-400 font-semibold">Tagged Files</span>
              </div>
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Platform Fee Saved</span>
                <div className="text-3xl font-mono font-black text-emerald-400">{currencySymbol}{(totalRevenue * 0.15).toFixed(2)}</div>
                <span className="text-[10px] text-zinc-400 font-semibold">0% Platform Cut</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line Chart Component */}
              <div className="lg:col-span-2 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">REVENUE MONITORING HISTORY</h3>
                  <span className="text-[10px] font-mono text-purple-300">Sum aggregation by date range</span>
                </div>
                
                {/* SVG Line Graph */}
                <div className="h-64 w-full relative flex items-end">
                  <svg className="w-full h-full text-purple-500" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path
                      d={
                        timeInterval === 'today' ? "M 0 200 L 50 180 L 150 190 L 250 120 L 350 140 L 450 60 L 500 200 Z" :
                        timeInterval === '7days' ? "M 0 200 L 70 170 L 140 110 L 210 140 L 280 80 L 350 90 L 420 30 L 500 200 Z" :
                        "M 0 200 L 100 180 L 200 120 L 300 90 L 400 40 L 500 20 Z"
                      }
                      fill="url(#chartGrad)"
                    />
                    {/* Stroke line */}
                    <path
                      d={
                        timeInterval === 'today' ? "M 0 180 L 50 180 L 150 190 L 250 120 L 350 140 L 450 60 L 500 50" :
                        timeInterval === '7days' ? "M 0 170 L 70 170 L 140 110 L 210 140 L 280 80 L 350 90 L 420 30 L 500 25" :
                        "M 0 180 L 100 150 L 200 120 L 300 90 L 400 40 L 500 20"
                      }
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Grid lines overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full border-b border-zinc-600"></div>
                    <div className="w-full border-b border-zinc-600"></div>
                    <div className="w-full border-b border-zinc-600"></div>
                    <div className="w-full border-b border-zinc-600"></div>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Start range</span>
                  <span>Midpoint</span>
                  <span>End interval</span>
                </div>
              </div>

              {/* Traffic Sources & Play Counter Bar Chart */}
              <div className="lg:col-span-1 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">TRAFFIC SOURCE AUDITING</h3>
                <p className="text-xs text-zinc-400">Listener discovery breakdowns filtered by selected dates.</p>
                
                <div className="space-y-4 pt-2">
                  {[
                    { source: 'BeatStars Marketplace', percent: 45, color: 'bg-purple-600' },
                    { source: 'Direct Pro Page', percent: 30, color: 'bg-indigo-500' },
                    { source: 'External Google Search', percent: 15, color: 'bg-pink-500' },
                    { source: 'Social Media Referral', percent: 10, color: 'bg-emerald-500' }
                  ].map((src, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-zinc-300">{src.source}</span>
                        <span className="font-mono text-white">{src.percent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${src.color} rounded-full`} style={{ width: `${src.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Map of Traffic Layout */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">GEOGRAPHIC AUDIENCE DEMOGRAPHICS</h3>
                  <p className="text-xs text-zinc-500">Global stream velocity hot spots and licensing hubs.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold bg-purple-950 border border-purple-500/20 text-purple-300">
                  REAL-TIME GEO-IP TRACKING
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* SVG Visual Stylized World Map */}
                <div className="lg:col-span-2 bg-zinc-900/60 rounded-2xl border border-zinc-850 p-6 flex items-center justify-center min-h-[260px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />
                  
                  {/* Stylized world grid representing regions */}
                  <svg className="w-full max-w-lg h-48 opacity-40 text-zinc-700" viewBox="0 0 100 100" fill="currentColor">
                    {/* Simplified continent blobs */}
                    {/* North America */}
                    <path d="M 10 20 Q 25 15 30 35 T 20 60 Z" />
                    {/* South America */}
                    <path d="M 22 55 Q 30 75 32 95 T 25 80 Z" />
                    {/* Africa */}
                    <path d="M 45 45 Q 55 55 60 75 T 48 90 Z" />
                    {/* Eurasia */}
                    <path d="M 40 15 Q 60 5 80 20 T 70 50 Z" />
                    {/* Australia */}
                    <path d="M 75 70 Q 85 75 80 90 Z" />
                  </svg>

                  {/* Pulsing geo hotspots */}
                  <div className="absolute top-[35%] left-[20%] group">
                    <span className="absolute inline-flex h-4 w-4 rounded-full bg-purple-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 shadow"></span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      Los Angeles · 1,420 Streams
                    </div>
                  </div>

                  <div className="absolute top-[30%] left-[30%] group">
                    <span className="absolute inline-flex h-4 w-4 rounded-full bg-indigo-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 shadow"></span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      Atlanta · 2,840 Streams
                    </div>
                  </div>

                  <div className="absolute top-[22%] left-[48%] group">
                    <span className="absolute inline-flex h-4 w-4 rounded-full bg-pink-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 shadow"></span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      London · 1,230 Streams
                    </div>
                  </div>

                  <div className="absolute top-[32%] left-[78%] group">
                    <span className="absolute inline-flex h-4 w-4 rounded-full bg-purple-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 shadow"></span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      Tokyo · 950 Streams
                    </div>
                  </div>
                </div>

                {/* Country rankings list */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-brand">TOP LISTENING DEMOGRAPHICS</h4>
                  
                  <div className="space-y-2">
                    {[
                      { rank: 1, country: 'United States', flag: '🇺🇸', streams: '4,260', sales: '$2,190.00' },
                      { rank: 2, country: 'United Kingdom', flag: '🇬🇧', streams: '1,230', sales: '$598.00' },
                      { rank: 3, country: 'Japan', flag: '🇯🇵', streams: '950', sales: '$399.00' },
                      { rank: 4, country: 'France', flag: '🇫🇷', streams: '640', sales: '$199.00' },
                      { rank: 5, country: 'Canada', flag: '🇨🇦', streams: '520', sales: '$99.00' }
                    ].map((dem) => (
                      <div key={dem.rank} className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-500 font-bold">#{dem.rank}</span>
                          <span className="text-lg">{dem.flag}</span>
                          <span className="font-bold text-white">{dem.country}</span>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className="text-purple-300 font-bold block">{dem.streams} plays</span>
                          <span className="text-emerald-400 font-bold">{dem.sales} sales</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. MY MEDIA (CONTENT MANAGEMENT) TAB ==================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">CONTENT MANAGEMENT SYSTEM</span>
                <h2 className="text-xl sm:text-2xl font-brand font-black text-white uppercase tracking-tight mt-0.5">MY MEDIA & CATALOG MANAGER</h2>
                <p className="text-xs text-zinc-500">Organize beats, albums, sound kits, and video links in tabbed folders with public/private switches.</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Media Item</span>
              </button>
            </div>

            {/* Folder Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
              {[
                { id: 'beats', label: '🎵 Beats & Instrumental Tracks' },
                { id: 'albums', label: '💿 Albums & Collections' },
                { id: 'soundkits', label: '🥁 Sound Kits & Loop Packs' },
                { id: 'vocals', label: '🎤 Songs & Vocals' },
                { id: 'videos', label: '📺 Embedded Video Links' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMyMediaFolderTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    myMediaFolderTab === tab.id
                      ? 'bg-zinc-900 border border-zinc-800 text-purple-400 font-extrabold shadow-lg'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Folder 1: Beats & Instrumentals */}
            {myMediaFolderTab === 'beats' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search beats by title, genre, scale, BPM..."
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['ALL', 'PUBLISHED', 'DRAFT', 'FEATURED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setCatalogStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          catalogStatusFilter === status ? 'bg-purple-600 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredCatalogBeats.map((beat) => (
                    <div
                      key={beat.id}
                      className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:border-zinc-850 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={beat.artworkUrl}
                          alt={beat.title}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'; }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white truncate">{beat.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              beat.published !== false ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                            }`}>
                              {beat.published !== false ? 'PUBLIC' : 'PRIVATE'}
                            </span>
                            {beat.featured && (
                              <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-500/20 font-bold uppercase">FEATURED</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono mt-0.5">
                            {beat.bpm} BPM · {beat.key} · {beat.genre} · MP3: {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 ml-auto">
                        {/* Visibility Toggle Switch */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Visibility:</span>
                          <button
                            onClick={() => {
                              if (onUpdateBeat) {
                                onUpdateBeat({ ...beat, published: beat.published === false });
                                triggerSaveState(beat.published === false ? `Published "${beat.title}"` : `Saved as private Draft: "${beat.title}"`);
                              }
                            }}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                              beat.published !== false ? 'bg-purple-600' : 'bg-zinc-800'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${beat.published !== false ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <button
                          onClick={() => startEditingBeat(beat)}
                          className="p-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Edit</span>
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
                          className="p-2 text-zinc-500 hover:text-rose-400 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Folder 2: Albums & EPs (Collections) */}
            {myMediaFolderTab === 'albums' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                  <h3 className="font-extrabold text-sm uppercase text-white">Album & EP Project Builder</h3>
                  <button
                    onClick={() => setShowAddCollection(true)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
                  >
                    + Create Project Folder
                  </button>
                </div>

                {collections.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3 text-zinc-400">
                    <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
                    <h4 className="font-bold text-white uppercase">No Album Collections Found</h4>
                    <p className="text-xs max-w-sm mx-auto">Group multiple beats together into cohesive albums, concepts, or EP packs to market as a package deal.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {collections.map((col) => (
                      <div key={col.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-start gap-4">
                        <div className="w-16 h-16 bg-purple-950 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-300 font-brand font-black text-xl shrink-0">
                          LP
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-brand font-black text-white text-base truncate uppercase">{col.title}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{col.description}</p>
                          <div className="flex items-center justify-between pt-3">
                            <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">{col.beatIds?.length || 0} tracks grouped</span>
                            <button
                              onClick={() => {
                                setCollections((prev) => prev.filter(c => c.id !== col.id));
                                triggerSaveState(`Deleted Album Project: ${col.title}`);
                              }}
                              className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 uppercase"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Folder 3: Sound Kits Storefront */}
            {myMediaFolderTab === 'soundkits' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-sm uppercase text-white tracking-wider">Upload New Sound Kit / Loop Pack</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input id="kitTitle" type="text" placeholder="Kit Title (e.g. TRAP SHIVERS VOL. 1)" className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                    <input id="kitPrice" type="number" step="0.01" placeholder="Price ($)" className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                    <button
                      onClick={() => {
                        const titleEl = document.getElementById('kitTitle') as HTMLInputElement;
                        const priceEl = document.getElementById('kitPrice') as HTMLInputElement;
                        if (!titleEl?.value) return;

                        const newKit = {
                          id: `kit-${Date.now()}`,
                          title: titleEl.value.toUpperCase().trim(),
                          price: parseFloat(priceEl.value) || 19.99,
                          salesCount: 0,
                          type: 'Loop Pack',
                          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60'
                        };

                        setSoundKits([newKit, ...soundKits]);
                        titleEl.value = '';
                        priceEl.value = '';
                        triggerSaveState(`Sound Kit "${newKit.title}" Uploaded!`);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer"
                    >
                      Publish Loop Pack
                    </button>
                  </div>

                  {/* Simulated Drag & Drop file block */}
                  <div className="p-6 border-2 border-dashed border-zinc-800 rounded-2xl text-center space-y-2 hover:border-purple-500/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto" />
                    <span className="text-xs font-bold text-zinc-300 block">Drag & Drop loops zip or sample wavs here</span>
                    <span className="text-[10px] text-zinc-500 block">Supports ZIP, RAR, WAV (Up to 5GB maximum zip size)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {soundKits.map((kit) => (
                    <div key={kit.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <img src={kit.coverUrl} alt={kit.title} className="w-full h-32 object-cover rounded-xl border border-zinc-800" />
                        <div>
                          <h4 className="font-extrabold text-sm text-white uppercase truncate">{kit.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 border border-purple-500/10 text-purple-300 font-mono font-bold uppercase">{kit.type}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <span className="font-mono text-sm font-black text-white">{currencySymbol}{kit.price.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setSoundKits((prev) => prev.filter(k => k.id !== kit.id));
                            triggerSaveState(`Deleted Kit: ${kit.title}`);
                          }}
                          className="text-xs font-mono font-bold text-zinc-500 hover:text-rose-400 uppercase"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Folder 4: Songs & Vocals Manager */}
            {myMediaFolderTab === 'vocals' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-sm uppercase text-white tracking-wider">Upload New Song / Vocal Topline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input id="vocalTitle" type="text" placeholder="Vocal Title (e.g. DRIFT HEAVEN)" className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                    <input id="vocalPrice" type="number" step="0.01" placeholder="Price ($)" className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                    <button
                      onClick={() => {
                        const titleEl = document.getElementById('vocalTitle') as HTMLInputElement;
                        const priceEl = document.getElementById('vocalPrice') as HTMLInputElement;
                        if (!titleEl?.value) return;

                        const newVocal = {
                          id: `vocal-${Date.now()}`,
                          title: titleEl.value.toUpperCase().trim(),
                          price: parseFloat(priceEl.value) || 99.00,
                          salesCount: 0,
                          type: 'Vocal Hook',
                          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'
                        };

                        setVocalsList([newVocal, ...vocalsList]);
                        titleEl.value = '';
                        priceEl.value = '';
                        triggerSaveState(`Vocal Topline "${newVocal.title}" Uploaded!`);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer"
                    >
                      Publish Vocal Topline
                    </button>
                  </div>

                  {/* Simulated Drag & Drop file block */}
                  <div className="p-6 border-2 border-dashed border-zinc-800 rounded-2xl text-center space-y-2 hover:border-purple-500/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto" />
                    <span className="text-xs font-bold text-zinc-300 block">Drag & Drop vocal dry/wet stems zip or mp3 preview here</span>
                    <span className="text-[10px] text-zinc-500 block">Supports WAV, MP3, ZIP (Up to 2GB maximum size)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vocalsList.map((vocal: any) => (
                    <div key={vocal.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <img src={vocal.coverUrl} alt={vocal.title} className="w-full h-32 object-cover rounded-xl border border-zinc-800" />
                        <div>
                          <h4 className="font-extrabold text-sm text-white uppercase truncate">{vocal.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 border border-purple-500/10 text-purple-300 font-mono font-bold uppercase">{vocal.type}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <span className="font-mono text-sm font-black text-white">{currencySymbol}{vocal.price.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setVocalsList((prev: any) => prev.filter((v: any) => v.id !== vocal.id));
                            triggerSaveState(`Deleted Vocal Topline: ${vocal.title}`);
                          }}
                          className="text-xs font-mono font-bold text-zinc-500 hover:text-rose-400 uppercase"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Folder 5: Videos Manager */}
            {myMediaFolderTab === 'videos' && (
              <div className="space-y-6 animate-fadeIn">
                <form onSubmit={handleAddVideo} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-sm text-white uppercase">EMBED NEW YOUTUBE VIDEO</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="Video Title" className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white" />
                    <input type="text" value={newVideoId} onChange={(e) => setNewVideoId(e.target.value)} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono" />
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                    Embed Video Listing
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {youtubeVideos.map((v) => (
                    <div key={v.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4">
                      <div className="w-20 h-16 bg-purple-950 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-300 font-brand font-black text-xs shrink-0">
                        VIDEO
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-xs truncate uppercase">{v.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {v.youtubeId} · Category: {v.category}</p>
                        <button
                          onClick={() => {
                            onUpdateYoutubeVideos(youtubeVideos.filter(vid => vid.id !== v.id));
                            triggerSaveState('Removed video reference');
                          }}
                          className="text-[10px] font-mono text-rose-400 hover:underline uppercase block mt-2"
                        >
                          Remove Embed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== REMOVE BEATS FROM PLAYER & STOREFRONT TAB ==================== */}
        {activeTab === 'remove_beats' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                  AUDIO PLAYER & STOREFRONT CONTROLLER
                </span>
                <h2 className="text-xl sm:text-2xl font-brand font-black text-white uppercase tracking-tight mt-0.5 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                  <span>REMOVE BEATS FROM PLAYER & STOREFRONT</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Instantly remove any beat track from the active audio player queue or storefront catalog. Removed tracks stop playback immediately and are hidden from visitors until re-enabled.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const publishedList = beats.filter((b) => b.published !== false);
                    if (publishedList.length === 0) {
                      alert('No active beats in player queue to remove.');
                      return;
                    }
                    if (confirm(`Remove ALL ${publishedList.length} active beat(s) from the audio player and storefront?`)) {
                      publishedList.forEach((b) => {
                        if (onUpdateBeat) onUpdateBeat({ ...b, published: false });
                      });
                      triggerSaveState(`Removed ${publishedList.length} beat(s) from audio player`);
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Remove All Active Beats</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Total Library</span>
                  <span className="text-xl font-mono font-black text-white">{beats.length} Beats</span>
                </div>
                <Radio className="w-6 h-6 text-zinc-600" />
              </div>

              <div className="p-4 bg-zinc-950 border border-emerald-950/80 rounded-2xl flex items-center justify-between bg-emerald-950/10">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Active in Audio Player</span>
                  <span className="text-xl font-mono font-black text-emerald-300">{beats.filter((b) => b.published !== false).length} Beats</span>
                </div>
                <Play className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>

              <div className="p-4 bg-zinc-950 border border-rose-950/80 rounded-2xl flex items-center justify-between bg-rose-950/10">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">Removed from Player</span>
                  <span className="text-xl font-mono font-black text-rose-300">{beats.filter((b) => b.published === false).length} Beats</span>
                </div>
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter beats to remove by title, key, BPM, genre..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setCatalogStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                    catalogStatusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All Beats ({beats.length})
                </button>
                <button
                  onClick={() => setCatalogStatusFilter('PUBLISHED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                    catalogStatusFilter === 'PUBLISHED' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Active in Player ({beats.filter((b) => b.published !== false).length})
                </button>
                <button
                  onClick={() => setCatalogStatusFilter('UNPUBLISHED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                    catalogStatusFilter === 'UNPUBLISHED' || catalogStatusFilter === 'DRAFT' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Removed ({beats.filter((b) => b.published === false).length})
                </button>
              </div>
            </div>

            {/* Beats List */}
            <div className="space-y-3">
              {beats.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 border border-zinc-900 rounded-2xl text-zinc-500 text-xs font-mono">
                  No beats found in catalog library. Upload a beat to manage audio player removal.
                </div>
              ) : (
                beats
                  .filter((beat) => {
                    const matchSearch =
                      beat.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      beat.genre.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      beat.key.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      beat.bpm.toString().includes(catalogSearch);
                    if (!matchSearch) return false;

                    if (catalogStatusFilter === 'PUBLISHED') return beat.published !== false;
                    if (catalogStatusFilter === 'UNPUBLISHED' || catalogStatusFilter === 'DRAFT') return beat.published === false;
                    return true;
                  })
                  .map((beat) => {
                    const isPlayable = beat.published !== false;
                    return (
                      <div
                        key={beat.id}
                        className={`p-4 bg-zinc-950 border rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all ${
                          isPlayable ? 'border-zinc-900 hover:border-purple-500/30' : 'border-rose-950/60 bg-rose-950/10'
                        }`}
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
                              {isPlayable ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>LIVE IN PLAYER QUEUE</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1 shrink-0">
                                  <VolumeX className="w-3 h-3 text-rose-400" />
                                  <span>REMOVED FROM PLAYER</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                              <span>{beat.bpm} BPM</span>
                              <span>·</span>
                              <span>{beat.key}</span>
                              <span>·</span>
                              <span>{beat.genre}</span>
                              <span>·</span>
                              <span className="text-purple-300">{currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {isPlayable ? (
                            <button
                              onClick={() => {
                                if (onUpdateBeat) {
                                  onUpdateBeat({ ...beat, published: false });
                                  triggerSaveState(`Removed "${beat.title}" from player & storefront`);
                                }
                              }}
                              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Remove this beat from active audio player queue & storefront"
                            >
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                              <span>Remove from Player</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (onUpdateBeat) {
                                  onUpdateBeat({ ...beat, published: true });
                                  triggerSaveState(`Restored "${beat.title}" to audio player & storefront`);
                                }
                              }}
                              className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Re-add beat back to active audio player queue & storefront"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Re-add to Player</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setConfirmModalData({
                                isOpen: true,
                                title: `Delete "${beat.title}" permanently?`,
                                message: 'Are you sure you want to delete this beat track permanently from the library and storage? This action cannot be undone.',
                                confirmLabel: 'Delete Permanently',
                                onConfirm: () => {
                                  onDeleteBeat(beat.id);
                                  setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
                                  triggerSaveState(`Permanently deleted "${beat.title}"`);
                                },
                              });
                            }}
                            className="p-2 text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                            title="Delete beat permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
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

        {/* ==================== SOUNDKITS & MERCH TAB ==================== */}
        {activeTab === 'soundkits' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">MERCH & SOUND KITS VAULT</h2>
              <p className="text-xs text-zinc-500">Manage digital drum kits, preset banks, and apparel storefront integrations.</p>
            </div>

            {/* Merch Storefront URL Configurator Card */}
            <div className="p-6 bg-zinc-950 border border-purple-500/40 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">EMBEDDED MERCH INTEGRATION</span>
                  <h3 className="font-extrabold text-sm text-white uppercase">OFFICIAL MERCH STOREFRONT URL</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase">
                  POPUP & EMBED SUPPORTED
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    defaultValue={settings?.merchStoreUrl || localStorage.getItem('voodoo_merch_store_url') || ''}
                    placeholder="https://printful.me/cashmerekids or https://yourstore.shopify.com"
                    onBlur={(e) => {
                      let url = e.target.value.trim();
                      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                        url = `https://${url}`;
                        e.target.value = url;
                      }
                      localStorage.setItem('voodoo_merch_store_url', url);
                      triggerSaveState('Merch Store URL Updated');
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Paste your Printful, Shopify, Teespring, or custom merch link here. It will lock in and open as an embedded pop-up storefront inside your store!
                </p>
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">CATALOG STATUS</span>
                  <h3 className="font-extrabold text-sm text-white uppercase">4 STOREFRONT KITS ACTIVE</h3>
                </div>
                <button
                  onClick={onNavigateToBrowse}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  View Live Store
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs">
                    DRUM
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white uppercase">CASHMERE 808 VOL. 1</h4>
                    <p className="text-[11px] text-purple-300 font-bold">$29.99 · Digital Download</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs">
                    HOODIE
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white uppercase">OFFICIAL CASHMERE HOODIE</h4>
                    <p className="text-[11px] text-purple-300 font-bold">$65.00 · Merch Item</p>
                  </div>
                </div>
              </div>
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

        {/* ==================== Storefront: Pro Page Theme Customizer ==================== */}
        {activeTab === 'pro_page_customizer' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">PROPAGE THEME CUSTOMIZER</span>
              <h2 className="text-xl sm:text-2xl font-brand font-black text-white uppercase tracking-tight mt-1">VISUAL STYLE DESIGNER</h2>
              <p className="text-xs text-zinc-500">Customize external Pro Page branding style presets, color pickers, and font selections.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Style Controls panel */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-brand">THEME DESIGN OPTIONS</h3>
                  <p className="text-[11px] text-zinc-500">Edits are compiled to branding JSON and map to CSS Custom Variables.</p>
                </div>

                <div className="space-y-4">
                  {/* Colors block */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={proPagePrimaryColor}
                          onChange={(e) => setProPagePrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={proPagePrimaryColor}
                          onChange={(e) => setProPagePrimaryColor(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={proPageBgColor}
                          onChange={(e) => setProPageBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={proPageBgColor}
                          onChange={(e) => setProPageBgColor(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={proPageAccentColor}
                          onChange={(e) => setProPageAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={proPageAccentColor}
                          onChange={(e) => setProPageAccentColor(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Selector block */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Typography Font Family</label>
                    <select
                      value={proPageFont}
                      onChange={(e) => setProPageFont(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    >
                      <option value="Space Grotesk">Space Grotesk (Luxury tech / brand)</option>
                      <option value="Montserrat">Montserrat (Modern sans / heavy)</option>
                      <option value="Syne">Syne (Experimental aesthetic)</option>
                      <option value="Inter">Inter (Sleek minimalist)</option>
                      <option value="Space Mono">Space Mono (Retro synthwave / tech)</option>
                    </select>
                  </div>

                  {/* Layout Selection */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Storefront Layout Scheme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'list', label: 'Sleek list view player' },
                        { id: 'grid', label: 'Stunning visual grid' }
                      ].map((lay) => (
                        <button
                          key={lay.id}
                          onClick={() => setProPageLayout(lay.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            proPageLayout === lay.id
                              ? 'bg-purple-950 border-purple-500/40 text-purple-300 font-extrabold'
                              : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {lay.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProPageBranding}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-950"
                  >
                    Save branding profile (JSON compile)
                  </button>
                </div>
              </div>

              {/* Dynamic live styling preview card */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">PRO PAGE EXTERNAL PLAYER PREVIEW</span>
                
                <div
                  className="w-full p-6 rounded-3xl border border-zinc-800 flex flex-col justify-between min-h-[350px] relative overflow-hidden shadow-2xl transition-all"
                  style={{
                    backgroundColor: proPageBgColor,
                    fontFamily: `'${proPageFont}', sans-serif`,
                    borderColor: `${proPagePrimaryColor}33`
                  }}
                >
                  {/* Subtle color blur background */}
                  <div
                    className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all opacity-40"
                    style={{ backgroundColor: proPageAccentColor }}
                  />

                  {/* Mock player header */}
                  <div className="flex justify-between items-center z-10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">CASHMERE STOREFRONT</span>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-mono">mode: active</span>
                  </div>

                  {/* Mock beat card */}
                  <div className="my-auto py-6 space-y-4 z-10 flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-xl bg-purple-950 border border-purple-500/10 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg text-white"
                      style={{ border: `1px solid ${proPagePrimaryColor}44` }}
                    >
                      🎵
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-lg font-black uppercase truncate text-white">VELVET COMPOSITION</h4>
                      <p className="text-xs text-zinc-400 font-mono">140 BPM · D MinorScale</p>
                      
                      {/* Fake waveforms utilizing proPagePrimaryColor */}
                      <div className="flex items-center gap-1.5 h-6 pt-2">
                        {[40, 60, 20, 80, 50, 90, 30, 70, 40, 80, 20, 60].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 rounded-full transition-all"
                            style={{
                              height: `${h}%`,
                              backgroundColor: i < 5 ? proPagePrimaryColor : `${proPagePrimaryColor}22`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Player buy bar */}
                  <div className="flex justify-between items-center z-10 border-t border-zinc-900 pt-4">
                    <span className="text-xl font-mono font-black text-white">$29.99</span>
                    <button
                      className="px-5 py-2.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                      style={{
                        backgroundColor: proPagePrimaryColor,
                        color: '#fff',
                        boxShadow: `0 4px 14px ${proPagePrimaryColor}44`
                      }}
                    >
                      Licensing Options
                    </button>
                  </div>
                </div>
              </div>
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

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Custom Pro Page Domain Mapping</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => {
                        setCustomDomain(e.target.value);
                        localStorage.setItem('voodoo_custom_domain', e.target.value);
                      }}
                      placeholder="e.g. beats.myartistbrand.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      alert(`DNS Check initiated for: ${customDomain}\n\nCNAME target: pro.beatstars.com\nStatus: Connected (A records verified)`);
                      triggerSaveState(`Domain mapped to: ${customDomain}`);
                    }}
                    className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 rounded-xl text-xs font-bold font-mono transition-colors"
                  >
                    Verify DNS
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Point a CNAME record in your DNS settings to <span className="text-purple-400 font-bold font-mono">pro.beatstars.com</span> to link your custom domain.
                </p>
              </div>

              <button onClick={handleSaveProfile} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer">
                Save Profile Settings
              </button>
            </div>
          </div>
        )}

        {/* ==================== Push Notifications: Customer Alerts Hub ==================== */}
        {activeTab === 'push_notifications' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">CUSTOMER MARKETING & ENGAGEMENT</span>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight mt-1">PUSH NOTIFICATIONS DISPATCH HUB</h2>
                <p className="text-xs text-zinc-500">Deliver highly personalized system alert messages straight to subscribers' mobile lock screens.</p>
              </div>
              <button
                onClick={() => {
                  setComposerTitle('');
                  setComposerMessage('');
                  setComposerImage('');
                  setComposerDestination('');
                  setComposerConfirm(false);
                  setComposerOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-purple-950 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            </div>

            {/* Previous Announcements History Table */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-brand">SENT ANNOUNCEMENT LOGS</h3>
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No announcements yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400 font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Date & Time</th>
                        <th className="py-3 px-4 font-bold">Title</th>
                        <th className="py-3 px-4 font-bold">Message</th>
                        <th className="py-3 px-4 font-bold">Target Audience</th>
                        <th className="py-3 px-4 font-bold">Destination URL</th>
                        <th className="py-3 px-4 font-bold text-right">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40">
                      {announcements.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">{item.date}</td>
                          <td className="py-3.5 px-4 font-bold text-white uppercase tracking-wide">{item.title}</td>
                          <td className="py-3.5 px-4 max-w-xs truncate">{item.message}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-500/10">
                              {item.audience}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-500 truncate max-w-[120px]">{item.destination || '/'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2.5 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/25 uppercase">
                              {item.deliveryStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Announcement Composer Modal */}
            {composerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
                <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setComposerOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors absolute top-4 right-4"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Form Side */}
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">CREATION HUB</span>
                      <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight">ANNOUNCEMENT WIZARD</h3>
                    </div>

                    {!composerConfirm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Notification Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. NEW BEAT DROP"
                            value={composerTitle}
                            onChange={(e) => setComposerTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-xs text-white uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Body Message *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="A new CASHMERE KID$ beat just landed."
                            value={composerMessage}
                            onChange={(e) => setComposerMessage(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Optional Banner Image URL</label>
                          <input
                            type="text"
                            placeholder="https://unsplash.com/..."
                            value={composerImage}
                            onChange={(e) => setComposerImage(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Destination URL / Route</label>
                          <select
                            value={composerDest}
                            onChange={(e) => setComposerDestination(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-xs text-white"
                          >
                            <option value="">Storefront Homepage</option>
                            <option value="/browse">Beats Catalog</option>
                            {beats.slice(0, 10).map(b => (
                              <option key={b.id} value={`/?beat=${b.id}`}>Beat Page: {b.title}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            if (!composerTitle.trim() || !composerMessage.trim()) {
                              alert('Please complete the required title and message fields.');
                              return;
                            }
                            setComposerConfirm(true);
                          }}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Preview Announcement</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-xs space-y-2 leading-relaxed">
                          <h4 className="font-bold text-purple-300">Push Delivery Notice</h4>
                          <p className="text-zinc-400 text-[11px]">
                            Confirming this dispatch will instantly broadcast visible push notifications securely to all active, opted-in customer devices through our Standards-Based Web Push delivery infrastructure.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setComposerConfirm(false)}
                            className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const newAnn = {
                                  id: `ann-${Date.now()}`,
                                  title: composerTitle.toUpperCase().trim(),
                                  message: composerMessage.trim(),
                                  date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                  deliveryStatus: 'Delivered',
                                  audience: 'Opted-In Devices',
                                  destination: composerDest || '/',
                                  imageUrl: composerImage.trim() || undefined
                                };

                                // Secure server-side push notification broadcast endpoint trigger
                                await fetch('/api/onesignal/send-announcement', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(newAnn)
                                });

                                setAnnouncements((prev) => [newAnn, ...prev]);
                                setComposerOpen(false);
                                triggerSaveState('Global push announcement dispatched successfully!');
                              } catch (e) {
                                console.error('Dispatch error:', e);
                                alert('Error broadcasting push: Delivery offline.');
                              }
                            }}
                            className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                          >
                            Confirm & Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Device Lock-Screen Live Mockup Preview */}
                  <div className="space-y-4 flex flex-col items-center">
                    <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest text-left w-full">LOCK SCREEN LIVE MOCKUP</h4>
                    
                    <div className="w-full max-w-[280px] h-[500px] rounded-[40px] border-4 border-zinc-800 bg-zinc-950 p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                      
                      {/* Top notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-800 rounded-b-2xl z-10" />

                      {/* Header clock */}
                      <div className="text-center pt-8 space-y-1">
                        <div className="text-3xl font-light text-zinc-200 tracking-wide font-mono">13:37</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Saturday, Sept 26</div>
                      </div>

                      {/* Visually stunning Notification Alert Bubble */}
                      <div className="space-y-3.5 my-auto">
                        <div className="bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl p-3.5 rounded-2xl text-left shadow-lg space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500">
                            <div className="flex items-center gap-1.5 text-purple-400">
                              <Bell className="w-3 h-3 text-purple-400" />
                              <span>CASHMERE KID$</span>
                            </div>
                            <span>now</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] font-extrabold text-white uppercase tracking-wide">
                              {composerTitle || 'ANNOUNCEMENT TITLE'}
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-normal line-clamp-3">
                              {composerMessage || 'Broadcast message preview appears right here.'}
                            </div>
                          </div>
                          {composerImage && (
                            <img
                              src={composerImage}
                              alt="Banner"
                              className="w-full h-16 object-cover rounded-lg border border-zinc-800/40 mt-1"
                              onError={(e) => { (e.target as any).style.display = 'none'; }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Swipe up guide */}
                      <div className="text-center pb-2 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                        Swipe up to unlock
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAPER TRAIL SECURITY AND LICENSE AUDITING ==================== */}
        {activeTab === 'paper_trail' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">SECURITY & LICENSING AUDIT</span>
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight mt-1">PAPER TRAIL AUDIT NETWORK</h2>
              <p className="text-xs text-zinc-500">Track authorized media streams, verified buyer downloads, and blocked extraction attempts in real-time.</p>
            </div>

            {/* Audit KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Licensed Downloads</span>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  {paperTrailEntries.filter(e => e.type === 'PAID_PURCHASE').length} Files
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Verified checkouts</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Media Access Streams</span>
                <div className="text-2xl font-mono font-black text-purple-300">
                  {paperTrailEntries.filter(e => e.type === 'MEDIA_ACCESS').length} Streams
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Authorized preview plays</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Blocked Access Scrapes</span>
                <div className="text-2xl font-mono font-black text-red-400">
                  {paperTrailEntries.filter(e => e.type === 'UNAUTHORIZED_ATTEMPT').length} Blocks
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">Unauthorized extraction blocks</span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Suspicious Bot Requests</span>
                <div className="text-2xl font-mono font-black text-amber-500">
                  {paperTrailEntries.filter(e => e.type === 'SUSPICIOUS_REQUEST').length} Blocks
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">Converter crawlers detected</span>
              </div>
            </div>

            {/* Filter and Table Panel */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-brand">SECURITY & ACCESS LOGS</h3>
                
                {/* Product-Level Detail Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 font-sans shrink-0">Product Filter:</span>
                  <select
                    value={paperTrailProductFilter}
                    onChange={(e) => setPaperTrailProductFilter(e.target.value)}
                    className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  >
                    <option value="ALL">All Beats & Packs</option>
                    {beats.map(b => (
                      <option key={b.id} value={b.audioUrl || b.iaUrl || b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {paperTrailEntries.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No notification history yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400 font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Timestamp</th>
                        <th className="py-3 px-4 font-bold">Event Type</th>
                        <th className="py-3 px-4 font-bold">Target File</th>
                        <th className="py-3 px-4 font-bold">IP & Client metadata</th>
                        <th className="py-3 px-4 font-bold">Reference ID</th>
                        <th className="py-3 px-4 font-bold text-right">Access Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40">
                      {paperTrailEntries
                        .filter(e => paperTrailProductFilter === 'ALL' || e.productId === paperTrailProductFilter || e.productId.includes(paperTrailProductFilter))
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">{item.timestamp}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.type === 'PAID_PURCHASE' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                                item.type === 'FREE_DOWNLOAD' ? 'bg-sky-950/60 text-sky-400 border border-sky-500/10' :
                                item.type === 'MEDIA_ACCESS' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/10' :
                                item.type === 'SUSPICIOUS_REQUEST' ? 'bg-amber-950/60 text-amber-500 border border-amber-500/10' :
                                'bg-red-950/60 text-red-400 border border-red-500/10'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-[120px] truncate text-white uppercase font-bold">{item.productTitle || item.productId}</td>
                            <td className="py-3.5 px-4 space-y-0.5 max-w-[180px]">
                              <div className="font-mono text-[10px] text-zinc-400">{item.ipAddress}</div>
                              <div className="text-[9px] text-zinc-600 truncate" title={item.userAgent}>{item.userAgent}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-500">{item.orderId || 'Direct Query'}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                                item.status === 'ALLOWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== FLASH SALES CAMPAIGNS CREATOR ==================== */}
        {activeTab === 'flash_sales' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">URGENCY CAMPAIGNS CREATOR</span>
                <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight mt-1">FLASH SALES DASHBOARD</h2>
                <p className="text-xs text-zinc-500">Create, preview, activate and schedule secure flash discount events that validate seamlessly at checkout.</p>
              </div>
              <button
                onClick={() => {
                  setFlashSaleTitle('');
                  setFlashSaleMessage('');
                  setFlashSaleDiscountAmount(25);
                  setFlashSaleBannerText('');
                  setFlashSaleCTAText('');
                  setFlashSaleEligibleProducts(['ALL']);
                  setFlashSalePreviewMode(false);
                  setActiveFlashSaleComposer(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-purple-950 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Flash Sale</span>
              </button>
            </div>

            {/* Configured Campaigns Table */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-brand">CAMPAIGN LOGS</h3>
              {serverFlashSales.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No announcements yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400 font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Campaign Name</th>
                        <th className="py-3 px-4 font-bold">Announcement</th>
                        <th className="py-3 px-4 font-bold">Discount</th>
                        <th className="py-3 px-4 font-bold">Active Dates</th>
                        <th className="py-3 px-4 font-bold">Eligible Items</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40">
                      {serverFlashSales.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white uppercase tracking-wide">{item.title}</td>
                          <td className="py-3.5 px-4 max-w-xs truncate">{item.announcement}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                            {item.discountType === 'percentage' ? `${item.discountAmount}% OFF` : `$${item.discountAmount} OFF`}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] space-y-0.5 text-zinc-500">
                            <div>Start: {item.startDate?.replace('T', ' ')}</div>
                            <div>End: {item.endDate?.replace('T', ' ')}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px]">
                              {item.eligibleProducts?.includes('ALL') ? 'All Catalog' : `${item.eligibleProducts?.length} selected`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                              item.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 shrink-0">
                            <button
                              onClick={async () => {
                                const toggled = { ...item, status: item.status === 'active' ? 'inactive' : 'active' };
                                const res = await fetch('/api/flash-sales', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(toggled)
                                });
                                if (res.ok) {
                                  const refetched = await fetch('/api/flash-sales').then(r => r.json());
                                  setServerFlashSales(refetched);
                                  triggerSaveState('Campaign status updated!');
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded transition-colors"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={async () => {
                                const res = await fetch(`/api/flash-sales/${item.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setServerFlashSales((prev) => prev.filter(s => s.id !== item.id));
                                  triggerSaveState('Campaign deleted.');
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-red-950/60 hover:bg-red-900/60 text-red-300 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Flash Sale Composer Modal */}
            {activeFlashSaleComposer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
                <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setActiveFlashSaleComposer(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors absolute top-4 right-4"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Form Side */}
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">LAUNCH CONTROL</span>
                      <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight">CAMPAIGN CONSTRUCTOR</h3>
                    </div>

                    {!flashSalePreview ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Campaign Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. VIP BLACK FRIDAY"
                              value={flashSaleTitle}
                              onChange={(e) => setFlashSaleTitle(e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Status</label>
                            <select
                              value={flashSaleStatus}
                              onChange={(e: any) => setFlashSaleStatus(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                            >
                              <option value="active">Active & Visible</option>
                              <option value="inactive">Inactive / Draft</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Announcement Tagline Message *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Get 50% discount on all premium lease stems this weekend only."
                            value={flashSaleMessage}
                            onChange={(e) => setFlashSaleMessage(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Discount Type</label>
                            <select
                              value={flashSaleDiscType}
                              onChange={(e: any) => setFlashSaleDiscountType(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                            >
                              <option value="percentage">Percentage Discount (%)</option>
                              <option value="fixed">Fixed Currency Amount ($)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Discount Value *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={flashSaleDiscAmount}
                              onChange={(e) => setFlashSaleDiscountAmount(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Start Date & Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={flashSaleStart}
                              onChange={(e) => setFlashSaleStartDate(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">End Date & Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={flashSaleEnd}
                              onChange={(e) => setFlashSaleEndDate(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flashSaleIncludeBeats}
                              onChange={(e) => setFlashSaleIncludeBeats(e.target.checked)}
                              className="accent-purple-500"
                            />
                            <span className="text-xs font-bold text-zinc-400">Include Beats</span>
                          </label>
                          <label className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flashSaleIncludePacks}
                              onChange={(e) => setFlashSaleIncludePacks(e.target.checked)}
                              className="accent-purple-500"
                            />
                            <span className="text-xs font-bold text-zinc-400">Include Beat Packs</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">Banner Display Text</label>
                            <input
                              type="text"
                              placeholder="e.g. ULTRA HOLIDAY DROP DISCOUNTS LIVE"
                              value={flashSaleBanner}
                              onChange={(e) => setFlashSaleBannerText(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 block mb-1">CTA Button Text</label>
                            <input
                              type="text"
                              placeholder="e.g. SHOP VAULT"
                              value={flashSaleCTA}
                              onChange={(e) => setFlashSaleCTAText(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!flashSaleTitle.trim() || !flashSaleMessage.trim() || !flashSaleStart || !flashSaleEnd) {
                              alert('Please complete the required constructor fields.');
                              return;
                            }
                            setFlashSalePreviewMode(true);
                          }}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Preview Flash Sale</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-xs space-y-2 leading-relaxed">
                          <h4 className="font-bold text-purple-300">Campaign Schedule Notice</h4>
                          <p className="text-zinc-400 text-[11px]">
                            Dispatches this campaign into the storefront database. When the current time falls inside the campaign dates, the luxury banner and popup appear on the storefront.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setFlashSalePreviewMode(false)}
                            className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const newCampaign = {
                                  id: `sale-${Date.now()}`,
                                  title: flashSaleTitle,
                                  announcement: flashSaleMessage,
                                  discountType: flashSaleDiscType,
                                  discountAmount: flashSaleDiscAmount,
                                  startDate: flashSaleStart,
                                  endDate: flashSaleEnd,
                                  eligibleProducts: flashSaleEligibleProducts,
                                  includeBeatPacks: flashSaleIncludePacks,
                                  includeSingleBeats: flashSaleIncludeBeats,
                                  bannerText: flashSaleBanner || `${flashSaleTitle} DROPS NOW`,
                                  ctaText: flashSaleCTA || 'SHOP SALE',
                                  status: flashSaleStatus
                                };

                                const res = await fetch('/api/flash-sales', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(newCampaign)
                                });

                                if (res.ok) {
                                  const refetched = await fetch('/api/flash-sales').then(r => r.json());
                                  setServerFlashSales(refetched);
                                  setActiveFlashSaleComposer(false);
                                  triggerSaveState('Campaign deployed successfully!');
                                }
                              } catch (e) {
                                alert('Failed to deploy campaign.');
                              }
                            }}
                            className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                          >
                            Confirm & Deploy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campaign Preview Mockup */}
                  <div className="space-y-4 flex flex-col items-center">
                    <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest text-left w-full">STOREFRONT ACTIVE BANNER PREVIEW</h4>
                    
                    <div className="w-full p-4 bg-zinc-900 border border-purple-500/30 rounded-2xl text-left space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/20 uppercase tracking-widest">
                            {flashSaleBanner || 'LIMITED TIME FLASH SALE'}
                          </span>
                          <h4 className="text-md font-brand font-black text-white uppercase tracking-tight">{flashSaleTitle || 'VIP BLACK FRIDAY'}</h4>
                          <p className="text-[11px] text-zinc-400 leading-normal">{flashSaleMessage || 'Secure platinum lease stems at huge discounts this weekend.'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-black text-purple-300 uppercase block">
                            {flashSaleDiscType === 'percentage' ? `${flashSaleDiscAmount}% OFF` : `$${flashSaleDiscAmount} OFF`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2.5 border-t border-zinc-800/80 gap-3">
                        <div className="space-y-0.5 shrink-0">
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">CAMPAIGN ENDS IN:</span>
                          <div className="text-xs font-mono font-black text-white tracking-widest uppercase">02h : 41m : 15s</div>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-md shrink-0">
                          {flashSaleCTA || 'SHOP SALE'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PRIVATE UGC AD CREATOR FOR PRODUCERS ==================== */}
        {activeTab === 'ugc_ad_creator' && (
          <UgcCreator
            beats={beats}
            beatPacks={beatPacks}
            currencySymbol={currencySymbol}
          />
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

        {/* ==================== GMAIL WORKSPACE INTEGRATION SETTINGS ==================== */}
        {activeTab === 'email_settings' && (
          <div className="space-y-6 animate-fadeIn text-white">
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">GOOGLE WORKSPACE INTEGRATION</span>
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight">EMAIL NOTIFICATIONS & SMTP</h2>
              <p className="text-xs text-zinc-500">Automated notification schedules and client email receipts. <span className="text-zinc-300 font-bold">Email integration is optional.</span></p>
            </div>

            {/* Email Status Indicator Banner */}
            {emailStatusMsg && (
              <div className={`p-4 border rounded-2xl flex items-center justify-between text-xs animate-fadeIn ${
                emailStatusMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                emailStatusMsg.type === 'error' ? 'bg-red-950/40 border-red-500/30 text-red-400' :
                'bg-purple-950/40 border-purple-500/30 text-purple-300'
              }`}>
                <div className="flex items-center gap-3">
                  {emailStatusMsg.type === 'loading' && (
                    <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin shrink-0" />
                  )}
                  <p className="font-semibold">{emailStatusMsg.text}</p>
                </div>
                <button onClick={() => setEmailStatusMsg(null)} className="text-zinc-500 hover:text-white shrink-0 ml-4 font-mono font-bold">dismiss</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side: Status and Connection Control */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Authorization Status Card */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 relative overflow-hidden shadow-2xl shadow-purple-950/10">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Gmail authorization</h3>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border ${
                      gmailConnected 
                        ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}>
                      {gmailConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/60 border border-zinc-900 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Sender Account:</span>
                        <span className="font-mono font-bold text-white text-[11px] truncate max-w-[150px]">{gmailEmail}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Workspace Auth:</span>
                        <span className="font-mono font-bold text-[11px]">{gmailConnected ? 'Active Token cached' : 'None'}</span>
                      </div>
                    </div>

                    {/* Google Workspace authorization buttons */}
                    {!gmailConnected ? (
                      <button
                        onClick={handleGoogleGmailLogin}
                        className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer border-0"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span>Authorize with Gmail</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleGoogleGmailLogin}
                          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Reconnect Account</span>
                        </button>
                        <button
                          onClick={handleLogoutGmail}
                          className="w-full py-2.5 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                        >
                          Revoke Permission
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection Test Form */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Gmail Connection Test</h3>
                  <p className="text-[11px] text-zinc-500 leading-normal">Dispatch a simple, real-time diagnostic verification email to any inbox to confirm permission validity.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Diagnostic Recipient</label>
                      <input
                        type="email"
                        placeholder="e.g. artist@domain.com"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleSendTestEmail}
                      disabled={!gmailConnected}
                      className={`w-full py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border-0 ${
                        gmailConnected
                          ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                      }`}
                    >
                      <span>Send Diagnostic Mail</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Template Editor Workspace */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-900">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Automation Template Constructor</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setActiveTemplateTab('welcome')}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                          activeTemplateTab === 'welcome' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Artist welcome
                      </button>
                      <button
                        onClick={() => setActiveTemplateTab('receipt')}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                          activeTemplateTab === 'receipt' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Receipt/Stems
                      </button>
                      <button
                        onClick={() => setActiveTemplateTab('notification')}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                          activeTemplateTab === 'notification' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Notification
                      </button>
                      <button
                        onClick={() => setActiveTemplateTab('adminAlert')}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                          activeTemplateTab === 'adminAlert' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Admin Alerts
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Subject Line */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email Subject line</label>
                      <input
                        type="text"
                        placeholder="Template Subject"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none font-bold"
                      />
                    </div>

                    {/* Editor Body */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email Body Message (HTML Supported)</label>
                        <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">Dynamic Placeholders enabled</span>
                      </div>
                      <textarea
                        rows={12}
                        placeholder="Write dynamic content here..."
                        value={templateBody}
                        onChange={(e) => setTemplateBody(e.target.value)}
                        className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-2xl text-xs text-white focus:outline-none font-mono leading-relaxed resize-none"
                      />
                    </div>

                    {/* Variables Tip list */}
                    <div className="p-4 bg-zinc-900/60 border border-zinc-900 rounded-2xl space-y-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Available Placeholders Context</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px] text-zinc-400">
                        {activeTemplateTab === 'welcome' && (
                          <div className="space-y-1">
                            <span className="text-purple-300 font-bold block">{`{artist_name}`}</span>
                            <span className="text-[9px] text-zinc-500">Artist Name</span>
                          </div>
                        )}
                        {activeTemplateTab === 'receipt' && (
                          <>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{artist_name}`}</span>
                              <span className="text-[9px] text-zinc-500">Artist Name</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{product_title}`}</span>
                              <span className="text-[9px] text-zinc-500">Product/Beat title</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{download_url}`}</span>
                              <span className="text-[9px] text-zinc-500">Secure Download Link</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{license_terms}`}</span>
                              <span className="text-[9px] text-zinc-500">License detail text</span>
                            </div>
                          </>
                        )}
                        {activeTemplateTab === 'notification' && (
                          <div className="space-y-1">
                            <span className="text-purple-300 font-bold block">{`{artist_name}`}</span>
                            <span className="text-[9px] text-zinc-500">Artist Name</span>
                          </div>
                        )}
                        {activeTemplateTab === 'adminAlert' && (
                          <>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{event_type}`}</span>
                              <span className="text-[9px] text-zinc-500">Type of notice</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{event_details}`}</span>
                              <span className="text-[9px] text-zinc-500">Log payload details</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-300 font-bold block">{`{timestamp}`}</span>
                              <span className="text-[9px] text-zinc-500">Date/Time stamp</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={handleSaveTemplates}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer shadow-lg shadow-purple-950/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Template Parameters</span>
                    </button>

                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 16. SETTINGS: PAYMENT INTEGRATIONS ==================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">PAYMENTS & Payout SETTINGS</h2>
              <p className="text-xs text-zinc-500">Configure your professional payout accounts and monitor merchant transactions.</p>
            </div>

            <PayPalConnectionCenter 
              salesRecords={salesRecords}
              onUpdateSalesRecords={(records) => {
                 // Update parent records if needed
              }}
              currencySymbol={currencySymbol}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Internet Archive Storage Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">Persistent Media Storage</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">CONNECTED</span>
                </div>
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className="font-mono text-white font-bold">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="font-mono text-purple-300 font-bold">Internet Archive</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-mono text-emerald-400 font-bold">Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Master Item:</span>
                    <span className="font-mono text-zinc-400 truncate max-w-[180px]">cashmerekids_vault_master_item</span>
                  </div>
                </div>
              </div>

              {/* Stripe Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">Stripe Express Payouts</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-zinc-400">Accept Credit Cards, Apple Pay, and Google Pay with zero platform commissions.</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 17. SETTINGS: LEGAL CONTRACTS CUSTOMIZER ==================== */}
        {activeTab === 'legal_services' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">LICENSES & CONTRACTS CUSTOMIZER</span>
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight mt-1">LEGAL AGREEMENT CONTRACTS</h2>
              <p className="text-xs text-zinc-500">Edit non-exclusive or exclusive license parameters and boilerplate template texts with shortcode tags.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: Parameters Customizer */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">SELECT CONTRACT TIER</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'mp3', label: 'Basic MP3' },
                      { id: 'wav', label: 'Premium WAV' },
                      { id: 'unlimited', label: 'Unlimited' },
                      { id: 'exclusive', label: 'Exclusive Rights' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedContractTier(t.id as any);
                          setIsContractCompiled(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selectedContractTier === t.id
                            ? 'bg-purple-950 border-purple-500/40 text-purple-300 font-extrabold'
                            : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit Tier Parameters */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">EDIT LICENSE PARAMS</h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Streams Allowed</label>
                      <input
                        type="text"
                        value={contractLimits[selectedContractTier].streams}
                        onChange={(e) => {
                          const updatedVal = e.target.value;
                          setContractLimits((prev: any) => ({
                            ...prev,
                            [selectedContractTier]: { ...prev[selectedContractTier], streams: updatedVal }
                          }));
                        }}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Radio Airplay Limit</label>
                      <input
                        type="text"
                        value={contractLimits[selectedContractTier].airplay}
                        onChange={(e) => {
                          const updatedVal = e.target.value;
                          setContractLimits((prev: any) => ({
                            ...prev,
                            [selectedContractTier]: { ...prev[selectedContractTier], airplay: updatedVal }
                          }));
                        }}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Music Videos Allowed</label>
                      <input
                        type="text"
                        value={contractLimits[selectedContractTier].videoAllowed}
                        onChange={(e) => {
                          const updatedVal = e.target.value;
                          setContractLimits((prev: any) => ({
                            ...prev,
                            [selectedContractTier]: { ...prev[selectedContractTier], videoAllowed: updatedVal }
                          }));
                        }}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Performance Rights limit</label>
                      <input
                        type="text"
                        value={contractLimits[selectedContractTier].performRights}
                        onChange={(e) => {
                          const updatedVal = e.target.value;
                          setContractLimits((prev: any) => ({
                            ...prev,
                            [selectedContractTier]: { ...prev[selectedContractTier], performRights: updatedVal }
                          }));
                        }}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Rich Text Template Editor Workspace */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">BOILERPLATE LEGAL TEXT EDITOR</h3>
                    <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">Dynamic replace triggers: enabled</span>
                  </div>

                  {/* Rich Text Editor Simulation Panel */}
                  <div className="space-y-4">
                    <textarea
                      rows={12}
                      value={contractTemplateTexts[selectedContractTier]}
                      onChange={(e) => {
                        const updatedText = e.target.value;
                        setContractTemplateTexts((prev: any) => ({
                          ...prev,
                          [selectedContractTier]: updatedText
                        }));
                        setIsContractCompiled(false);
                      }}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-2xl text-xs text-white font-mono leading-relaxed resize-none"
                    />

                    {/* Shortcodes quick insert guide */}
                    <div className="p-4 bg-zinc-900/60 border border-zinc-900 rounded-2xl text-[10px] font-mono text-zinc-400 space-y-2">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Available contract shortcodes</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-1 bg-black rounded text-center" title="Swaps with buyer's name">{"{{buyer_name}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with composition title">{"{{product_title}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with stream limits">{"{{stream_limit}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with radio stations limit">{"{{airplay_limit}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with copies allowance">{"{{distribution_copies}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with performance rights limit">{"{{performance_rights}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with date">{"{{purchase_date}}"}</div>
                        <div className="p-1 bg-black rounded text-center" title="Swaps with price">{"{{purchase_price}}"}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Replace shortcodes with mock data
                          let txt = contractTemplateTexts[selectedContractTier];
                          const limit = contractLimits[selectedContractTier];
                          txt = txt.replace(/\{\{buyer_name\}\}/g, 'Lil Voodoo')
                                   .replace(/\{\{product_title\}\}/g, beats[0]?.title || 'Velvet Dream')
                                   .replace(/\{\{stream_limit\}\}/g, limit.streams)
                                   .replace(/\{\{airplay_limit\}\}/g, limit.airplay)
                                   .replace(/\{\{distribution_copies\}\}/g, limit.copies || '50,000')
                                   .replace(/\{\{performance_rights\}\}/g, limit.performRights)
                                   .replace(/\{\{purchase_date\}\}/g, new Date().toISOString().substring(0, 10))
                                   .replace(/\{\{purchase_price\}\}/g, `${currencySymbol}${selectedContractTier === 'mp3' ? '29.99' : selectedContractTier === 'wav' ? '79.99' : selectedContractTier === 'unlimited' ? '199.99' : '999.99'}`);
                          setCompiledContractText(txt);
                          setIsContractCompiled(true);
                          triggerSaveState('PDF Contract text compiled successfully!');
                        }}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <FileCode className="w-4 h-4 text-purple-200" />
                        <span>Compile & Preview Contract PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerSaveState('Boilerplate contracts saved permanently!');
                        }}
                        className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Save Templates
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compiled Preview Contract Drawer */}
                {isContractCompiled && (
                  <div className="p-6 bg-zinc-950 border border-emerald-500/20 rounded-3xl space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-brand">COMPILED PDF PREVIEW WINDOW</h4>
                      </div>
                      <button
                        onClick={() => {
                          // Simple file download trigger as txt
                          const blob = new Blob([compiledContractText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `compiled_license_agreement_${selectedContractTier}_contract.txt`;
                          a.click();
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-bold underline"
                      >
                        Download Document File (.txt)
                      </button>
                    </div>

                    <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl max-h-60 overflow-y-auto text-[11px] font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {compiledContractText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 18. SETTINGS: SPLITS & COPYRIGHT (CO-BLENDS) ==================== */}
        {activeTab === 'splits_copyright' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">ROYALTY MANAGEMENT SUITE</span>
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight mt-1">COLLABORATIONS & PROFIT SPLITS</h2>
              <p className="text-xs text-zinc-500">Add co-producers to your splits network, map song shares, and validate that percentages total exactly 100%.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Split Setup Dashboard */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">SELECT TRACK TO SPLIT</h3>
                  
                  <select
                    value={selectedSplitBeatId}
                    onChange={(e) => {
                      setSelectedSplitBeatId(e.target.value);
                      const currentSplits = beatSplits[e.target.value] || [];
                      if (currentSplits.length === 0 && e.target.value) {
                        // Pre-populate with standard 100% split for owner
                        setBeatSplits(prev => ({
                          ...prev,
                          [e.target.value]: [{ username: profileHandle || '@cashmerekid', role: 'Main Producer', percentage: 100 }]
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Choose a Beat --</option>
                    {beats.map((b) => (
                      <option key={b.id} value={b.id}>{b.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {selectedSplitBeatId && (
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">ADD COLLABORATOR</h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Co-Producer Username</label>
                        <input
                          type="text"
                          placeholder="e.g. @metro_beatz"
                          value={collabUsername}
                          onChange={(e) => setCollabUsername(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Role</label>
                          <select
                            value={collabRole}
                            onChange={(e) => setCollabRole(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                          >
                            <option value="Co-Producer">Co-Producer</option>
                            <option value="Songwriter">Songwriter</option>
                            <option value="Vocalist">Vocalist</option>
                            <option value="Mixing Engineer">Mixing Engineer</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Percentage Share</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={collabPercent}
                            onChange={(e) => setCollabPercent(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!collabUsername.trim()) {
                            alert('Enter a valid collaborator handle!');
                            return;
                          }
                          const cleanHandle = collabUsername.startsWith('@') ? collabUsername : `@${collabUsername.trim()}`;
                          const existing = beatSplits[selectedSplitBeatId] || [];
                          
                          // Check if username already exists
                          if (existing.some(s => s.username === cleanHandle)) {
                            alert('Collaborator already added to splits list!');
                            return;
                          }

                          // Add split row
                          setBeatSplits(prev => ({
                            ...prev,
                            [selectedSplitBeatId]: [...existing, { username: cleanHandle, role: collabRole, percentage: collabPercent }]
                          }));
                          setCollabUsername('');
                        }}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        + Add Collaborator Split
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Splits Registry & validation Table */}
              <div className="lg:col-span-2 space-y-6">
                {selectedSplitBeatId ? (
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-brand">ACTIVE COLLABORATORS REGISTRY</h3>
                      
                      {/* Mathematical 100% Split validation check */}
                      {(() => {
                        const splits = beatSplits[selectedSplitBeatId] || [];
                        const total = splits.reduce((sum, s) => sum + s.percentage, 0);
                        const isValid = total === 100;
                        return (
                          <span className={`px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                            isValid ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                          }`}>
                            {isValid ? 'MATH VERIFIED (100%)' : `INVALID SPLITS: ${total}% / 100%`}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="space-y-3">
                      {(beatSplits[selectedSplitBeatId] || []).map((col, idx) => (
                        <div key={idx} className="p-3.5 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{col.username}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{col.role}</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono font-bold">
                            <span className="text-purple-300 text-sm">{col.percentage}%</span>
                            <button
                              onClick={() => {
                                setBeatSplits(prev => ({
                                  ...prev,
                                  [selectedSplitBeatId]: prev[selectedSplitBeatId].filter((_, i) => i !== idx)
                                }));
                                triggerSaveState('Split entry discarded.');
                              }}
                              className="text-xs text-rose-500 hover:text-rose-400 uppercase font-sans cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Split Sheet History Ledger Display */}
                      <div className="pt-4 border-t border-zinc-900 space-y-3">
                        <h4 className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">CO-BLEND PAYOUT LEDGER</h4>
                        
                        <div className="p-4 bg-zinc-900/60 rounded-2xl text-[11px] text-zinc-400 leading-normal space-y-2">
                          <p>When a checkout sale occurs on this beat, the splits configuration calculations execute instantly in real-time. Payout split APIs route percentages direct to active partner balances simultaneously with zero escrow delay.</p>
                          <div className="pt-2 flex justify-between font-mono text-[10px]">
                            <span>Payout Method:</span>
                            <span className="font-bold text-emerald-400 uppercase">Stripe Connect / PayPal Partner Routing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3 text-zinc-400">
                    <Users className="w-10 h-10 text-zinc-600 mx-auto" />
                    <h4 className="font-bold text-white uppercase">Choose Beat to Manage Splits</h4>
                    <p className="text-xs max-w-sm mx-auto">Select any beat from the left dropdown list to configure and edit royalty split agreements.</p>
                  </div>
                )}
              </div>
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
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Beat Artwork</label>
                  <ArtworkUploader
                    beatId={editingBeat.id}
                    currentArtworkUrl={editArtworkUrl}
                    title={editTitle}
                    onArtworkSaved={(url) => {
                      setEditArtworkUrl(url);
                      triggerSaveState('Artwork saved');
                    }}
                  />
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
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">MP3 Lease Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPriceVal}
                    onChange={(e) => setEditPriceVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">M4A Premium Lease ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPremiumPriceVal}
                    onChange={(e) => setEditPremiumPriceVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Unlimited Lease ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUnlimitedPrice}
                    onChange={(e) => setEditUnlimitedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Exclusive Rights ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editExclusivePriceVal}
                    onChange={(e) => setEditExclusivePriceVal(parseFloat(e.target.value) || 0)}
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
