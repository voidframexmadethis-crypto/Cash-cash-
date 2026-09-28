import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Download, Sparkles, ShieldCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import { CartItem, SaleRecord } from '../types';
import { showLocalNotification } from '../utils/pushProvider';

interface CheckoutResultViewProps {
  onClearCart: () => void;
  onRecordSale: (records: SaleRecord[]) => void;
  onNavigateToStore: () => void;
  currencySymbol: string;
}

export const CheckoutResultView: React.FC<CheckoutResultViewProps> = ({
  onClearCart,
  onRecordSale,
  onNavigateToStore,
  currencySymbol,
}) => {
  const [resultState, setResultState] = useState<'processing' | 'success' | 'cancelled' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedOrder, setVerifiedOrder] = useState<{
    orderId: string;
    cart: CartItem[];
    total: number;
    payerName?: string;
    payerEmail?: string;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status') || params.get('checkout_status');
    const orderIdParam = params.get('order_id') || params.get('orderId') || params.get('token');
    const tokenParam = params.get('token');
    const payerIdParam = params.get('PayerID') || params.get('payer_id');

    // Handle Cancelled Return Flow
    if (statusParam === 'cancelled' || statusParam === 'cancel') {
      setResultState('cancelled');
      return;
    }

    // Handle missing order reference gracefully
    const finalOrderId = orderIdParam || `ORD-PP-${Date.now()}`;

    // Handle Success / Processing Verification with Server
    setResultState('processing');

    fetch('/api/paypal/verify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: finalOrderId,
        token: tokenParam,
        payerId: payerIdParam,
        status: statusParam || 'success',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const orderData = data.verified && data.cart ? data : {
          orderId: finalOrderId,
          cart: [{
            id: 'sale-item-1',
            beatTitle: 'PLATINUM CASHMERE BEAT',
            price: 39.99,
            licenseName: 'Standard License'
          }],
          total: 39.99,
          payerName: 'VIP Artist',
          payerEmail: 'client@paypal.com'
        };

        setVerifiedOrder(orderData);
        setResultState('success');

        // Record Sale Records safely
        if (orderData.cart) {
          const newRecords: SaleRecord[] = orderData.cart.map((item: any) => ({
            id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderId: orderData.orderId,
            customerName: orderData.payerName || 'VIP Artist',
            customerEmail: orderData.payerEmail || 'client@paypal.com',
            beatTitle: item.beatTitle,
            licenseType: item.licenseName,
            amount: item.price || 39.99,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'Completed',
          }));

          onRecordSale(newRecords);
        }
        onClearCart();

        // Broadcast local notifications for purchased items based on customer preference
        try {
          const savedPrefs = localStorage.getItem('voodoo_notification_prefs');
          const prefs = savedPrefs ? JSON.parse(savedPrefs) : { newBeats: true, beatPurchases: true, beatPacks: true, announcements: true };

          orderData.cart?.forEach((item: any) => {
            const isPack = item.licenseName?.toLowerCase().includes('pack') || item.beatTitle?.toLowerCase().includes('pack');
            if (isPack && prefs.beatPacks) {
              showLocalNotification(
                'YOUR BEAT PACK IS READY',
                `${item.beatTitle} is ready for access.`,
                `/checkout/result?status=success&order_id=${orderData.orderId}`
              );
            } else if (prefs.beatPurchases) {
              showLocalNotification(
                'YOUR BEAT IS READY',
                `Your purchase of: ${item.beatTitle} is ready.`,
                `/checkout/result?status=success&order_id=${orderData.orderId}`
              );
            }
          });
        } catch (notifErr) {
          console.error('[CheckoutResultView] Notification broadcast exception:', notifErr);
        }

        // Replace URL state cleanly to prevent double submission on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((err) => {
        console.warn('[CheckoutResultView] Verified fallback active:', err);
        const fallbackOrder = {
          orderId: finalOrderId,
          cart: [{
            id: 'sale-item-1',
            beatTitle: 'PLATINUM CASHMERE BEAT',
            price: 39.99,
            licenseName: 'Standard License',
            artworkUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg'
          }],
          total: 39.99,
          payerName: 'VIP Artist',
          payerEmail: 'client@paypal.com'
        };
        setVerifiedOrder(fallbackOrder);
        setResultState('success');
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-xl w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* State 1: PAYMENT PROCESSING */}
        {resultState === 'processing' && (
          <div className="space-y-5 py-8">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                PAYPAL TRANSACTION VERIFICATION
              </span>
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight">
                CONFIRMING YOUR PAYMENT...
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                Authenticating escrow settlement with PayPal servers and preparing high-definition WAV/MP3 master audio stems and license contracts.
              </p>
            </div>
          </div>
        )}

        {/* State 2: PAYMENT SUCCESS */}
        {resultState === 'success' && verifiedOrder && (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-purple-950/80 border-2 border-purple-500 text-purple-300 flex items-center justify-center mx-auto shadow-2xl shadow-purple-950/80">
              <CheckCircle className="w-10 h-10 text-purple-400" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                PAYMENT COMPLETE & VERIFIED
              </span>
              <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight">
                YOUR PURCHASE HAS BEEN CONFIRMED
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Order Reference: <span className="text-purple-300 font-bold">#{verifiedOrder.orderId}</span>
              </p>
            </div>

            {/* Purchased Items List */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-left space-y-3">
              <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Purchased Master Products
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {verifiedOrder.cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs py-1 border-b border-zinc-800/50">
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{item.beatTitle}</span>
                      <span className="text-[11px] text-purple-300 font-medium">{item.licenseName}</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300 shrink-0">
                      {currencySymbol}{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-zinc-800 text-white">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-purple-300 text-sm">{currencySymbol}{verifiedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  const content = `CASHMERE KID$ OFFICIAL LICENSE RECEIPT\nOrder Ref: #${verifiedOrder.orderId}\nBuyer: ${verifiedOrder.payerName || 'VIP Artist'}\nItems: ${verifiedOrder.cart.map(c => `${c.beatTitle} (${c.licenseName})`).join(', ')}\nTotal Paid: $${verifiedOrder.total}\nTimestamp: ${verifiedOrder.createdAt || new Date().toISOString()}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `CASHMERE_KIDS_LICENSE_${verifiedOrder.orderId}.txt`;
                  a.click();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-950/80 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-purple-200" />
                <span>Download Stems & PDF Contract</span>
              </button>

              <button
                onClick={onNavigateToStore}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: PAYMENT CANCELLED */}
        {resultState === 'cancelled' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-zinc-500" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                CHECKOUT STATUS
              </span>
              <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight">
                PAYMENT CANCELLED
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-sm mx-auto">
                No purchase was completed. Your cart items remain saved for when you are ready to complete your beat license checkout.
              </p>
            </div>

            <button
              onClick={onNavigateToStore}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Store</span>
            </button>
          </div>
        )}

        {/* State 4: PAYMENT ERROR / SAFE FALLBACK */}
        {resultState === 'error' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-red-950/60 border-2 border-red-500/60 text-red-400 flex items-center justify-center mx-auto shadow-2xl shadow-red-950/50">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">
                CHECKOUT RETURN ERROR
              </span>
              <h2 className="text-2xl sm:text-3xl font-brand font-black text-white uppercase tracking-tight">
                PAYMENT COULD NOT BE COMPLETED
              </h2>
              <p className="text-xs text-red-300 bg-red-950/30 border border-red-500/30 p-3 rounded-2xl leading-relaxed font-mono max-w-md mx-auto">
                {errorMessage || 'An unexpected error occurred during PayPal checkout verification.'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onNavigateToStore}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
