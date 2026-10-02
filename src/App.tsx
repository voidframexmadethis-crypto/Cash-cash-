import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { WaveformPlayer } from './components/WaveformPlayer';
import { LicenseModal } from './components/LicenseModal';
import { FreeDownloadModal } from './components/FreeDownloadModal';
import { ShareModal } from './components/ShareModal';
import { BeatDetailModal } from './components/BeatDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { DirectCheckoutModal } from './components/DirectCheckoutModal';
import { PolicyModal } from './components/PolicyModal';
import { NotificationModal } from './components/NotificationModal';
import { LiveStoreModeBar } from './components/LiveStoreModeBar';
import { showLocalNotification } from './utils/pushProvider';
import { logAudienceEvent } from './utils/activityTracker';

import { HomeView } from './views/HomeView';
import { BrowseView } from './views/BrowseView';
import { ProfileView } from './views/ProfileView';
import { DashboardView } from './views/DashboardView';
import { UploaderView } from './views/UploaderView';
import { SearchBySoundView } from './views/SearchBySoundView';
import { TopChartsView } from './views/TopChartsView';
import { CollectionsView } from './views/CollectionsView';
import { MerchView } from './views/MerchView';
import { BeatPacksView } from './views/BeatPacksView';
import { HallOfFameView } from './views/HallOfFameView';
import { CheckoutResultView } from './views/CheckoutResultView';
import { AudioPlayerView } from './views/AudioPlayerView';
import { YouTubeVideosView } from './views/YouTubeVideosView';
import { ServicesView } from './views/ServicesView';

import {
  Beat,
  CartItem,
  Collection,
  FreeDownloadLead,
  LicenseTierKey,
  ProducerProfile,
  Promotion,
  SaleRecord,
  StoreSettings,
  BeatPack,
} from './types';

