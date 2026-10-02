import React, { useEffect, useState, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  clientId?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export const PayPalPayment: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  description = 'Digital Purchase',
  clientId: initialClientId,
  onSuccess,
  onError,
}) => {
  const [clientId, setClientId] = useState<string | null>(initialClientId || null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Fetch client ID if not provided as a prop
  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId);
      return;
    }
    fetch('/api/paypal/client-id')
      .then((res) => {
        if (!res.ok) throw new Error('API response not OK');
        return res.json();
      })
      .then((data) => {
        setClientId(data.clientId || 'sb');
      })
      .catch((err) => {
        console.error('Error fetching PayPal client ID, falling back to sb:', err);
        setClientId('sb');
      });
  }, [initialClientId]);

  useEffect(() => {
    if (!clientId) return;

    const scriptId = 'paypal-js-sdk-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeButtons = () => {
      setIsLoaded(true);
      const paypal = (window as any).paypal;
      if (paypal && buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: description,
                amount: {
                  currency_code: currency,
                  value: amount.toFixed(2).toString(),
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess(details);
            } catch (err) {
              console.error('Capture failed', err);
              onError(err);
            }
          },
          onError: (err: any) => {
            console.error('PayPal Buttons experienced an error', err);
            onError(err);
          }
        }).render(buttonContainerRef.current);
      }
    };

    // If script already exists but with a different client-id, recreate it
    if (script && script.getAttribute('data-client-id') !== clientId) {
      script.remove();
      script = null;
      if ((window as any).paypal) {
        delete (window as any).paypal;
      }
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.setAttribute('data-client-id', clientId);
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.async = true;
      script.onload = initializeButtons;
      script.onerror = () => {
        setLoadError('Failed to load PayPal secure payment network.');
        onError(new Error('PayPal SDK failed to load.'));
      };
      document.body.appendChild(script);
    } else {
      const paypal = (window as any).paypal;
      if (paypal) {
        initializeButtons();
      } else {
        script.addEventListener('load', initializeButtons);
      }
    }

    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [amount, currency, description, clientId, onSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black tracking-widest text-amber-400 uppercase font-sans">
          SECURE BILLING PORTAL
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
          SSL Secure Connection
        </span>
      </div>
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/40 mb-4 flex justify-between items-center">
        <span className="text-xs text-zinc-400 font-medium font-sans truncate pr-2">{description}</span>
        <span className="text-base font-extrabold text-purple-400 font-mono shrink-0">
          ${amount.toFixed(2)} {currency}
        </span>
      </div>
      {loadError && (
        <div className="bg-red-950/50 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg text-center mb-4 font-sans font-medium">
          {loadError}
        </div>
      )}
      <div className="relative min-h-[140px] flex flex-col justify-center">
        {!isLoaded && !loadError && (
          <div className="flex flex-col items-center justify-center space-y-3 py-6">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">
              Initializing payment gateway...
            </p>
          </div>
        )}
        <div ref={buttonContainerRef} id="paypal-button-container" className="w-full z-10"></div>
      </div>
      <div className="mt-4 text-center text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-sans">
        Processed via PayPal Merchant Integration API • Safe & Encrypted
      </div>
    </div>
  );
};

export default PayPalPayment;
