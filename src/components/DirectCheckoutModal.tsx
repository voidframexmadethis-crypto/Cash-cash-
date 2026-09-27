import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, ShoppingBag, Sparkles, Tag, ArrowRight, Wallet, CheckCircle, AlertCircle, Music } from 'lucide-react';
import { Beat, CartItem, LicenseTierKey, SaleRecord } from '../types';
import { LICENSE_TIERS } from '../utils/licenseInfo';

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
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLicenseKey(selectedLicenseKey);
  }, [selectedLicenseKey]);

  if (!isOpen || !beat) return null;

  const tier = LICENSE_TIERS[currentLicenseKey] || LICENSE_TIERS.mp3Lease;
  let basePrice = beat.pricing?.mp3Lease ?? LICENSE_TIERS.mp3Lease.price;
  if (currentLicenseKey === 'premiumLease') basePrice = beat.pricing?.premiumLease ?? LICENSE_TIERS.premiumLease.price;
  if (currentLicenseKey === 'unlimited') basePrice = beat.pricing?.unlimited ?? LICENSE_TIERS.unlimited.price;
  if (currentLicenseKey === 'exclusive') basePrice = beat.pricing?.exclusive ?? LICENSE_TIERS.exclusive.price;

  const discountAmount = basePrice * appliedDiscount;
  const total = Math.max(0, basePrice - discountAmount);

  const handlePayPalDirectSuccess = (details: any) => {
    setCheckoutStatus('succeeded');
    onRecordSale([{
      id: `sale-${Date.now()}`,
      orderId: details.id || `CK-${Math.random()}`,
      customerName: 'VIP Artist',
      customerEmail: 'client@paypal.com',
      beatTitle: beat.title,
      licenseType: tier.name,
      amount: total,
      date: new Date().toISOString(),
      status: 'Completed',
    }]);
    setTimeout(() => {
        window.location.href = `/checkout/result?status=success`;
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
    const status = document.getElementById("paypal-status");
    if (status) status.textContent = "Loading checkout...";

    // Load PayPal script only when Buy is clicked
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&components=buttons';
    script.async = true;
    script.onload = () => {
        // Initialize buttons
        if (window.paypal && window.paypal.Buttons) {
            window.paypal.Buttons({
                createOrder: async () => {
                    const res = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            beatId: beat.id,
                            price: total
                        }),
                    });
                    if (!res.ok) throw new Error('Failed to create order');
                    const data = await res.json();
                    if (!data.id) throw new Error("PayPal did not return an order ID");
                    return data.id;
                },
                onApprove: async (data: any) => {
                    if (status) status.textContent = "Completing payment...";
                    const res = await fetch('/api/paypal/capture-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderID: data.orderID, beatId: beat.id }),
                    });
                    const result = await res.json();
                    if (!res.ok || !result.success) throw new Error(result.error || 'Payment capture failed');
                    
                    if (status) status.textContent = "Payment successful. Your beat is ready.";
                    handlePayPalDirectSuccess(result);
                },
                onError: (err: any) => {
                    setCheckoutStatus('failed');
                    if (status) status.textContent = "PayPal checkout could not be completed.";
                    setCheckoutError('Payment failed. Please try again.');
                }
            }).render(paypalContainerRef.current);
        }
    };
    script.onerror = () => {
        setCheckoutStatus('failed');
        if (status) status.textContent = "Checkout could not be loaded.";
        setCheckoutError('PayPal SDK failed to load.');
    };
    document.body.appendChild(script);
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
                let p = beat.pricing?.mp3Lease ?? LICENSE_TIERS.mp3Lease.price;
                if (key === 'premiumLease') p = beat.pricing?.premiumLease ?? LICENSE_TIERS.premiumLease.price;
                if (key === 'unlimited') p = beat.pricing?.unlimited ?? LICENSE_TIERS.unlimited.price;
                if (key === 'exclusive') p = beat.pricing?.exclusive ?? LICENSE_TIERS.exclusive.price;
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

          {/* PayPal Container */}
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
            <div id="paypal-status" className="text-xs text-zinc-400 font-mono my-2 text-center"></div>
            <div ref={paypalContainerRef} className="w-full pt-1" />
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
