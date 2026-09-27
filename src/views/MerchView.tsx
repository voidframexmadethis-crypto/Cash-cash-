import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  Disc,
  ExternalLink,
  Globe,
  Lock,
  X,
  Link,
  Maximize2,
  Check,
  Store,
  Plus,
  Trash2,
  Tag
} from 'lucide-react';
import { StoreSettings } from '../types';

interface MerchViewProps {
  onNavigateToBrowse: () => void;
  onAddMerchToCart: (merchItem: { id: string; title: string; price: number; artworkUrl: string; size?: string }) => void;
  settings?: StoreSettings;
  onUpdateSettings?: (newSettings: StoreSettings) => void;
}

export interface CustomMerchItem {
  id: string;
  title: string;
  price: number;
  description: string;
  artworkUrl: string;
  hasSizes: boolean;
  tag?: string;
}

export const MerchView: React.FC<MerchViewProps> = ({
  onNavigateToBrowse,
  onAddMerchToCart,
  settings,
  onUpdateSettings
}) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  
  // Custom user uploaded merch products
  const [customProducts, setCustomProducts] = useState<CustomMerchItem[]>(() => {
    const saved = localStorage.getItem('voodoo_custom_merch_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal to add new custom merch item
  const [isAddMerchModalOpen, setIsAddMerchModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newArtworkUrl, setNewArtworkUrl] = useState('');
  const [newHasSizes, setNewHasSizes] = useState(true);
  const [newTag, setNewTag] = useState('');

  // External Merch Store URL state & popup modal
  const [merchUrlInput, setMerchUrlInput] = useState<string>(() => {
    return settings?.merchStoreUrl || localStorage.getItem('voodoo_merch_store_url') || '';
  });
  const [activeMerchUrl, setActiveMerchUrl] = useState<string>(() => {
    return settings?.merchStoreUrl || localStorage.getItem('voodoo_merch_store_url') || '';
  });
  
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [isPopupStoreOpen, setIsPopupStoreOpen] = useState<boolean>(false);
  const [isEmbedLockedIn, setIsEmbedLockedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('voodoo_merch_embed_locked');
    return saved !== null ? saved === 'true' : true; // Default locked in if URL exists
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    if (settings?.merchStoreUrl) {
      setActiveMerchUrl(settings.merchStoreUrl);
      setMerchUrlInput(settings.merchStoreUrl);
    }
  }, [settings?.merchStoreUrl]);

  const saveCustomProducts = (products: CustomMerchItem[]) => {
    setCustomProducts(products);
    localStorage.setItem('voodoo_custom_merch_items', JSON.stringify(products));
  };

  const handleCreateMerchItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    const newItem: CustomMerchItem = {
      id: `custom-merch-${Date.now()}`,
      title: newTitle.trim().toUpperCase(),
      price: parseFloat(newPrice) || 0,
      description: newDesc.trim() || 'Official producer merch item.',
      artworkUrl: newArtworkUrl.trim() || '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
      hasSizes: newHasSizes,
      tag: newTag.trim() || 'OFFICIAL MERCH'
    };

    const updated = [newItem, ...customProducts];
    saveCustomProducts(updated);

    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewArtworkUrl('');
    setNewTag('');
    setIsAddMerchModalOpen(false);
  };

  const handleDeleteMerchItem = (id: string) => {
    const updated = customProducts.filter(p => p.id !== id);
    saveCustomProducts(updated);
  };

  const handleSaveMerchUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let formattedUrl = merchUrlInput.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setActiveMerchUrl(formattedUrl);
    localStorage.setItem('voodoo_merch_store_url', formattedUrl);

    if (settings && onUpdateSettings) {
      onUpdateSettings({ ...settings, merchStoreUrl: formattedUrl });
    }

    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
    setIsUrlModalOpen(false);
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: CustomMerchItem) => {
    const size = product.hasSizes ? selectedSizes[product.id] || 'M' : undefined;
    onAddMerchToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      artworkUrl: product.artworkUrl,
      size: size
    });

    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const toggleLockInEmbed = () => {
    const nextVal = !isEmbedLockedIn;
    setIsEmbedLockedIn(nextVal);
    localStorage.setItem('voodoo_merch_embed_locked', nextVal ? 'true' : 'false');
  };

  return (
    <div className="space-y-10 py-8 pb-32 w-full px-2 font-sans text-left">
      
      {/* Editorial Header Block */}
      <div className="relative rounded-3xl overflow-hidden bg-black p-8 sm:p-14 border border-zinc-900 text-center space-y-6 shadow-2xl">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center filter contrast-125"
          style={{ backgroundImage: `url('/src/assets/images/cashmere_hero_runway_1790419818906.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-purple-950/30" />
        
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>CASHMERE KID$ BOUTIQUE APPAREL & MERCH</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight font-brand uppercase leading-none">
            MERCH STOREFRONT
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Connect your Shopify, Printful, or custom merch link, or upload your custom merch drops.
          </p>

          {/* Action Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {activeMerchUrl ? (
              <button
                onClick={() => setIsPopupStoreOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950/80 transition-all cursor-pointer flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-purple-200" />
                <span>LAUNCH MERCH POP-UP STOREFRONT</span>
                <Maximize2 className="w-3.5 h-3.5 ml-1 opacity-80" />
              </button>
            ) : null}

            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="px-5 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-purple-500/30 text-purple-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Link className="w-4 h-4 text-purple-400" />
              <span>{activeMerchUrl ? 'EDIT MERCH STORE URL' : 'ADD MERCH STORE URL'}</span>
            </button>

            <button
              onClick={() => setIsAddMerchModalOpen(true)}
              className="px-5 py-3.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-purple-300" />
              <span>UPLOAD NEW MERCH DROP</span>
            </button>
          </div>

          {activeMerchUrl && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate max-w-xs">{activeMerchUrl}</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">STORE URL ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Store Frame View (When Store URL configured) */}
      {activeMerchUrl && isEmbedLockedIn && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-zinc-950 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <span>OFFICIAL INTEGRATED MERCH STORE</span>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[9px] font-mono font-bold">LOCKED IN</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Live store frame connected to <span className="text-purple-300">{activeMerchUrl}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLockInEmbed}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
              >
                Show Uploaded Items ({customProducts.length})
              </button>
              <a
                href={activeMerchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>Open Direct</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="w-full aspect-[16/10] min-h-[600px] bg-zinc-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
            <iframe
              src={activeMerchUrl}
              title="Official Embedded Merch Store"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      )}

      {/* User Uploaded Custom Merch Showcase */}
      {(!activeMerchUrl || !isEmbedLockedIn) && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-brand">
                PRODUCER MERCH DROPS ({customProducts.length})
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Exclusive apparel and merch items added by the producer.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeMerchUrl && (
                <button
                  onClick={toggleLockInEmbed}
                  className="px-4 py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>SWITCH TO EMBEDDED STOREFRONT</span>
                </button>
              )}
              <button
                onClick={() => setIsAddMerchModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Merch Item</span>
              </button>
            </div>
          </div>

          {customProducts.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto">
                <ShoppingBag className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">NO MERCH DROPS PUBLISHED YET</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  You are the exclusive merchant for this store. Upload custom apparel drops or connect your external merch store URL above.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddMerchModalOpen(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                >
                  UPLOAD FIRST MERCH ITEM
                </button>
                <button
                  onClick={() => setIsUrlModalOpen(true)}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-xl cursor-pointer"
                >
                  CONNECT MERCH URL
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {customProducts.map((product) => {
                const isAdded = addedItemIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 flex flex-col group shadow-2xl"
                  >
                    {/* Artwork Block */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-b border-zinc-900">
                      <img
                        src={product.artworkUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {product.tag && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-bold uppercase text-purple-300 tracking-wider">
                          {product.tag}
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteMerchItem(product.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-black/80 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-4 right-4 bg-purple-600/90 backdrop-blur-md text-white font-mono font-black text-lg px-4 py-1.5 rounded-xl shadow-lg border border-purple-400/30">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Details Block */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-brand font-black text-xl text-white group-hover:text-purple-300 transition-colors tracking-tight leading-snug">
                          {product.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                          {product.description}
                        </p>
                      </div>

                      {/* Interactive Selectors & Cart CTA */}
                      <div className="space-y-4 pt-4 border-t border-zinc-900">
                        {product.hasSizes && (
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-zinc-500 font-bold uppercase">Select Size</span>
                            <div className="flex gap-2 font-mono">
                              {['S', 'M', 'L', 'XL'].map((sz) => (
                                <button
                                  key={sz}
                                  onClick={() => handleSizeChange(product.id, sz)}
                                  className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                    selectedSizes[product.id] === sz
                                      ? 'bg-purple-600 text-white border-purple-400 font-black scale-105'
                                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ADDED TO CART</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>ADD TO CART · ${product.price.toFixed(2)}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Producer Merchant Protection</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">100% verified artist storefront order tracking and instant digital invoice dispatch.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <Star className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Custom Garment Quality</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Hand-screened, heavyweight fabrics designed exclusively for music culture.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <Disc className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Instant Cart Integration</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Merch items bundle seamlessly with beat licenses in your store checkout.</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIGURE MERCH STORE URL                                        */}
      {/* ========================================================================= */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsUrlModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <Store className="w-3.5 h-3.5 text-purple-400" />
                <span>PRODUCER MERCH STORE URL</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                MERCH STORE LINK
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Connect your Printful, Shopify, Teespring, Big Cartel, or custom online store link.
              </p>
            </div>

            <form onSubmit={handleSaveMerchUrl} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Merch Storefront URL *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={merchUrlInput}
                    onChange={(e) => setMerchUrlInput(e.target.value)}
                    placeholder="https://yourstore.shopify.com or https://printful.me/cashmerekids"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {savedSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Merch Store URL saved and locked in!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-purple-200" />
                  <span>SAVE & LOCK IN URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD / ADD CUSTOM MERCH ITEM MODAL                             */}
      {/* ========================================================================= */}
      {isAddMerchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddMerchModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>PRODUCER MERCH CREATION</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                UPLOAD NEW MERCH ITEM
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Publish a custom apparel or merchandise product directly to your store catalog.
              </p>
            </div>

            <form onSubmit={handleCreateMerchItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase block">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CASHMERE VINTAGE TOUR HOODIE"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase block">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="45.00"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase block">Tag / Badge</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="LIMITED DROP"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase block">Artwork Image URL</label>
                <input
                  type="url"
                  value={newArtworkUrl}
                  onChange={(e) => setNewArtworkUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... or custom image URL"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase block">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Heavyweight cotton, vintage enzyme wash, limited edition..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasSizes"
                  checked={newHasSizes}
                  onChange={(e) => setNewHasSizes(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="hasSizes" className="text-xs font-bold text-zinc-300 cursor-pointer">
                  Includes Apparel Sizes (S, M, L, XL)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddMerchModalOpen(false)}
                  className="px-5 py-3 bg-zinc-900 text-zinc-400 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer"
                >
                  PUBLISH MERCH DROP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: POP-UP EMBEDDED MERCH STOREFRONT MODAL                            */}
      {/* ========================================================================= */}
      {isPopupStoreOpen && activeMerchUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-6xl h-[90vh] bg-zinc-950 border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            <div className="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Store className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider truncate flex items-center gap-2">
                    <span>POP-UP MERCH STOREFRONT</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">LIVE POPUP</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    {activeMerchUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeMerchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span className="hidden sm:inline">Open New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsPopupStoreOpen(false)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-black relative">
              <iframe
                src={activeMerchUrl}
                title="Pop-Up Merch Storefront"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
