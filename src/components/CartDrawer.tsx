import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, Sparkles, CheckCircle, Tag, ArrowRight, Wallet } from 'lucide-react';
import { CartItem, SaleRecord } from '../types';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onRecordSale: (newSales: SaleRecord[]) => void;
  currencySymbol: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  onRecordSale,
  currencySymbol,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // e.g. 0.5 for 50%
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isCheckoutCompleted, setIsCheckoutCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // PayPal Payment Connection States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [usePayPalSDK, setUsePayPalSDK] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'CASHMERE50' || cleanCode === 'VOODOOVIP') {
      setAppliedDiscount(0.5);
      setPromoMessage('50% OFF Cashmere Discount Applied!');
      setCheckoutError(null);
    } else if (cleanCode === 'VIPFREE') {
      setAppliedDiscount(1.0);
      setPromoMessage('100% OFF Pass Applied!');
      setCheckoutError(null);
    } else if (cleanCode === 'FAIL') {
      setPromoMessage('Escrow failure simulator code loaded');
    } else {
      setPromoMessage('Invalid coupon code');
    }
  };

  // Dynamic PayPal SDK Script Injection
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

  // Render PayPal Smart Buttons on container element
  useEffect(() => {
    if (paypalLoaded && usePayPalSDK && checkoutStep === 'payment') {
      const timer = setTimeout(() => {
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = ''; // clear previous rendering
          if (window.paypal && window.paypal.Buttons) {
            window.paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: total.toFixed(2),
                      currency_code: 'USD'
                    },
                    description: `CASHMERE KID$ VAULT ORDER - Beat & Merch Licensing`
                  }]
                });
              },
              onApprove: (data: any, actions: any) => {
                return actions.order.capture().then((details: any) => {
                  handlePayPalSuccess(details);
                });
              },
              onError: (err: any) => {
                setCheckoutStatus('failed');
                setCheckoutError('PayPal Secure Transaction was rejected or cancelled.');
              }
            }).render('#paypal-button-container');
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [paypalLoaded, usePayPalSDK, checkoutStep, total]);

  const handlePayPalSuccess = (details: any) => {
    setCheckoutStatus('processing');
    const generatedId = details.id || `CK-${Math.floor(10000 + Math.random() * 90000)}`;
    const payerName = details.payer?.name?.given_name || 'VIP Artist';
    const payerEmail = details.payer?.email_address || 'client@paypal.com';

    // Record real sales into state / localStorage!
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

  const handleCheckout = async () => {
    setCheckoutStatus('processing');
    setCheckoutError(null);

    try {
      if (promoCode.trim().toUpperCase() === 'FAIL') {
        throw new Error('Simulated network gateway timeout. Settle transaction rejected.');
      }

      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          discount: appliedDiscount,
          promoCode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server order creation failed (HTTP ${res.status}).`);
      }

      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.message || 'Failed to retrieve checkout approval URL.');
      }
    } catch (err: any) {
      console.error('[CartDrawer] Exception executing checkout:', err);
      setCheckoutStatus('failed');
      setCheckoutError(err.message || 'Checkout execution failed.');
    }
  };

  const handlePayPalHostedCheckout = async () => {
    await handleCheckout();
  };



  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-purple-500/30 shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-lg text-white">Your Beat Cart</h3>
              <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                {cart.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {checkoutStatus === 'processing' ? (
            /* Secure Escrow Processing State */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">SECURE GATEWAY INTENT</span>
                <h4 className="font-brand font-black text-white text-base">AUTHORIZING TRANSACTION</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Securing high-definition digital stems and provisioning license agreements. Do not close this window.
                </p>
              </div>
            </div>
          ) : checkoutStatus === 'failed' ? (
            /* Secure Escrow Failed State with Try Again Action */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
                <X className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-white text-base">Checkout Authorization Rejected</h4>
                <p className="text-xs text-red-300 bg-red-950/20 border border-red-500/20 p-3 rounded-xl max-w-xs leading-relaxed font-mono">
                  {checkoutError}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Tip: Remove "FAIL" coupon or enter a valid payment format to retry.
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Retry Secure Checkout
              </button>
            </div>
          ) : !isCheckoutCompleted ? (
            cart.length > 0 ? (
              checkoutStep === 'cart' ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl relative group"
                      >
                        <img
                          src={item.artworkUrl}
                          alt={item.beatTitle}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-500/20"
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
                            className="text-xs text-zinc-500 hover:text-red-400 mt-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-4 border-t border-zinc-800">
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Coupon code (e.g. VOODOOVIP)"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
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

                  {/* Guarantees */}
                  <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Instant Master Audio Delivery</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      PDF license contract agreements and high quality audio files will be instantly downloadable upon checkout completion.
                    </p>
                  </div>
                </div>
              ) : (
                /* Payment Gateway Selection Step */
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="space-y-4 bg-zinc-950 border border-zinc-850 p-5 rounded-2xl animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Select Secure Gateway</h4>
                      <button
                        onClick={() => {
                          setCheckoutStep('cart');
                          setUsePayPalSDK(false);
                        }}
                        className="text-xs text-purple-400 hover:text-white font-bold"
                      >
                        ← Back to Cart
                      </button>
                    </div>

                    <div className="space-y-4">


                      {/* PayPal Commerce Gateway */}
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">PayPal Checkout</span>
                          <Wallet className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                          Secure PayPal hosted checkout with environment-aware return verification.
                        </p>
                        
                        <button
                          onClick={handlePayPalHostedCheckout}
                          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Proceed to PayPal Checkout</span>
                        </button>

                        {!usePayPalSDK ? (
                          <button
                            onClick={() => setUsePayPalSDK(true)}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                          >
                            <span>Or Use In-Page PayPal Buttons</span>
                          </button>
                        ) : !paypalLoaded ? (
                          <div className="py-2.5 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-800 border-t-yellow-400 animate-spin" />
                            <span>Connecting PayPal SDK...</span>
                          </div>
                        ) : (
                          <div id="paypal-button-container" className="w-full pt-1" />
                        )}
                      </div>

                      {/* Direct Card Simulator Gateway */}
                      <div className="p-4 bg-zinc-900/60 border border-zinc-805 rounded-xl space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">Direct Card Simulator</span>
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                          Simulate credit card escrow clearing in 1-click without connecting private account credentials.
                        </p>
                        <button
                          onClick={handleCheckout}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer"
                        >
                          Simulate Card Payout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-base text-white tracking-widest">YOUR CART IS EMPTY</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Browse our catalog of luxury Cashmere Kid$ instrumentals and select a license to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Return to Beat Catalog
                </button>
              </div>
            )
          ) : (
            /* Checkout Success Receipt */
            <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center text-center justify-center space-y-4 font-sans">
              <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-950/80">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">ORDER CONFIRMED</span>
                <h3 className="text-2xl font-black text-white mt-1">Payment Successful!</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">Order Ref: #{orderId}</p>
              </div>

              <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Purchased Items</div>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-zinc-200 py-1 border-b border-zinc-900">
                    <span className="font-bold truncate max-w-[240px]">{item.beatTitle} ({item.licenseName})</span>
                    <span className="font-mono text-purple-300 shrink-0">{currencySymbol}{(item.price * (1 - appliedDiscount)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    const blob = new Blob([`CASHMERE KID$ LICENSE RECEIPT #${orderId}\nBeats: ${cart.map(c => c.beatTitle).join(', ')}`], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `CASHMERE_KIDS_LICENSE_${orderId}.txt`;
                    a.click();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Download Stems & License Contract</span>
                </button>

                <button
                  onClick={() => {
                    onClearCart();
                    setIsCheckoutCompleted(false);
                    setCheckoutStatus('idle');
                    setCheckoutStep('cart');
                    setUsePayPalSDK(false);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}

          {/* Cart Footer */}
          {checkoutStatus === 'idle' && cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
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
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Processing & Escrow Fee:</span>
                  <span className="font-mono text-emerald-400 font-bold">$0.00 (NO HIDDEN FEES)</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Estimated Tax:</span>
                  <span className="font-mono text-zinc-400">$0.00 (INCLUDED)</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-zinc-800">
                  <span>Total Due:</span>
                  <span className="font-mono text-purple-300 text-base">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                <button
                  onClick={() => setCheckoutStep('payment')}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-950/80 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Checkout Now</span>
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
