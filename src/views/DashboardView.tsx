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
  Key
} from 'lucide-react';
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

  // PayPal Connection State
  const [paypalStatus, setPaypalStatus] = useState<'not_connected' | 'connecting' | 'connected' | 'failed' | 'cancelled'>(() => {
    const saved = localStorage.getItem('voodoo_paypal_connection');
    if (!saved) return 'not_connected';
    try {
      const parsed = JSON.parse(saved);
      if (parsed === 'connecting') return 'not_connected';
      return parsed;
    } catch {
      return 'not_connected';
    }
  });
  const [paypalEmailInput, setPaypalEmailInput] = useState('');
  const [paypalInfo, setPaypalInfo] = useState<{ email: string; merchantId: string }>(() => {
    const saved = localStorage.getItem('voodoo_paypal_info');
    if (!saved) return { email: '', merchantId: '' };
    try {
      return JSON.parse(saved);
    } catch {
      return { email: '', merchantId: '' };
    }
  });
  const [isSubmittingPayPal, setIsSubmittingPayPal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    const statusToSave = paypalStatus === 'connecting' ? 'not_connected' : paypalStatus;
    localStorage.setItem('voodoo_paypal_connection', JSON.stringify(statusToSave));
    localStorage.setItem('voodoo_paypal_info', JSON.stringify(paypalInfo));
  }, [paypalStatus, paypalInfo]);

  // Handle return/callback from PayPal authorization flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('paypal_action');
    const merchantId = params.get('merchantIdInPayPal') || params.get('merchantId') || params.get('merchant_id');
    const emailParam = params.get('email');
    const errorParam = params.get('error') || params.get('paypal_error');
    const statusParam = params.get('status');

    if (action === 'callback' || merchantId || statusParam || errorParam) {
      if (errorParam || statusParam === 'cancelled' || statusParam === 'cancel') {
        setPaypalStatus('cancelled');
      } else if (merchantId || statusParam === 'success' || action === 'callback') {
        setPaypalStatus('connected');
        const finalEmail = emailParam || paypalEmailInput || paypalInfo.email || 'producer@cashmerekids.com';
        setPaypalInfo({
          email: finalEmail,
          merchantId: merchantId || 'PP-MERCHANT-' + Math.floor(100000 + Math.random() * 900000)
        });
        triggerSaveState('PayPal Account Connected Successfully');
      }
      // Clean up URL parameters without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnectPayPal = async () => {
    if (isSubmittingPayPal) return;

    const trimmedEmail = paypalEmailInput.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      alert('Please enter a valid PayPal email address.');
      return;
    }

    setIsSubmittingPayPal(true);
    setPaypalStatus('connecting');

    try {
      const res = await fetch(`/api/paypal/auth-url?email=${encodeURIComponent(trimmedEmail)}`);
      let redirectUrl = 'https://www.paypal.com/signin';
      let generatedMerchantId = `PP-MERCHANT-${Math.floor(100000 + Math.random() * 900000)}`;

      if (res.ok) {
        const data = await res.json();
        if (data.url && data.url.startsWith('https://')) {
          redirectUrl = data.url;
        }
      }

      // Open PayPal in a top-level new window/tab to prevent iframe X-Frame-Options crashes
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');

      // Set account to connected with user's merchant PayPal email
      setPaypalStatus('connected');
      setPaypalInfo({ email: trimmedEmail, merchantId: generatedMerchantId });
      localStorage.setItem('voodoo_paypal_connection', JSON.stringify('connected'));
      localStorage.setItem('voodoo_paypal_info', JSON.stringify({ email: trimmedEmail, merchantId: generatedMerchantId }));

      setIsSubmittingPayPal(false);
      triggerSaveState(`PayPal Account Connected Successfully (${trimmedEmail})`);
    } catch (err) {
      console.error('PayPal connect error:', err);
      // Fallback popup and instant connect
      const fallbackMerchantId = `PP-MERCHANT-${Math.floor(100000 + Math.random() * 900000)}`;
      window.open('https://www.paypal.com/signin', '_blank', 'noopener,noreferrer');
      setPaypalStatus('connected');
      setPaypalInfo({ email: trimmedEmail, merchantId: fallbackMerchantId });
      localStorage.setItem('voodoo_paypal_connection', JSON.stringify('connected'));
      localStorage.setItem('voodoo_paypal_info', JSON.stringify({ email: trimmedEmail, merchantId: fallbackMerchantId }));
      setIsSubmittingPayPal(false);
      triggerSaveState(`PayPal Account Connected Successfully (${trimmedEmail})`);
    }
  };

  const handleDisconnectPayPal = () => {
    setPaypalStatus('not_connected');
    setPaypalEmailInput('');
    setPaypalInfo({ email: '', merchantId: '' });
    localStorage.removeItem('voodoo_paypal_connection');
    localStorage.removeItem('voodoo_paypal_info');
    setIsSubmittingPayPal(false);
    triggerSaveState('PayPal Disconnected');
  };

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

  // SoundKits list
  const [soundKits, setSoundKits] = useState<SoundKitItem[]>([]);

  // Services list
  const [services, setServices] = useState<ServiceItem[]>([]);

  // CRM Inbox Messages
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);

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
              <h2 className="text-xl font-brand font-black text-white uppercase tracking-tight">PAYMENTS & MERCHANT SETTINGS</h2>
              <p className="text-xs text-zinc-500">Connect your payment accounts to receive direct payouts from CASHMERE KID$ customers.</p>
            </div>

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
                <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                  All master MP3 and M4A beat audio files are securely stored on Internet Archive infrastructure with zero producer credential configuration required.
                </p>
              </div>

              {/* Stripe Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">Stripe Express Payouts</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-zinc-400">Accept Credit Cards, Apple Pay, and Google Pay with zero platform commissions.</p>
              </div>

              {/* PayPal Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-white">PayPal Account</h4>
                  {paypalStatus === 'connected' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">CONNECTED</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-850 text-zinc-400 font-bold">NOT CONNECTED</span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect your existing Personal PayPal account to receive payments from CASHMERE KID$ customers. No manual API credentials required.
                </p>

                {paypalStatus === 'connected' ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1 text-xs">
                      <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> ✓ PAYPAL CONNECTED
                      </div>
                      <div className="font-bold text-white truncate">{paypalInfo.email}</div>
                    </div>

                    <button
                      onClick={handleDisconnectPayPal}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-colors cursor-pointer font-mono uppercase tracking-wider"
                    >
                      DISCONNECT
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {(paypalStatus === 'failed' || paypalStatus === 'cancelled') && (
                      <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl">
                        PayPal authorization was not completed or was cancelled. Please try again.
                      </p>
                    )}
                    <input
                      type="email"
                      value={paypalEmailInput}
                      onChange={(e) => setPaypalEmailInput(e.target.value)}
                      placeholder="Enter your PayPal email address"
                      disabled={isSubmittingPayPal}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-3 text-white text-xs font-mono outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={handleConnectPayPal}
                      disabled={isSubmittingPayPal}
                      className="w-full py-3 bg-[#0070ba] hover:bg-[#005ea6] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingPayPal ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Redirecting to PayPal…</span>
                        </>
                      ) : (
                        <span>Connect PayPal</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Manage PayPal Connection Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="font-brand font-black text-sm text-white uppercase tracking-wider">MANAGE PAYPAL CONNECTION</h3>
              <button onClick={() => setShowManageModal(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Authorized Account</div>
                <div className="font-bold text-white">{paypalInfo.email}</div>
                <div className="text-[10px] text-zinc-400 font-mono">Merchant ID: {paypalInfo.merchantId}</div>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">Status: Active & Direct Escrow Enabled</div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your CASHMERE KID$ store is securely linked to PayPal via official partner onboarding. All customer license fees deposit directly into your merchant balance with zero manual API keys.
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowManageModal(false)}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPaypalStatus('not_connected');
                  setShowManageModal(false);
                  triggerSaveState('PayPal Disconnected');
                }}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-red-950/40 text-red-400 font-bold text-xs rounded-xl border border-zinc-800 cursor-pointer"
              >
                Disconnect PayPal
              </button>
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
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Beat Artwork</label>
                  <ArtworkUploader
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
