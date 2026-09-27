import React, { useState } from 'react';
import { ShoppingBag, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Star, Disc } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface MerchViewProps {
  onNavigateToBrowse: () => void;
  onAddMerchToCart: (merchItem: { id: string; title: string; price: number; artworkUrl: string; size?: string }) => void;
}

interface MerchProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  artworkUrl: string;
  hasSizes: boolean;
  tag: string;
  specs: string[];
}

export const MerchView: React.FC<MerchViewProps> = ({ onNavigateToBrowse, onAddMerchToCart }) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  const products: MerchProduct[] = [];

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: MerchProduct) => {
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

  return (
    <div className="space-y-16 py-8 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Editorial Header Block */}
      <div className="relative rounded-3xl overflow-hidden bg-black p-8 sm:p-14 border border-zinc-900 text-center space-y-6 shadow-2xl relative">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center grayscale filter contrast-125" style={{ backgroundImage: `url('/src/assets/images/cashmere_hero_runway_1790419818906.jpg')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-purple-950/20" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>CASHMERE KID$ BOUTIQUE APPAREL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-brand uppercase leading-none">
            THE PHYSICAL COLLECTION
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Bespoke studio garments, NFC-enabled techwear, and luxury collector LPs. Every piece in Drop 01 is strictly limited to 100 units worldwide. No restocks.
          </p>
        </div>
      </div>

      {/* Boutique Product Showcase Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product) => {
            const isAdded = addedItemIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 flex flex-col group shadow-xl"
              >
                {/* Product Artwork Block */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
                  <img
                    src={product.artworkUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Premium Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-bold uppercase text-purple-300 tracking-wider">
                    {product.tag}
                  </div>

                  {/* Price Display */}
                  <div className="absolute bottom-4 right-4 bg-purple-600/90 backdrop-blur-md text-white font-mono font-black text-lg px-4 py-1.5 rounded-xl shadow-lg border border-purple-400/30">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                {/* Product Details Block */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-brand font-black text-xl text-white group-hover:text-purple-300 transition-colors tracking-tight leading-snug">
                      {product.title}
                    </h3>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      {product.description}
                    </p>

                    {/* Specs Bullets */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Selectors & Cart CTA */}
                  <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                    {product.hasSizes && (
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-500 font-bold uppercase">Select Size</span>
                        <div className="flex gap-2 font-mono">
                          {['S', 'M', 'L', 'XL'].map((sz) => (
                            <button
                              key={sz}
                              onClick={() => handleSizeChange(product.id, sz)}
                              className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center transition-all ${
                                selectedSizes[product.id] === sz
                                  ? 'bg-purple-600 text-white border-purple-400 font-black scale-105'
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
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
                      className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ADDED TO VAULT CART</span>
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
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="NO MERCHANDISE AVAILABLE YET"
          description="Cashmere Kid$ has not published any physical apparel or vinyl pressings to the boutique yet."
          actionLabel="Return to Beats Catalog"
          onAction={onNavigateToBrowse}
        />
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Premium Security</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Bespoke secure packaging. Fully insured global air parcel shipping with live status tracking.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <Star className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Handcrafted Quality</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Every custom silhouette is cut, sewn, and printed locally with 100% organic cotton materials.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center space-y-2 shadow-lg">
          <Disc className="w-6 h-6 text-purple-400 mx-auto" />
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Tap NFC Stem Technology</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Apparel includes microchips loaded with uncompressed 24-bit studio stems of the vault catalog.</p>
        </div>
      </div>
    </div>
  );
};
