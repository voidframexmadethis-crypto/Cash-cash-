import React, { useState } from 'react';
import { X, Check, ShieldCheck, ShoppingBag, LayoutGrid, Table, Zap, Download, Sparkles, FileText } from 'lucide-react';
import { Beat, LicenseTierKey } from '../types';
import { LICENSE_TIERS } from '../utils/licenseInfo';

interface LicenseModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (beat: Beat, licenseKey: LicenseTierKey) => void;
  onBuyNow?: (beat: Beat, licenseKey: LicenseTierKey) => void;
  onFreeDownloadClick?: (beat: Beat) => void;
  currencySymbol: string;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  beat,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onFreeDownloadClick,
  currencySymbol,
}) => {
  const [selectedLicenseKey, setSelectedLicenseKey] = useState<LicenseTierKey>('mp3Lease');
  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');

  if (!isOpen || !beat) return null;

  const licenseKeys: LicenseTierKey[] = ['mp3Lease', 'premiumLease', 'unlimited', 'exclusive'];

  const getBeatPriceForTier = (tierKey: LicenseTierKey) => {
    switch (tierKey) {
      case 'mp3Lease':
        return beat.pricing.mp3Lease;
      case 'premiumLease':
        return beat.pricing.premiumLease;
      case 'unlimited':
        return beat.pricing.unlimited;
      case 'exclusive':
        return beat.pricing.exclusive;
      default:
        return beat.pricing.mp3Lease;
    }
  };

  const currentTierPrice = getBeatPriceForTier(selectedLicenseKey);
  const currentTier = LICENSE_TIERS[selectedLicenseKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden max-h-[92vh] flex flex-col text-left font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={beat.artworkUrl}
              alt={beat.title}
              className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shadow-md shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
              }}
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                CHOOSE LICENSE AGREEMENT
              </span>
              <h3 className="text-lg font-black text-white truncate">{beat.title}</h3>
              <div className="text-xs text-zinc-400 font-mono">
                PROD. {beat.producerName || 'CASHMERE KID$'} · {beat.bpm} BPM · {beat.key} · {beat.genre}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'comparison'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Full Matrix</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Download Notice Banner */}
        {beat.freeDownload && (
          <div className="bg-gradient-to-r from-purple-950/80 via-zinc-900 to-purple-950/80 border-b border-purple-500/30 px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Free Non-Commercial Tagged Demo MP3 is authorized by the producer for this beat.</span>
            </div>
            {onFreeDownloadClick && (
              <button
                onClick={() => {
                  onClose();
                  onFreeDownloadClick(beat);
                }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download Free</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licenseKeys.map((key) => {
                const tier = LICENSE_TIERS[key];
                const price = getBeatPriceForTier(key);
                const isSelected = selectedLicenseKey === key;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedLicenseKey(key)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-950/60 ring-1 ring-purple-500'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-full shadow-md">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-base text-white">{tier.name}</h4>
                        <span className="font-mono text-xl font-black text-purple-300">
                          {currencySymbol}{price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{tier.description}</p>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs text-zinc-300 font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Audio Format:</span>
                          <span className="font-semibold text-white">{tier.format}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Audio Streams:</span>
                          <span className="font-semibold text-purple-300">{tier.audioStreams}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Music Videos:</span>
                          <span className="font-medium">{tier.videoStreams}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Track Stems:</span>
                          <span className={`font-bold ${tier.stemsIncluded ? 'text-purple-400' : 'text-zinc-500'}`}>
                            {tier.stemsIncluded ? 'INCLUDED (WAV STEMS)' : 'Not Included'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Radio Airplay:</span>
                          <span className="font-medium text-zinc-300">{tier.radioStations}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-purple-300 flex items-center gap-1.5 font-bold' : 'text-zinc-500'}>
                        {isSelected ? <Check className="w-4 h-4 text-purple-400" /> : null}
                        {isSelected ? 'Selected License' : 'Click to select option'}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                        {tier.royaltySplit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Full Comparison Matrix View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {licenseKeys.map((key) => {
                  const tier = LICENSE_TIERS[key];
                  const price = getBeatPriceForTier(key);
                  const isSelected = selectedLicenseKey === key;

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedLicenseKey(key)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/50 border-purple-500 shadow-lg ring-1 ring-purple-500'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-purple-400 uppercase">{key}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <h4 className="font-extrabold text-sm text-white mt-1">{tier.name}</h4>
                      <div className="font-mono text-lg font-black text-purple-300 mt-1">
                        {currencySymbol}{price.toFixed(2)}
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-[11px] text-zinc-300">
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Audio File</div>
                          <div className="font-semibold text-white">{tier.format}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Streaming Limit</div>
                          <div className="font-semibold text-purple-300">{tier.audioStreams}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Video Rights</div>
                          <div>{tier.videoStreams}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Radio Stations</div>
                          <div>{tier.radioStations}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Track Stems</div>
                          <div className={tier.stemsIncluded ? 'text-purple-400 font-bold' : 'text-zinc-500'}>
                            {tier.stemsIncluded ? 'Yes (WAV Stems)' : 'No'}
                          </div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[10px] uppercase font-bold">Royalties</div>
                          <div className="text-purple-300 font-bold">{tier.royaltySplit}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-zinc-950 border border-purple-500/20 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>TRANSPARENT ROYALTY SPLITS & DIRECT PRODUCER CONTRACT DELIVERY</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Every beat purchase grants defined digital rights according to the selected tier agreement. Audio files (tagless high-bitrate masters) and official PDF contracts are delivered immediately upon verified PayPal checkout.
            </p>
          </div>
        </div>

        {/* Modal Footer with TWO primary actions: Buy Now (1-Click) & Add to Cart */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Selected Tier Total:</span>
            <div className="text-2xl font-mono font-black text-white">
              {currencySymbol}{currentTierPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Action 1: Add to Cart */}
            <button
              onClick={() => {
                onAddToCart(beat, selectedLicenseKey);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              <span>Add to Cart</span>
            </button>

            {/* Action 2: Buy Now (1-Click Direct Purchase) */}
            <button
              onClick={() => {
                if (onBuyNow) {
                  onBuyNow(beat, selectedLicenseKey);
                } else {
                  onAddToCart(beat, selectedLicenseKey);
                }
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-950/80 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Buy Now ({currencySymbol}{currentTierPrice.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