import {
  INITIAL_BEATS,
  INITIAL_COLLECTIONS,
  INITIAL_FREE_DOWNLOAD_LEADS,
  INITIAL_PRODUCER_PROFILE,
  INITIAL_PROMOTIONS,
  INITIAL_SALES_RECORDS,
  INITIAL_STORE_SETTINGS,
  INITIAL_BEAT_PACKS,
} from './utils/initialData';
import { LICENSE_TIERS } from './utils/licenseInfo';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [initialGenreFilter, setInitialGenreFilter] = useState<string>('ALL');

  // LocalStorage Persistence Hooks
  const [beats, setBeats] = useState<Beat[]>(() => {
    const saved = localStorage.getItem('voodoo_beats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const placeholderIds = ['beat-obsidian-runway', 'beat-velvet-vault', 'beat-platinum-runway', 'beat-dark-synthesis', 'beat-as_aud_1790611860448'];
          return parsed.filter((b: Beat) => !placeholderIds.includes(b.id));
        }
      } catch {
        return [];
      }
    }
    return INITIAL_BEATS;
  });

  const [collections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('voodoo_collections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const placeholderIds = ['col-runway', 'col-obsidian'];
          return parsed.filter((c: Collection) => !placeholderIds.includes(c.id));
        }
      } catch {
        return [];
      }
    }
    return INITIAL_COLLECTIONS;
  });

  const [profile, setProfile] = useState<ProducerProfile>(() => {
    const saved = localStorage.getItem('voodoo_profile');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCER_PROFILE;
  });

  const [youtubeVideos, setYoutubeVideos] = useState(() => {
    const saved = localStorage.getItem('voodoo_youtube_videos');
    return saved ? JSON.parse(saved) : [];
  });

  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('voodoo_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES_RECORDS;
  });

  const [leads, setLeads] = useState<FreeDownloadLead[]>(() => {
    const saved = localStorage.getItem('voodoo_leads');
    return saved ? JSON.parse(saved) : INITIAL_FREE_DOWNLOAD_LEADS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('voodoo_promotions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const placeholderIds = ['promo-1'];
          return parsed.filter((p: Promotion) => !placeholderIds.includes(p.id));
        }
      } catch {
        return [];
      }
    }
    return INITIAL_PROMOTIONS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('voodoo_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('voodoo_settings', JSON.stringify(newSettings));
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('voodoo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [beatPacks, setBeatPacks] = useState<BeatPack[]>(() => {
    const saved = localStorage.getItem('voodoo_beat_packs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const placeholderIds = ['pack-platinum-vault'];
          return parsed.filter((bp: BeatPack) => !placeholderIds.includes(bp.id));
        }
      } catch {
        return [];
      }
    }
    return INITIAL_BEAT_PACKS;
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('voodoo_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('voodoo_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  // Audio Playback State
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(() => beats[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Beat Pack Sampler Radio Mode State (Continuous 45s Album Sampler)
  const [activeBeatPack, setActiveBeatPack] = useState<BeatPack | null>(null);
  const [beatPackTrackIndex, setBeatPackTrackIndex] = useState<number>(0);

  // Modals & Drawers State
  const [audioPlayerExpandTrigger, setAudioPlayerExpandTrigger] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [selectedBuyBeat, setSelectedBuyBeat] = useState<Beat | null>(null);
  const [directCheckoutBeat, setDirectCheckoutBeat] = useState<Beat | null>(null);
  const [directCheckoutLicenseKey, setDirectCheckoutLicenseKey] = useState<LicenseTierKey>('mp3Lease');
  const [selectedFreeBeat, setSelectedFreeBeat] = useState<Beat | null>(null);
  const [selectedShareBeat, setSelectedShareBeat] = useState<Beat | null>(null);
  const [selectedDetailBeat, setSelectedDetailBeat] = useState<Beat | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'licensing' | 'refunds' | null>(null);
  
  // Feature 49: Live Store Mode
  const [isLiveStoreMode, setIsLiveStoreMode] = useState<boolean>(false);
  const [liveStoreDeviceMode, setLiveStoreDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('voodoo_beats', JSON.stringify(beats));
  }, [beats]);

  // Sync beats with backend store on mount
  useEffect(() => {
    fetch('/api/beats')
      .then((r) => r.json())
      .then((data) => {
        if (data?.beats && Array.isArray(data.beats)) {
          const placeholderIds = ['beat-obsidian-runway', 'beat-velvet-vault', 'beat-platinum-runway', 'beat-dark-synthesis', 'beat-as_aud_1790611860448'];
          const validBeats = data.beats.filter((b: Beat) => !placeholderIds.includes(b.id));
          setBeats(validBeats);
          if (validBeats.length > 0) {
            setCurrentBeat((prev) => {
              if (!prev || prev.id === 'beat-as_aud_1790611860448') return validBeats[0];
              const match = validBeats.find((b: Beat) => b.id === prev.id);
              return match || validBeats[0];
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('voodoo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('voodoo_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('voodoo_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('voodoo_sales', JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem('voodoo_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('voodoo_youtube_videos', JSON.stringify(youtubeVideos));
  }, [youtubeVideos]);

  useEffect(() => {
    localStorage.setItem('voodoo_beat_packs', JSON.stringify(beatPacks));
  }, [beatPacks]);

  useEffect(() => {
    localStorage.setItem('voodoo_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('voodoo_recently_viewed', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  const handleToggleFavorite = (beat: Beat) => {
    setFavoriteIds((prev) => {
      const isFav = prev.includes(beat.id);
      if (!isFav) {
        logAudienceEvent({
          type: 'beat_favorited',
          title: `Beat added to Favorites`,
          details: `${beat.title} was saved to a listener's favorites vault`,
          beatId: beat.id,
          beatTitle: beat.title,
        });
      }
      return isFav ? prev.filter((id) => id !== beat.id) : [...prev, beat.id];
    });
  };

  const handleViewDetailWithHistory = (beat: Beat) => {
    setSelectedDetailBeat(beat);
    logAudienceEvent({
      type: 'product_viewed',
      title: `Beat Quick View opened`,
      details: `${beat.title} viewed by prospective customer`,
      beatId: beat.id,
      beatTitle: beat.title,
    });
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== beat.id);
      return [beat.id, ...filtered].slice(0, 10);
    });
  };

  // Deep-linking parsing on mount/beats change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryBeatId = params.get('beat');
    if (queryBeatId) {
      const matchedBeat = beats.find((b) => b.id === queryBeatId);
      if (matchedBeat) {
        setSelectedDetailBeat(matchedBeat);
      }
    }
  }, [beats]);

  // Main routing effect running strictly once on mount & popstate
  useEffect(() => {
    const handleRouting = () => {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);

      if (pathname === '/audio-player') {
        setCurrentView('player');
      } else if (pathname.startsWith('/checkout') || params.has('status') || params.has('paypal_success') || params.has('order_id') || params.has('token')) {
        setCurrentView('checkout-result');
      } else if (pathname === '/') {
        setCurrentView((prev) => prev === 'player' ? 'home' : prev);
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  // Synchronize browser address bar pathname with currentView
  useEffect(() => {
    if (currentView === 'player') {
      if (window.location.pathname !== '/audio-player') {
        window.history.pushState({ view: 'player' }, '', '/audio-player');
      }
    } else {
      if (window.location.pathname === '/audio-player') {
        window.history.pushState({ view: currentView }, '', '/');
      }
    }
  }, [currentView]);

  // Audio Controls
  const handlePlayToggle = (beat: Beat) => {
    // Playing a single beat exits Beat Pack sampler radio mode
    if (activeBeatPack) {
      setActiveBeatPack(null);
    }
    if (currentBeat?.id === beat.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
      // Log real audience play event
      logAudienceEvent({
        type: 'beat_played',
        title: `Beat played on storefront`,
        details: `${beat.title} (${beat.bpm} BPM, ${beat.key}) stream started`,
        beatId: beat.id,
        beatTitle: beat.title,
      });
      // Increment real verified play count on stream
      setBeats((prev) => prev.map((b) => (b.id === beat.id ? { ...b, playCount: (b.playCount || 0) + 1 } : b)));
    }
  };

  const handlePlayBeatPack = (pack: BeatPack, startIndex: number = 0) => {
    const packBeats = pack.beatIds
      .map((id) => beats.find((b) => b.id === id))
      .filter((b): b is Beat => !!b);

    if (packBeats.length === 0) return;

    const validIndex = Math.max(0, Math.min(startIndex, packBeats.length - 1));
    setActiveBeatPack(pack);
    setBeatPackTrackIndex(validIndex);
    setCurrentBeat(packBeats[validIndex]);
    setIsPlaying(true);
  };

  const handleNextBeatPackTrack = () => {
    if (!activeBeatPack) return;
    const packBeats = activeBeatPack.beatIds
      .map((id) => beats.find((b) => b.id === id))
      .filter((b): b is Beat => !!b);

    if (packBeats.length === 0) return;

    const nextIdx = (beatPackTrackIndex + 1) % packBeats.length;
    setBeatPackTrackIndex(nextIdx);
    setCurrentBeat(packBeats[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrevBeatPackTrack = () => {
    if (!activeBeatPack) return;
    const packBeats = activeBeatPack.beatIds
      .map((id) => beats.find((b) => b.id === id))
      .filter((b): b is Beat => !!b);

    if (packBeats.length === 0) return;

    const prevIdx = (beatPackTrackIndex - 1 + packBeats.length) % packBeats.length;
    setBeatPackTrackIndex(prevIdx);
    setCurrentBeat(packBeats[prevIdx]);
    setIsPlaying(true);
  };

  const handleExitBeatPackMode = () => {
    setActiveBeatPack(null);
  };

  const handlePrevBeat = () => {
    if (activeBeatPack) {
      handlePrevBeatPackTrack();
      return;
    }
    if (!currentBeat) return;
    
    // Determine the list to navigate based on current view and whether current beat is draft
    const isDashboard = currentView === 'dashboard' || currentView === 'uploader';
    const isCurrentDraft = currentBeat.published === false;
    const listToNavigate = (isDashboard || isCurrentDraft) 
      ? beats 
      : beats.filter((b) => b.published !== false);
      
    if (listToNavigate.length === 0) return;
    
    const currentIndex = listToNavigate.findIndex((b) => b.id === currentBeat.id);
    const prevIndex = currentIndex === -1 
      ? 0 
      : (currentIndex - 1 + listToNavigate.length) % listToNavigate.length;
      
    setCurrentBeat(listToNavigate[prevIndex]);
    setIsPlaying(true);
  };

  const handleNextBeat = () => {
    if (activeBeatPack) {
      handleNextBeatPackTrack();
      return;
    }
    if (!currentBeat) return;
    
    // Determine the list to navigate based on current view and whether current beat is draft
    const isDashboard = currentView === 'dashboard' || currentView === 'uploader';
    const isCurrentDraft = currentBeat.published === false;
    const listToNavigate = (isDashboard || isCurrentDraft) 
      ? beats 
      : beats.filter((b) => b.published !== false);
      
    if (listToNavigate.length === 0) return;
    
    const currentIndex = listToNavigate.findIndex((b) => b.id === currentBeat.id);
    const nextIndex = currentIndex === -1 
      ? 0 
      : (currentIndex + 1) % listToNavigate.length;
      
    setCurrentBeat(listToNavigate[nextIndex]);
    setIsPlaying(true);
  };

  const handleBuyNow = (beat: Beat, licenseKey: LicenseTierKey) => {
    setDirectCheckoutBeat(beat);
    setDirectCheckoutLicenseKey(licenseKey);
  };

  const handleUpdateCartItemLicense = (cartItemId: string, newLicenseKey: LicenseTierKey, newPrice: number) => {
    const tier = LICENSE_TIERS[newLicenseKey];
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? { ...item, licenseKey: newLicenseKey, licenseName: tier.name, price: newPrice }
          : item
      )
    );
  };

  // Cart Handlers
  const handleAddToCart = (beat: Beat, licenseKey: LicenseTierKey) => {
    const tier = LICENSE_TIERS[licenseKey];
    let price = beat.pricing.mp3Lease;
    if (licenseKey === 'premiumLease') price = beat.pricing.premiumLease;
    if (licenseKey === 'unlimited') price = beat.pricing.unlimited;
    if (licenseKey === 'exclusive') price = beat.pricing.exclusive;

    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      beatId: beat.id,
      beatTitle: beat.title,
      artworkUrl: beat.artworkUrl,
      licenseKey: licenseKey,
      licenseName: tier.name,
      price: price,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleAddMerchToCart = (merchItem: { id: string; title: string; price: number; artworkUrl: string; size?: string }) => {
    const newItem: CartItem = {
      id: `cart-merch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      beatTitle: merchItem.title,
      artworkUrl: merchItem.artworkUrl,
      licenseName: merchItem.size ? `Size: ${merchItem.size}` : 'Physical Merch',
      price: merchItem.price,
      isMerch: true,
    };
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleAddBeatPackToCart = (pack: BeatPack) => {
    const newItem: CartItem = {
      id: `cart-pack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      beatTitle: pack.name,
      artworkUrl: pack.artworkUrl,
      licenseName: 'Beat Pack Full License',
      price: pack.price,
      isBeatPack: true,
      beatPackId: pack.id,
    };
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleRecordSale = (newSales: SaleRecord[]) => {
    setSalesRecords((prev) => [...newSales, ...prev]);
    newSales.forEach((sale) => {
      logAudienceEvent({
        type: 'purchase_completed',
        title: `Beat License Purchased`,
        details: `${sale.beatTitle} (${sale.licenseType}) purchased for $${sale.amount.toFixed(2)} - Order #${sale.orderId}`,
        beatTitle: sale.beatTitle,
        amount: sale.amount,
      });
    });
  };

  const handleLeadCaptured = (email: string, beat: Beat) => {
    const newLead: FreeDownloadLead = {
      id: `lead-${Date.now()}`,
      email,
      beatId: beat.id,
      beatTitle: beat.title,
      downloadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ipCountry: 'United States 🇺🇸',
    };
    setLeads((prev) => [newLead, ...prev]);

    logAudienceEvent({
      type: 'free_download',
      title: `Free Demo Downloaded`,
      details: `${beat.title} tagged demo downloaded by ${email}`,
      beatId: beat.id,
      beatTitle: beat.title,
    });

    setBeats((prev) =>
      prev.map((b) => (b.id === beat.id ? { ...b, downloadCount: b.downloadCount + 1 } : b))
    );

    // Dispatch automated download receipt email
    fetch('/api/gmail/send-automated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'receipt',
        recipient: email,
        payload: {
          artist_name: email.split('@')[0],
          product_title: beat.title,
          download_url: beat.iaUrl || beat.audioUrl || `${window.location.origin}/api/media/${beat.id}?token=CK-LEAD-${Date.now()}`,
          license_terms: 'Free Non-Commercial Lease'
        }
      })
    }).catch(err => console.error('Automated download receipt error:', err));
  };

  // Dashboard catalog management
  const handleUpdateBeat = (updatedBeat: Beat) => {
    setBeats((prev) => prev.map((b) => (b.id === updatedBeat.id ? updatedBeat : b)));
    if (currentBeat?.id === updatedBeat.id) {
      setCurrentBeat(updatedBeat);
    }
    // Dynamic Cart Alignment: Keep cart metadata synchronized when editing
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.beatId === updatedBeat.id) {
          const tierKey = item.licenseKey;
          let tierPrice = updatedBeat.pricing.mp3Lease;
          if (tierKey === 'premiumLease') tierPrice = updatedBeat.pricing.premiumLease;
          if (tierKey === 'unlimited') tierPrice = updatedBeat.pricing.unlimited;
          if (tierKey === 'exclusive') tierPrice = updatedBeat.pricing.exclusive;

          return {
            ...item,
            beatTitle: updatedBeat.title,
            artworkUrl: updatedBeat.artworkUrl,
            price: tierPrice,
            bpm: updatedBeat.bpm,
            key: updatedBeat.key,
            genre: updatedBeat.genre,
          };
        }
        return item;
      })
    );

    // Persist changes to server-side JSON storage
    fetch(`/api/beats/${updatedBeat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBeat),
    })
    .then((r) => r.json())
    .then((data) => {
      console.log('[Backend Sync] Beat successfully updated in server-side store:', data);
    })
    .catch((err) => console.error('[Backend Sync] Beat update failed:', err));
  };

  const handleUpdateBeatPrice = (beatId: string, newPrice: number) => {
    setBeats((prev) =>
      prev.map((b) => {
        if (b.id === beatId) {
          const updated = { ...b, price: newPrice, pricing: { ...b.pricing, mp3Lease: newPrice } };
          if (currentBeat?.id === beatId) {
            setCurrentBeat(updated);
          }
          // Persist price update to backend
          fetch(`/api/beats/${beatId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: newPrice, pricing: { ...b.pricing, mp3Lease: newPrice } }),
          })
          .then((r) => r.json())
          .then((data) => console.log('[Backend Sync] Price updated successfully:', data))
          .catch((err) => console.error('[Backend Sync] Price update failed:', err));

          return updated;
        }
        return b;
      })
    );
    // Align cart item price for mp3 lease
    setCart((prev) =>
      prev.map((item) =>
        item.beatId === beatId && item.licenseKey === 'mp3Lease' ? { ...item, price: newPrice } : item
      )
    );
  };

  const handleToggleFreeDownload = (beatId: string, free: boolean) => {
    setBeats((prev) =>
      prev.map((b) => {
        if (b.id === beatId) {
          const updated = { ...b, freeDownload: free, free_download: free };
          if (currentBeat?.id === beatId) {
            setCurrentBeat(updated);
          }
          // Persist free download setting to backend
          fetch(`/api/beats/${beatId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freeDownload: free, free_download: free }),
          })
          .then((r) => r.json())
          .then((data) => console.log('[Backend Sync] Free download updated successfully:', data))
          .catch((err) => console.error('[Backend Sync] Free download update failed:', err));

          return updated;
        }
        return b;
      })
    );
  };

  const handleDeleteBeat = (beatId: string) => {
    setBeats((prev) => {
      const remaining = prev.filter((b) => b.id !== beatId);
      // Graceful Audio Fallback: Switch track cleanly if the playing track is deleted
      if (currentBeat?.id === beatId) {
        if (remaining.length > 0) {
          setCurrentBeat(remaining[0]);
          setIsPlaying(false);
        } else {
          setCurrentBeat(null);
          setIsPlaying(false);
        }
      }
      return remaining;
    });
    // Remove from cart when beat is deleted from catalog
    setCart((prev) => prev.filter((item) => item.beatId !== beatId));

    // Persist deletion to backend
    fetch(`/api/beats/${beatId}`, {
      method: 'DELETE',
    })
    .then((r) => r.json())
    .then((data) => {
      console.log('[Backend Sync] Beat deleted successfully:', data);
    })
    .catch((err) => console.error('[Backend Sync] Delete failed:', err));
  };

  const handleDuplicateBeat = (beatId: string) => {
    const original = beats.find((b) => b.id === beatId);
    if (!original) return;
    const newId = `beat-dup-${Date.now()}`;
    const duplicated: Beat = {
      ...original,
      id: newId,
      title: `${original.title} (COPY)`,
      featured: false,
      playCount: 0,
      downloadCount: 0,
      likeCount: 0,
      releaseDate: new Date().toISOString().split('T')[0],
      isNew: true,
    };

    setBeats((prev) => {
      const index = prev.findIndex((b) => b.id === beatId);
      const updated = [...prev];
      updated.splice(index + 1, 0, duplicated);
      return updated;
    });

    // Create the duplicate on the backend
    fetch('/api/beats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicated),
    })
    .then(() => {
      // Send a PATCH with pricing and metadata to fully synchronize duplicated information
      fetch(`/api/beats/${newId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
    })
    .catch((err) => console.error('[Backend Sync] Duplicate failed:', err));
  };

  const handleAddPromotion = (promo: Promotion) => {
    setPromotions((prev) => [promo, ...prev]);
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePublishBeat = (newBeat: Beat) => {
    setBeats((prev) => [newBeat, ...prev]);
    setCurrentBeat(newBeat);
    setIsPlaying(true);

    // Send visible customer notification if preferences allow
    try {
      const savedPrefs = localStorage.getItem('voodoo_notification_prefs');
      const prefs = savedPrefs ? JSON.parse(savedPrefs) : { newBeats: true, beatPurchases: true, beatPacks: true, announcements: true };
      if (prefs.newBeats) {
        showLocalNotification(
          'NEW CASHMERE KID$ BEAT',
          `A new beat just dropped: ${newBeat.title}`,
          `/?beat=${newBeat.id}`
        );
      }
    } catch (e) {
      console.error('[App] New beat notification exception:', e);
    }
  };

  const handleNavigateWithGenre = (view: string, genreFilter?: string) => {
    if (genreFilter) setInitialGenreFilter(genreFilter);
    else setInitialGenreFilter('ALL');
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishedBeats = beats.filter((b) => b.published !== false);
  const producerTotalStreams = beats.reduce((sum, b) => sum + (b.playCount || 0), 0);
  const recentlyViewedBeats = publishedBeats.filter((b) => recentlyViewedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Feature 49: Live Store Mode Rendering */}
      {isLiveStoreMode && (
        <LiveStoreModeBar
          deviceMode={liveStoreDeviceMode}
          setDeviceMode={setLiveStoreDeviceMode}
          onExitLiveMode={() => setIsLiveStoreMode(false)}
          onEditStore={() => {
            setCurrentView('dashboard');
            setIsLiveStoreMode(false);
          }}
        />
      )}

      {/* Main Responsive Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isLiveStoreMode ? (liveStoreDeviceMode === 'mobile' ? 'max-w-[390px] border-x border-zinc-800 mx-auto w-full shadow-2xl my-4 rounded-3xl overflow-hidden' : liveStoreDeviceMode === 'tablet' ? 'max-w-[768px] border-x border-zinc-800 mx-auto w-full shadow-2xl my-4 rounded-3xl overflow-hidden' : 'w-full') : 'w-full'}`}>
        
        {!isLiveStoreMode && (
          <Header
            currentView={currentView}
            setCurrentView={(view) => handleNavigateWithGenre(view)}
            cart={cart}
            setIsCartOpen={setIsCartOpen}
            currencySymbol={settings.currencySymbol}
            onOpenAudioPlayer={() => setAudioPlayerExpandTrigger((prev) => prev + 1)}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
          />
        )}
        
        {/* Main View Container */}
        <main className={`flex-1 ${!isLiveStoreMode ? 'w-full px-4 sm:px-6 lg:px-10 pt-6' : 'w-full'}`}>
        {currentView === 'home' && (
          <HomeView
            beats={publishedBeats}
            collections={collections}
            profile={profile}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={handleViewDetailWithHistory}
            onNavigate={handleNavigateWithGenre}
            currencySymbol={settings.currencySymbol}
            youtubeVideos={youtubeVideos}
            onAddMerchToCart={handleAddMerchToCart}
            onAddBeatPackToCart={handleAddBeatPackToCart}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            recentlyViewedBeats={recentlyViewedBeats}
            beatPacks={beatPacks}
          />
        )}

        {currentView === 'player' && (
          <AudioPlayerView
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={handleViewDetailWithHistory}
            currencySymbol={settings.currencySymbol}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToBrowse={() => setCurrentView('browse')}
            onNavigateToUploader={() => setCurrentView('uploader')}
          />
        )}

        {currentView === 'youtube-videos' && (
          <YouTubeVideosView
            youtubeVideos={youtubeVideos}
            profile={profile}
            onOpenDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'browse' && (
          <BrowseView
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={handleViewDetailWithHistory}
            initialGenreFilter={initialGenreFilter}
            currencySymbol={settings.currencySymbol}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            profile={profile}
            salesRecords={salesRecords}
            currencySymbol={settings.currencySymbol}
            onNavigateToHallOfFame={() => handleNavigateWithGenre('hall-of-fame')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            beats={beats}
            salesRecords={salesRecords}
            leads={leads}
            promotions={promotions}
            settings={settings}
            onUpdateBeatPrice={handleUpdateBeatPrice}
            onToggleFreeDownload={handleToggleFreeDownload}
            onDeleteBeat={handleDeleteBeat}
            onDuplicateBeat={handleDuplicateBeat}
            onAddPromotion={handleAddPromotion}
            onDeletePromotion={handleDeletePromotion}
            onPublishBeat={handlePublishBeat}
            onUpdateBeat={handleUpdateBeat}
            onReorderBeats={setBeats}
            currencySymbol={settings.currencySymbol}
            profile={profile}
            onUpdateProfile={setProfile}
            youtubeVideos={youtubeVideos}
            onUpdateYoutubeVideos={setYoutubeVideos}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToBrowse={() => setCurrentView('browse')}
            onOpenAudioPlayer={() => setAudioPlayerExpandTrigger((prev) => prev + 1)}
            favoriteIds={favoriteIds}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            beatPacks={beatPacks}
            onUpdateBeatPacks={setBeatPacks}
            onNavigateToHallOfFame={() => handleNavigateWithGenre('hall-of-fame')}
            onEnterLiveMode={() => setIsLiveStoreMode(true)}
          />
        )}

        {currentView === 'hall-of-fame' && (
          <HallOfFameView
            producerTotalStreams={producerTotalStreams}
            onNavigateToBrowse={() => handleNavigateWithGenre('browse')}
          />
        )}

        {currentView === 'uploader' && (
          <UploaderView
            onPublishBeat={handlePublishBeat}
            onPublishBeatPack={(newPack) => {
              setBeatPacks((prev) => [newPack, ...prev]);
            }}
            onNavigateToBrowse={() => setCurrentView('browse')}
            onExitToDashboard={() => setCurrentView('dashboard')}
            currencySymbol={settings.currencySymbol}
            beats={beats}
            onSwitchToBeatPacks={() => setCurrentView('beatpacks')}
          />
        )}

        {currentView === 'search-by-sound' && (
          <SearchBySoundView
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            currencySymbol={settings.currencySymbol}
          />
        )}

        {currentView === 'feed' && (
          <BrowseView
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={handleViewDetailWithHistory}
            initialGenreFilter="ALL"
            currencySymbol={settings.currencySymbol}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {(currentView === 'charts' || currentView === 'top-rated') && (
          <TopChartsView
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={handleViewDetailWithHistory}
            currencySymbol={settings.currencySymbol}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'collections' && (
          <CollectionsView
            beats={publishedBeats}
            collections={collections}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onBuyClick={(beat) => setSelectedBuyBeat(beat)}
            onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
            onShareClick={(beat) => setSelectedShareBeat(beat)}
            onViewDetail={(beat) => setSelectedDetailBeat(beat)}
            currencySymbol={settings.currencySymbol}
          />
        )}

        {currentView === 'merch' && (
          <MerchView
            onNavigateToBrowse={() => handleNavigateWithGenre('browse')}
            onAddMerchToCart={handleAddMerchToCart}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentView === 'services' && (
          <ServicesView
            currencySymbol={settings.currencySymbol}
            onNavigateToBrowse={() => handleNavigateWithGenre('browse')}
            onAddToCart={handleAddMerchToCart}
          />
        )}

        {currentView === 'beatpacks' && (
          <BeatPacksView
            beatPacks={beatPacks}
            beats={publishedBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onAddBeatPackToCart={handleAddBeatPackToCart}
            currencySymbol={settings.currencySymbol}
            onLeadCaptured={handleLeadCaptured}
            onPlayBeatPack={handlePlayBeatPack}
            activeBeatPack={activeBeatPack}
          />
        )}

        {currentView === 'checkout-result' && (
          <CheckoutResultView
            onClearCart={() => setCart([])}
            onRecordSale={(records) => setSalesRecords((prev) => [...records, ...prev])}
            onNavigateToStore={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('browse');
            }}
            currencySymbol={settings.currencySymbol}
          />
        )}
      </main>
    </div>

      {/* Site-Wide Luxury Footer */}
      <footer className="border-t border-zinc-900 bg-black py-14 px-4 sm:px-6 lg:px-10 mt-20 mb-20 text-xs text-zinc-400 w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-900">
          {/* Col 1: Brand & Kicker */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-white text-lg tracking-widest uppercase">
                CASHMERE KID$
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-xs">
              Beats for artists who refuse to sound ordinary. Custom analog sound design, high-fashion trap production, and instant digital licensing.
            </p>
          </div>

          {/* Col 2: Vault Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-purple-300">Vault Navigation</h4>
            <ul className="space-y-1.5 font-medium text-xs">
              <li><button onClick={() => handleNavigateWithGenre('browse')} className="hover:text-white transition-colors">Beats Catalog</button></li>
              <li><button onClick={() => handleNavigateWithGenre('charts')} className="hover:text-white transition-colors">Top Charts & Featured</button></li>
              <li><button onClick={() => handleNavigateWithGenre('collections')} className="hover:text-white transition-colors">Curated Collections</button></li>
              <li><button onClick={() => handleNavigateWithGenre('search-by-sound')} className="hover:text-white transition-colors">Search By Sound</button></li>
              <li><button onClick={() => handleNavigateWithGenre('services')} className="hover:text-white transition-colors font-bold text-purple-300">Bespoke Audio Services</button></li>
              <li><button onClick={() => handleNavigateWithGenre('merch')} className="hover:text-white transition-colors">Apparel & Merch</button></li>
            </ul>
          </div>

          {/* Col 3: Brand & Studio */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-purple-300">Brand & Studio</h4>
            <ul className="space-y-1.5 font-medium text-xs">
              <li><button onClick={() => handleNavigateWithGenre('profile')} className="hover:text-white transition-colors">Producer Profile & Vision</button></li>
              <li><button onClick={() => handleNavigateWithGenre('youtube-videos')} className="hover:text-white text-red-400 font-bold transition-colors">YouTube Studio Videos</button></li>
              <li><button onClick={() => handleNavigateWithGenre('hall-of-fame')} className="text-purple-300 hover:text-white transition-colors font-bold">Record Plaque Hall of Fame</button></li>
              <li><button onClick={() => handleNavigateWithGenre('profile')} className="hover:text-white transition-colors">Book Custom Production</button></li>
              <li><button onClick={() => handleNavigateWithGenre('dashboard')} className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Producer Studio Portal</button></li>
            </ul>
          </div>

          {/* Col 4: Store Policies */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-purple-300">Store Policies & Terms</h4>
            <ul className="space-y-1.5 font-medium text-xs">
              <li><button onClick={() => setActivePolicyModal('licensing')} className="hover:text-white transition-colors">Licensing Policy & Tiers</button></li>
              <li><button onClick={() => setActivePolicyModal('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => setActivePolicyModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setActivePolicyModal('refunds')} className="hover:text-white transition-colors">Refund & Download Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="w-full pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <span>© {new Date().getFullYear()} CASHMERE KID$. All rights reserved.</span>
          <span className="text-zinc-600">Executive Sound Architecture · Los Angeles / Atlanta</span>
        </div>
      </footer>

      {/* Store Policy Modal */}
      <PolicyModal policyType={activePolicyModal} onClose={() => setActivePolicyModal(null)} />

      {/* Waveform Music Player */}
      <WaveformPlayer
        currentBeat={currentBeat}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onPrev={handlePrevBeat}
        onNext={handleNextBeat}
        onBuyClick={(beat) => setSelectedBuyBeat(beat)}
        onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
        onShareClick={(beat) => setSelectedShareBeat(beat)}
        currencySymbol={settings.currencySymbol}
        beats={publishedBeats}
        onPlayToggle={handlePlayToggle}
        externalExpandTrigger={audioPlayerExpandTrigger}
        activeBeatPack={activeBeatPack}
        beatPackTrackIndex={beatPackTrackIndex}
        onNextBeatPackTrack={handleNextBeatPackTrack}
        onExitBeatPackMode={handleExitBeatPackMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Beat Product Detail Modal */}
      <BeatDetailModal
        beat={selectedDetailBeat}
        beats={publishedBeats}
        isOpen={!!selectedDetailBeat}
        isPlaying={isPlaying}
        isCurrent={currentBeat?.id === selectedDetailBeat?.id}
        onClose={() => setSelectedDetailBeat(null)}
        onPlayToggle={handlePlayToggle}
        onBuyClick={(beat) => setSelectedBuyBeat(beat)}
        onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
        onShareClick={(beat) => setSelectedShareBeat(beat)}
        currencySymbol={settings.currencySymbol}
        isFavorite={selectedDetailBeat ? favoriteIds.includes(selectedDetailBeat.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* License Modal */}
      <LicenseModal
        beat={selectedBuyBeat}
        isOpen={!!selectedBuyBeat}
        onClose={() => setSelectedBuyBeat(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onFreeDownloadClick={(beat) => setSelectedFreeBeat(beat)}
        currencySymbol={settings.currencySymbol}
      />

      {/* Direct Buy Now Checkout Modal */}
      <DirectCheckoutModal
        beat={directCheckoutBeat}
        selectedLicenseKey={directCheckoutLicenseKey}
        isOpen={!!directCheckoutBeat}
        onClose={() => setDirectCheckoutBeat(null)}
        onRecordSale={handleRecordSale}
        currencySymbol={settings.currencySymbol}
      />

      {/* Free Download Modal */}
      <FreeDownloadModal
        beat={selectedFreeBeat}
        isOpen={!!selectedFreeBeat}
        onClose={() => setSelectedFreeBeat(null)}
        onLeadCaptured={handleLeadCaptured}
      />

      {/* Share Modal */}
      <ShareModal
        beat={selectedShareBeat}
        isOpen={!!selectedShareBeat}
        onClose={() => setSelectedShareBeat(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        beats={beats}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onUpdateCartItemLicense={handleUpdateCartItemLicense}
        onRecordSale={handleRecordSale}
        currencySymbol={settings.currencySymbol}
      />

      {/* Customer Notification Opt-in Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}
