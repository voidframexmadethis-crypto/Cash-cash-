import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ShoppingBag, Sparkles, Tag, ArrowRight, Wallet, CheckCircle, AlertCircle, Music } from 'lucide-react';
import { Beat, CartItem, LicenseTierKey, SaleRecord } from '../types';
import { LICENSE_TIERS } from '../utils/licenseInfo';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface DirectCheckoutModalProps {
  beat: Beat | null;
  selectedLicenseKey: LicenseTierKey;
  isOpen: boolean;
  onClose: () => void;
  onRecordSale: (newSales: SaleRecord[]) => void;
  currencySymbol: string;
}

export const DirectCheckoutModal: React.FC<DirectCheckoutModalProps> = ({
  beat,
  selectedLicenseKey,
  isOpen,
  onClose,
  onRecordSale,
  currencySymbol,
}) => {
  const [currentLicenseKey, setCurrentLicenseKey] = useState<LicenseTierKey>(selectedLicenseKey);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [usePayPalSDK, setUsePayPalSDK] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    setCurrentLicenseKey(selectedLicenseKey);
  }, [selectedLicenseKey]);

  useEffect(() => {
    if (usePayPalSDK && !paypalLoaded) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&components=buttons';
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [usePayPalSDK, paypalLoaded]);

  if (!isOpen || !beat) return null;

  const tier = LICENSE_TIERS[currentLicenseKey] || LICENSE_TIERS.mp3Lease;
  let basePrice = beat.pricing.mp3Lease;
  if (currentLicenseKey === 'premiumLease') basePrice = beat.pricing.premiumLease;
  if (currentLicenseKey === 'unlimited') basePrice = beat.pricing.unlimited;
  if (currentLicenseKey === 'exclusive') basePrice = beat.pricing.exclusive;

  const discountAmount = basePrice * appliedDiscount;
  const total = Math.max(0, basePrice - discountAmount);

  // Render in-modal PayPal buttons
  useEffect(() => {
    if (paypalLoaded && usePayPalSDK && checkoutStatus === 'idle') {
      const timer = setTimeout(() => {
        const container = document.getElementById('direct-paypal-button-container');
        if (container) {
          container.innerHTML = '';
          if (window.paypal && window.paypal.Buttons) {
            window.paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: total.toFixed(2),
                      currency_code: 'USD',
                    },
                    description: `CASHMERE KID$ - ${beat.title} (${tier.name})`,
                  }],
                });
              },
              onApprove: (data: any, actions: any) => {
                return actions.order.capture().then((details: any) => {
                  handlePayPalDirectSuccess(details);
                });
              },
              onError: (err: any) => {
                setCheckoutStatus('failed');
                setCheckoutError('PayPal Secure Transaction was rejected or cancelled.');
              },
            }).render('#direct-paypal-button-container');
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [paypalLoaded, usePayPalSDK, checkoutStatus, total, currentLicenseKey, beat]);

  const handlePayPalDirectSuccess = (details: any) => {
    setCheckoutStatus('processing');
    const generatedId = details.id || `CK-${Math.floor(10000 + Math.random() * 90000)}`;
    const payerName = details.payer?.name?.given_name || 'VIP Artist';
    const payerEmail = details.payer?.email_address || 'client@paypal.com';

    const newRecord: SaleRecord = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: generatedId,
      customerName: payerName,
      customerEmail: payerEmail,
      beatTitle: beat.title,
      licenseType: tier.name,
      amount: total,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
    };

    onRecordSale([newRecord]);
    setCheckoutStatus('succeeded');

    // Trigger instant verified checkout receipt redirect
    setTimeout(() => {
      window.location.href = `/checkout/result?status=success&order_id=${generatedId}`;
    }, 800);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'CASHMERE50' || cleanCode === 'VOODOOVIP') {
      setAppliedDiscount(0.5);
      setPromoMessage('50% OFF Cashmere VIP Discount Applied!');
      setCheckoutError(null);
    } else if (cleanCode === 'VIPFREE') {
      setAppliedDiscount(1.0);
      setPromoMessage('100% OFF Producer Pass Applied!');
      setCheckoutError(null);
    } else {
      setPromoMessage('Invalid promo code');
    }
  };

  const handleProceedToPayPal = async () => {
    setCheckoutStatus('processing');
    setCheckoutError(null);

    const singleCartItem: CartItem = {
      id: `direct-${Date.now()}`,
      beatId: beat.id,
      beatTitle: beat.title,
      artworkUrl: beat.artworkUrl,
      licenseKey: currentLicenseKey,
      licenseName: tier.name,
      price: basePrice,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
    };

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: [singleCartItem],
          discount: appliedDiscount,
          promoCode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Order initiation failed (HTTP ${res.status}).`);
      }

      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.message || 'Failed to retrieve PayPal gateway redirect URL.');
      }
    } catch (err: any) {
      console.error('[DirectCheckoutModal] Exception:', err);
      setCheckoutStatus('failed');
      setCheckoutError(err.message || 'Payment initiation failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden max-h-[92vh] flex flex-col text-left font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-extrabold text-base text-white tracking-wide uppercase">
              ⚡ BUY NOW — DIRECT CHECKOUT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Beat Summary Card */}
          <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center gap-3.5">
            <img
              src={beat.artworkUrl}
              alt={beat.title}
              className="w-14 h-14 rounded-xl object-cover border border-purple-500/30 shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                  {beat.genre}
                </span>
              </div>
              <h4 className="font-black text-base text-white truncate">{beat.title}</h4>
              <p className="text-xs text-zinc-400 font-mono">
                {beat.bpm} BPM · {beat.key} · PROD. {beat.producerName || 'CASHMERE KID$'}
              </p>
            </div>
          </div>

          {/* License Selection Dropdown / Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Selected License Agreement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['mp3Lease', 'premiumLease', 'unlimited', 'exclusive'] as LicenseTierKey[]).map((key) => {
                const t = LICENSE_TIERS[key];
                let p = beat.pricing.mp3Lease;
                if (key === 'premiumLease') p = beat.pricing.premiumLease;
                if (key === 'unlimited') p = beat.pricing.unlimited;
                if (key === 'exclusive') p = beat.pricing.exclusive;
                const isSelected = currentLicenseKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCurrentLicenseKey(key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-white truncate">{t.name}</span>
                    </div>
                    <div className="font-mono text-sm font-extrabold text-purple-300 mt-1">
                      {currencySymbol}{p.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{t.format}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* License Rights Highlights */}
          <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-purple-300 font-bold border-b border-purple-500/20 pb-1.5">
              <span>{tier.name} Rights Included</span>
              <span className="font-mono">{tier.royaltySplit}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 font-sans">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Audio Streams</span>
                <span className="font-semibold text-white">{tier.audioStreams}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Music Videos</span>
                <span className="font-semibold text-white">{tier.videoStreams}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Master Stems</span>
                <span className={tier.stemsIncluded ? 'text-purple-400 font-bold' : 'text-zinc-400'}>
                  {tier.stemsIncluded ? 'Included (WAV Stems)' : 'MP3 Master Audio'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Radio Airplay</span>
                <span className="font-semibold text-white">{tier.radioStations}</span>
              </div>
            </div>
          </div>

          {/* Promo Code Input */}
          <div>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Discount code (e.g. CASHMERE50)"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </form>
            {promoMessage && (
              <p className={`text-xs mt-1 font-medium ${appliedDiscount > 0 ? 'text-purple-300' : 'text-red-400'}`}>
                {promoMessage}
              </p>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>License Base Price:</span>
              <span className="font-mono text-zinc-200">{currencySymbol}{basePrice.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-purple-300 font-medium">
                <span>VIP Promo Discount ({appliedDiscount * 100}%):</span>
                <span className="font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Escrow & Transfer Fee:</span>
              <span className="font-mono text-emerald-400 font-bold">$0.00 (NO HIDDEN FEES)</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-white pt-2 border-t border-zinc-850">
              <span>Total Amount Due:</span>
              <span className="font-mono text-purple-300 text-lg">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Error Banner */}
          {checkoutStatus === 'failed' && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{checkoutError || 'Payment initialization error. Please retry.'}</span>
            </div>
          )}

          {/* Real PayPal Gateway Actions */}
          <div className="space-y-3">
            <button
              onClick={handleProceedToPayPal}
              disabled={checkoutStatus === 'processing'}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checkoutStatus === 'processing' ? (
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              <span>Complete Payment with PayPal ({currencySymbol}{total.toFixed(2)})</span>
            </button>

            {!usePayPalSDK ? (
              <button
                onClick={() => setUsePayPalSDK(true)}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Or Render In-Page PayPal Buttons
              </button>
            ) : !paypalLoaded ? (
              <div className="py-2.5 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-800 border-t-yellow-400 animate-spin" />
                <span>Connecting PayPal Gateway...</span>
              </div>
            ) : (
              <div id="direct-paypal-button-container" className="w-full pt-1" />
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>256-bit Encrypted Checkout · Instant Audio Stems & Contract Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
