import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { WaveformPlayer } from './components/WaveformPlayer';
import { LicenseModal } from './components/LicenseModal';
import { FreeDownloadModal } from './components/FreeDownloadModal';
import { ShareModal } from './components/ShareModal';
import { BeatDetailModal } from './components/BeatDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PolicyModal } from './components/PolicyModal';

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
    return saved ? JSON.parse(saved) : INITIAL_BEATS;
  });

  const [collections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('voodoo_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  const [profile, setProfile] = useState<ProducerProfile>(() => {
    const saved = localStorage.getItem('voodoo_profile');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCER_PROFILE;
  });

  const [youtubeVideos, setYoutubeVideos] = useState(() => {
    const saved = localStorage.getItem('voodoo_youtube_videos');
    return saved ? JSON.parse(saved) : [
      {
        id: 'video-1',
        youtubeId: 'M6fF8q-1S8o',
        title: 'VALENTINO VELVET — BEAT VISUALIZER (4K EDITORIAL)',
        category: 'OFFICIAL VISUALIZER',
        duration: '2:48',
        description: 'The cinematic visual companion to Valentino Velvet. Experience the custom lighting sequences and modular synth layers in ultra high definition.',
        thumbnail: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg'
      },
      {
        id: 'video-2',
        youtubeId: 'PZJ5xU7_XGg',
        title: 'ANALOG DRUM MACHINE & MODULAR SYNTH SESSION',
        category: 'STUDIO LIVE',
        duration: '4:15',
        description: 'Watch Cashmere Kid$ build the core melodic pads and aggressive sliding bass sequences live in the Los Angeles warehouse studio.',
        thumbnail: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'
      },
      {
        id: 'video-3',
        youtubeId: '5N6g9C8mSdg',
        title: 'TOKYO NIGHTHAWK — PRODUCER WALKTHROUGH',
        category: 'EXECUTIVE SCORE Deep Dive',
        duration: '3:30',
        description: 'An executive deep-dive into the master MIDI layers, sound design, vocal tags, and sub-bass templates powering Tokyo Nighthawk.',
        thumbnail: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg'
      }
    ];
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
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [settings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('voodoo_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('voodoo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [beatPacks, setBeatPacks] = useState<BeatPack[]>(() => {
    const saved = localStorage.getItem('voodoo_beat_packs');
    return saved ? JSON.parse(saved) : INITIAL_BEAT_PACKS;
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

  // Modals & Drawers State
  const [audioPlayerExpandTrigger, setAudioPlayerExpandTrigger] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedBuyBeat, setSelectedBuyBeat] = useState<Beat | null>(null);
  const [selectedFreeBeat, setSelectedFreeBeat] = useState<Beat | null>(null);
  const [selectedShareBeat, setSelectedShareBeat] = useState<Beat | null>(null);
  const [selectedDetailBeat, setSelectedDetailBeat] = useState<Beat | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'licensing' | 'refunds' | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('voodoo_beats', JSON.stringify(beats));
  }, [beats]);

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
    setFavoriteIds((prev) =>
      prev.includes(beat.id) ? prev.filter((id) => id !== beat.id) : [...prev, beat.id]
    );
  };

  const handleViewDetailWithHistory = (beat: Beat) => {
    setSelectedDetailBeat(beat);
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== beat.id);
      return [beat.id, ...filtered].slice(0, 10);
    });
  };

  // Deep-linking parsing on mount
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

  // Audio Controls
  const handlePlayToggle = (beat: Beat) => {
    if (currentBeat?.id === beat.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
    }
  };

  const handlePrevBeat = () => {
    if (!currentBeat) return;
    const currentIndex = beats.findIndex((b) => b.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + beats.length) % beats.length;
    setCurrentBeat(beats[prevIndex]);
    setIsPlaying(true);
  };

  const handleNextBeat = () => {
    if (!currentBeat) return;
    const currentIndex = beats.findIndex((b) => b.id === currentBeat.id);
    const nextIndex = (currentIndex + 1) % beats.length;
    setCurrentBeat(beats[nextIndex]);
    setIsPlaying(true);
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

    setBeats((prev) =>
      prev.map((b) => (b.id === beat.id ? { ...b, downloadCount: b.downloadCount + 1 } : b))
    );
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
  };

  const handleUpdateBeatPrice = (beatId: string, newPrice: number) => {
    setBeats((prev) =>
      prev.map((b) => {
        if (b.id === beatId) {
          const updated = { ...b, pricing: { ...b.pricing, mp3Lease: newPrice } };
          if (currentBeat?.id === beatId) {
            setCurrentBeat(updated);
          }
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
          const updated = { ...b, freeDownload: free };
          if (currentBeat?.id === beatId) {
            setCurrentBeat(updated);
          }
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
  };

  const handleDuplicateBeat = (beatId: string) => {
    setBeats((prev) => {
      const original = prev.find((b) => b.id === beatId);
      if (!original) return prev;
      const duplicated: Beat = {
        ...original,
        id: `beat-dup-${Date.now()}`,
        title: `${original.title} (COPY)`,
        featured: false,
        playCount: 0,
        downloadCount: 0,
        likeCount: 0,
        releaseDate: new Date().toISOString().split('T')[0],
        isNew: true,
      };
      const index = prev.findIndex((b) => b.id === beatId);
      const updated = [...prev];
      updated.splice(index + 1, 0, duplicated);
      return updated;
    });
  };

  const handleAddPromotion = (promo: Promotion) => {
    setPromotions((prev) => [promo, ...prev]);
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePublishBeat = (newBeat: Beat) => {
    setBeats((prev) => [newBeat, ...prev]);
  };

  const handleNavigateWithGenre = (view: string, genreFilter?: string) => {
    if (genreFilter) setInitialGenreFilter(genreFilter);
    else setInitialGenreFilter('ALL');
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishedBeats = beats.filter((b) => b.published !== false);
  const recentlyViewedBeats = publishedBeats.filter((b) => recentlyViewedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => handleNavigateWithGenre(view)}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        currencySymbol={settings.currencySymbol}
        onOpenAudioPlayer={() => setAudioPlayerExpandTrigger((prev) => prev + 1)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
            beatPacks={beatPacks}
            onUpdateBeatPacks={setBeatPacks}
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

        {currentView === 'charts' && (
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
          />
        )}
      </main>

      {/* Site-Wide Luxury Footer */}
      <footer className="border-t border-zinc-900 bg-black py-14 px-4 sm:px-6 lg:px-8 mt-20 mb-20 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-900">
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
              <li><button onClick={() => handleNavigateWithGenre('merch')} className="hover:text-white transition-colors">Apparel & Merch</button></li>
            </ul>
          </div>

          {/* Col 3: Brand & Studio */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-purple-300">Brand & Studio</h4>
            <ul className="space-y-1.5 font-medium text-xs">
              <li><button onClick={() => handleNavigateWithGenre('profile')} className="hover:text-white transition-colors">Producer Profile & Vision</button></li>
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

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
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
      />

      {/* License Modal */}
      <LicenseModal
        beat={selectedBuyBeat}
        isOpen={!!selectedBuyBeat}
        onClose={() => setSelectedBuyBeat(null)}
        onAddToCart={handleAddToCart}
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
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onRecordSale={handleRecordSale}
        currencySymbol={settings.currencySymbol}
      />
    </div>
  );
}
