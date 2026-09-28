import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, Sparkles, CheckCircle, Tag, ArrowRight, Wallet, ChevronDown, RotateCcw, AlertCircle } from 'lucide-react';
import { Beat, CartItem, LicenseTierKey, SaleRecord } from '../types';
import { LICENSE_TIERS } from '../utils/licenseInfo';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  beats?: Beat[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onUpdateCartItemLicense?: (cartItemId: string, newLicenseKey: LicenseTierKey, newPrice: number) => void;
  onRecordSale: (newSales: SaleRecord[]) => void;
  currencySymbol: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  beats = [],
  onRemoveFromCart,
  onClearCart,
  onUpdateCartItemLicense,
  onRecordSale,
  currencySymbol,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isCheckoutCompleted, setIsCheckoutCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // PayPal Payment Connection States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const cartPaypalContainerRef = useRef<HTMLDivElement>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  // Synchronize cart with sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('cashmere_cart_session', JSON.stringify(cart));
    } catch {}
  }, [cart]);

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
      setPromoMessage('Invalid coupon code');
    }
  };

  // Fetch PayPal Client Config when entering payment step
  useEffect(() => {
    if (!isOpen || checkoutStep !== 'payment') return;

    fetch('/api/paypal/client-id')
      .then((res) => res.json())
      .then(({ clientId, mode }) => {
        setPaypalMode(mode || (clientId === 'sb' ? 'sandbox' : 'live'));
        const scriptId = 'paypal-sdk-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId || 'sb'}&currency=USD&components=buttons`;
          script.async = true;
          script.onload = () => setPaypalLoaded(true);
          script.onerror = () => {
            setPaypalLoaded(false);
            setCheckoutError('Could not load PayPal Payment Gateway SDK.');
          };
          document.body.appendChild(script);
        } else {
          setPaypalLoaded(true);
        }
      })
      .catch((err) => {
        console.error('[CartDrawer] PayPal Client ID fetch error:', err);
        setCheckoutError('PayPal payment gateway is currently unavailable.');
      });
  }, [isOpen, checkoutStep]);

  // Render PayPal Smart Payment Buttons
  useEffect(() => {
    if (!isOpen || checkoutStep !== 'payment' || !paypalLoaded || total <= 0) return;

    const timer = setTimeout(() => {
      if (cartPaypalContainerRef.current && window.paypal && window.paypal.Buttons) {
        cartPaypalContainerRef.current.innerHTML = '';
        try {
          window.paypal.Buttons({
            createOrder: async () => {
              setCheckoutStatus('processing');
              setCheckoutError(null);

              const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cart,
                  discount: appliedDiscount,
                  promoCode,
                }),
              });

              const data = await res.json();
              if (!res.ok || (!data.id && !data.orderId)) {
                throw new Error(data.error || 'Failed to create PayPal order.');
              }
              return data.id || data.orderId;
            },
            onApprove: async (data: any) => {
              setCheckoutStatus('processing');
              try {
                const captureRes = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderID: data.orderID, cart }),
                });

                const captureData = await captureRes.json();

                if (captureRes.ok && captureData.status === 'COMPLETED') {
                  handlePayPalSuccess(captureData);
                } else {
                  setCheckoutStatus('failed');
                  setCheckoutError(captureData.error || 'Payment capture failed or was declined by PayPal.');
                }
              } catch (err: any) {
                setCheckoutStatus('failed');
                setCheckoutError('An error occurred while confirming payment with PayPal.');
              }
            },
            onCancel: () => {
              setCheckoutStatus('idle');
              setCheckoutError('PayPal payment was cancelled. You have not been charged.');
            },
            onError: (err: any) => {
              console.error('[CartDrawer] PayPal button error:', err);
              setCheckoutStatus('failed');
              setCheckoutError('PayPal transaction error or payment declined. Please try again.');
            },
          }).render(cartPaypalContainerRef.current);
        } catch (e) {
          console.error('[CartDrawer] Buttons render error:', e);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, checkoutStep, paypalLoaded, total, cart, appliedDiscount, promoCode]);

  const handlePayPalSuccess = (details: any) => {
    const generatedId = details.id || details.orderId || `CK-${Math.floor(10000 + Math.random() * 90000)}`;
    const payerName = details.payer?.name?.given_name || 'VIP Artist';
    const payerEmail = details.payer?.email_address || 'client@paypal.com';

    // Record verified sales into state
    const newRecords: SaleRecord[] = cart.map((item) => ({
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: generatedId,
      customerName: payerName,
      customerEmail: payerEmail,
      beatTitle: item.beatTitle,
      licenseType: item.licenseName,
      amount: item.price * (1 - appliedDiscount),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
    }));

    onRecordSale(newRecords);
    setOrderId(generatedId);
    setCheckoutStatus('succeeded');
    setIsCheckoutCompleted(true);
  };

  const handleSimulateSandboxCheckout = () => {
    setCheckoutStatus('processing');
    setCheckoutError(null);
    setTimeout(() => {
      handlePayPalSuccess({
        id: `ORD-DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        payer: {
          name: { given_name: 'Demo VIP Artist' },
          email_address: 'demo-buyer@cashmerekid.com'
        }
      });
    }, 1000);
  };

  const handleOpenPayPalWindow = async () => {
    setCheckoutStatus('processing');
    setCheckoutError(null);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          discount: appliedDiscount,
          promoCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        setCheckoutStatus('failed');
        setCheckoutError('Could not initialize PayPal payment order.');
        return;
      }

      const generatedOrderId = data.id || data.orderId;
      const approvalUrl = data.approvalUrl || (
        paypalMode === 'live'
          ? `https://www.paypal.com/checkoutnow?token=${generatedOrderId}`
          : `https://www.sandbox.paypal.com/checkoutnow?token=${generatedOrderId}`
      );

      // Open official PayPal checkout window
      const popup = window.open(approvalUrl, 'PayPalCheckout', 'width=520,height=720');

      if (!popup) {
        window.location.href = approvalUrl;
        return;
      }

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          fetch('/api/paypal/verify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: generatedOrderId })
          })
            .then((r) => r.json())
            .then((ver) => {
              if (ver.verified) {
                handlePayPalSuccess(ver);
              } else if (ver.status === 'CANCELLED') {
                setCheckoutStatus('idle');
                setCheckoutError('PayPal payment was cancelled. You have not been charged.');
              } else {
                setCheckoutStatus('idle');
                setCheckoutError('PayPal checkout window closed before payment was completed.');
              }
            })
            .catch(() => {
              setCheckoutStatus('idle');
              setCheckoutError('PayPal checkout window closed without completing payment.');
            });
        }
      }, 1000);

    } catch (err: any) {
      setCheckoutStatus('failed');
      setCheckoutError('Failed to establish connection with PayPal gateway.');
    }
  };

  // Helper to change license tier directly inside cart
  const handleChangeItemLicense = (cartItemId: string, newKey: LicenseTierKey) => {
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) return;

    const matchedBeat = beats.find((b) => b.id === item.beatId);
    const tier = LICENSE_TIERS[newKey];
    let newPrice = tier.price;

    if (matchedBeat) {
      if (newKey === 'mp3Lease') newPrice = matchedBeat.pricing?.mp3Lease ?? LICENSE_TIERS.mp3Lease.price;
      if (newKey === 'premiumLease') newPrice = matchedBeat.pricing?.premiumLease ?? LICENSE_TIERS.premiumLease.price;
      if (newKey === 'unlimited') newPrice = matchedBeat.pricing?.unlimited ?? LICENSE_TIERS.unlimited.price;
      if (newKey === 'exclusive') newPrice = matchedBeat.pricing?.exclusive ?? LICENSE_TIERS.exclusive.price;
    }

    if (onUpdateCartItemLicense) {
      onUpdateCartItemLicense(cartItemId, newKey, newPrice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-purple-500/30 shadow-2xl flex flex-col justify-between text-left font-sans">
          
          {/* Cart Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-lg text-white">Your Beat Cart</h3>
              <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {cart.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && !isCheckoutCompleted && (
                <button
                  onClick={onClearCart}
                  className="px-2.5 py-1 text-[11px] font-bold text-zinc-400 hover:text-red-400 bg-zinc-950 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Clear Cart"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {checkoutStatus === 'processing' ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  PAYPAL GATEWAY CONNECTION
                </span>
                <h4 className="font-brand font-black text-white text-base">AUTHORIZING PAYMENT...</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Connecting to PayPal for secure authorization and transaction processing.
                </p>
              </div>
            </div>
          ) : !isCheckoutCompleted ? (
            cart.length > 0 ? (
              checkoutStep === 'cart' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                  
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const matchedBeat = beats.find((b) => b.id === item.beatId);

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2.5 relative group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.artworkUrl}
                              alt={item.beatTitle}
                              className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                              }}
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">{item.beatTitle}</h4>
                              <div className="flex items-center gap-2 text-xs text-purple-300 font-medium">
                                <span>{item.licenseName}</span>
                                {!item.isMerch && item.bpm && (
                                  <>
                                    <span>·</span>
                                    <span className="font-mono">{item.bpm} BPM</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-mono font-bold text-sm text-white">
                                {currencySymbol}{item.price.toFixed(2)}
                              </div>
                              <button
                                onClick={() => onRemoveFromCart(item.id)}
                                className="text-xs text-zinc-500 hover:text-red-400 mt-1 transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="Remove beat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* In-Cart License Tier Switcher */}
                          {!item.isMerch && !item.isBeatPack && (
                            <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2 text-xs">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Tier:</span>
                              <select
                                value={item.licenseKey || 'mp3Lease'}
                                onChange={(e) => handleChangeItemLicense(item.id, e.target.value as LicenseTierKey)}
                                className="bg-zinc-900 border border-zinc-800 text-purple-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                              >
                                <option value="mp3Lease">
                                  MP3 Lease ({currencySymbol}{(matchedBeat?.pricing?.mp3Lease || LICENSE_TIERS.mp3Lease.price).toFixed(2)})
                                </option>
                                <option value="premiumLease">
                                  Premium M4A ({currencySymbol}{(matchedBeat?.pricing?.premiumLease || LICENSE_TIERS.premiumLease.price).toFixed(2)})
                                </option>
                                <option value="unlimited">
                                  Unlimited Stems ({currencySymbol}{(matchedBeat?.pricing?.unlimited || LICENSE_TIERS.unlimited.price).toFixed(2)})
                                </option>
                                <option value="exclusive">
                                  Exclusive Rights ({currencySymbol}{(matchedBeat?.pricing?.exclusive || LICENSE_TIERS.exclusive.price).toFixed(2)})
                                </option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-3 border-t border-zinc-800">
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Coupon code (e.g. CASHMERE50)"
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
                      <p className={`text-xs mt-1.5 font-medium ${appliedDiscount > 0 ? 'text-purple-300' : 'text-red-400'}`}>
                        {promoMessage}
                      </p>
                    )}
                  </div>

                  {/* Trust & Guarantee Box */}
                  <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Instant Master Audio & PDF License Delivery</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      PDF license agreements and studio audio files are unlocked immediately upon confirmed payment.
                    </p>
                  </div>
                </div>
              ) : (
                /* Payment Gateway Selection Step */
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  <div className="space-y-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl animate-fadeIn">
                    
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                        PayPal Payment Gateway
                      </h4>
                      <button
                        onClick={() => setCheckoutStep('cart')}
                        className="text-xs text-purple-400 hover:text-white font-bold cursor-pointer"
                      >
                        ← Back to Cart
                      </button>
                    </div>

                    {/* Environment Indicator Badge */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold">
                      <span className="text-zinc-400 uppercase">Environment:</span>
                      {paypalMode === 'sandbox' ? (
                        <span className="text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                          [PAYPAL SANDBOX TEST MODE]
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                          [PAYPAL LIVE PRODUCTION GATEWAY]
                        </span>
                      )}
                    </div>

                    {/* Error Banner */}
                    {checkoutError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    {/* PayPal Commerce Gateway */}
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">Pay with PayPal</span>
                        <Wallet className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                        Clicking below opens the official PayPal authorization window for real payment confirmation.
                      </p>

                      {/* Rendered PayPal Smart Buttons Container */}
                      <div ref={cartPaypalContainerRef} className="w-full min-h-[45px]" />

                      <button
                        onClick={handleOpenPayPalWindow}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Open PayPal Checkout Window ({currencySymbol}{total.toFixed(2)})</span>
                      </button>

                      {paypalMode === 'sandbox' && (
                        <button
                          type="button"
                          onClick={handleSimulateSandboxCheckout}
                          disabled={checkoutStatus !== 'idle'}
                          className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-purple-400 hover:text-purple-300 font-extrabold text-xs uppercase tracking-widest rounded-xl border border-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>Direct Sandbox Fast Checkout (Simulate Purchase)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-base text-white tracking-widest uppercase">
                  YOUR CART IS EMPTY
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Browse our catalog of luxury Cashmere Kid$ instrumentals and select a license to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Return to Beat Catalog
                </button>
              </div>
            )
          ) : (
            /* Checkout Success Receipt */
            <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center text-center justify-center space-y-4 font-sans">
              <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-950/80">
                <CheckCircle className="w-9 h-9 text-purple-400" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  PURCHASE COMPLETE & VERIFIED
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Payment Confirmed!</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">Order Ref: #{orderId}</p>
              </div>

              <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Purchased Master Items</div>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-zinc-200 py-1 border-b border-zinc-900">
                    <span className="font-bold truncate max-w-[240px]">
                      {item.beatTitle} ({item.licenseName})
                    </span>
                    <span className="font-mono text-purple-300 shrink-0">
                      {currencySymbol}{(item.price * (1 - appliedDiscount)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    const blob = new Blob(
                      [`CASHMERE KID$ OFFICIAL LICENSE RECEIPT #${orderId}\nBuyer Items:\n${cart.map((c) => `- ${c.beatTitle} (${c.licenseName}) - $${c.price}`).join('\n')}\nTotal Paid: $${total.toFixed(2)}\nDate: ${new Date().toISOString()}`],
                      { type: 'text/plain' }
                    );
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `CASHMERE_KIDS_LICENSE_${orderId}.txt`;
                    a.click();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Download Stems & PDF License Contract</span>
                </button>

                <button
                  onClick={() => {
                    onClearCart();
                    setIsCheckoutCompleted(false);
                    setCheckoutStatus('idle');
                    setCheckoutStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}

          {/* Cart Footer */}
          {checkoutStatus === 'idle' && cart.length > 0 && !isCheckoutCompleted && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
              <div className="space-y-2 text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex justify-between">
                  <span>License Base Subtotal:</span>
                  <span className="font-mono text-zinc-200">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-purple-300 font-medium">
                    <span>VIP Promo Discount ({appliedDiscount * 100}%):</span>
                    <span className="font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-extrabold text-white pt-2 border-t border-zinc-800">
                  <span>Total Due:</span>
                  <span className="font-mono text-purple-300 text-base">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                <button
                  onClick={() => setCheckoutStep('payment')}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-950/80 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Checkout Now ({currencySymbol}{total.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
