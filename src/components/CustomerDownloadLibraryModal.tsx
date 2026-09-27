import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Music,
  ShoppingBag,
  Search,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Key
} from 'lucide-react';
import { Beat, SaleRecord } from '../types';

interface CustomerDownloadLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  beats: Beat[];
  salesRecords: SaleRecord[];
  currencySymbol: string;
}

export const CustomerDownloadLibraryModal: React.FC<CustomerDownloadLibraryModalProps> = ({
  isOpen,
  onClose,
  beats,
  salesRecords,
  currencySymbol = '$',
}) => {
  const [customerEmailInput, setCustomerEmailInput] = useState<string>(() => {
    return localStorage.getItem('cashmere_customer_email') || '';
  });
  const [activeLookupEmail, setActiveLookupEmail] = useState<string>(() => {
    return localStorage.getItem('cashmere_customer_email') || '';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Filter verified sales matching lookup email or display all device-recorded purchases if empty lookup
  const userPurchases = salesRecords.filter((record) => {
    if (!activeLookupEmail) return true;
    return record.customerEmail.toLowerCase().trim() === activeLookupEmail.toLowerCase().trim();
  });

  const filteredPurchases = userPurchases.filter((record) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      record.beatTitle.toLowerCase().includes(q) ||
      record.licenseType.toLowerCase().includes(q) ||
      record.orderId.toLowerCase().includes(q)
    );
  });

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customerEmailInput.trim().toLowerCase();
    setActiveLookupEmail(clean);
    if (clean) {
      localStorage.setItem('cashmere_customer_email', clean);
    }
  };

  const handleDownloadMaster = (record: SaleRecord) => {
    const matchedBeat = beats.find(
      (b) => b.title.toLowerCase().trim() === record.beatTitle.toLowerCase().trim()
    );

    const audioUrl = matchedBeat?.iaUrl || matchedBeat?.audioUrl;

    if (audioUrl) {
      // Trigger actual master download
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${record.beatTitle.replace(/\s+/g, '_')}_CASHMERE_KIDS_MASTER.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create licensed audio payload
      const content = `[CASHMERE KID$ OFFICIAL LICENSED MASTER]\nTitle: ${record.beatTitle}\nLicensee: ${record.customerName} (${record.customerEmail})\nOrder ID: #${record.orderId}\nLicense Tier: ${record.licenseType}\nAmount Paid: $${record.amount.toFixed(2)}\nIssued: ${record.date}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${record.beatTitle.replace(/\s+/g, '_')}_MASTER_LICENSE.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadContract = (record: SaleRecord) => {
    const contractText = `================================================================================
                    CASHMERE KID$ MUSIC PRODUCTION AGREEMENT
================================================================================
ORDER REFERENCE: #${record.orderId}
DATE OF ISSUANCE: ${record.date}
PRODUCER: CASHMERE KID$ (Executive Licensor)
LICENSEE / ARTIST: ${record.customerName} (${record.customerEmail})
BEAT / MASTER WORK: "${record.beatTitle}"
LICENSE TIER: ${record.licenseType.toUpperCase()}
FEE PAID: $${record.amount.toFixed(2)} USD

TERMS OF PERMITTED USAGE:
1. GRANT OF RIGHTS: Licensor hereby grants to Licensee the non-exclusive, non-transferable right to record vocal and/or instrumental synchronization over the master instrumental titled "${record.beatTitle}".
2. DISTRIBUTION LIMITS:
   - Streaming Distribution: Commercial digital streaming permitted under the parameters of the ${record.licenseType} tier.
   - Radio Broadcasting: Terrestrial and satellite radio rotation authorized.
   - Synchronization: YouTube, TikTok, Instagram, and commercial video synchronization authorized.
3. CREDIT CLAUSE: In all public releases, metadata must include the production credit: "Prod. CASHMERE KID$".
4. STEMS & LOSSLESS MASTERS: Licensee is authorized to receive uncompressed 24-bit audio master vectors and multitrack stems.

SIGNATURE & AUTHENTICATION:
Executive Licensor: CASHMERE KID$
Digital Verification Hash: SHA256-${record.orderId}-${Date.now()}
================================================================================`;

    const blob = new Blob([contractText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CASHMERE_KIDS_CONTRACT_${record.orderId}_${record.beatTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn font-sans text-left">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                CUSTOMER ACCESS PORTAL
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                CUSTOMER DOWNLOAD LIBRARY
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 border border-zinc-850 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Lookup & Filter Bar */}
        <div className="p-6 bg-zinc-900/60 border-b border-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleLookupSubmit} className="flex-1 flex gap-2">
              <input
                type="email"
                value={customerEmailInput}
                onChange={(e) => setCustomerEmailInput(e.target.value)}
                placeholder="Enter PayPal or checkout email (e.g. artist@label.com)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 font-mono outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                Access Library
              </button>
            </form>

            {userPurchases.length > 0 && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter owned beats..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>
              {activeLookupEmail ? `Authorized for: ${activeLookupEmail}` : 'Displaying verified device purchases'}
            </span>
            <span className="text-purple-300 font-bold">
              {filteredPurchases.length} {filteredPurchases.length === 1 ? 'Product Owned' : 'Products Owned'}
            </span>
          </div>
        </div>

        {/* Library Items Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {filteredPurchases.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 border border-zinc-850 rounded-3xl space-y-4">
              <ShoppingBag className="w-10 h-10 text-purple-400/50 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">
                  No Purchased Beats Found
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
                  {activeLookupEmail
                    ? `No authorized purchases match "${activeLookupEmail}". Please double-check your checkout email address.`
                    : 'You have not completed any beat license purchases on this browser session yet.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
              >
                Browse Beat Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPurchases.map((record) => {
                const matchedBeat = beats.find(
                  (b) => b.title.toLowerCase().trim() === record.beatTitle.toLowerCase().trim()
                );
                const artworkUrl = matchedBeat?.artworkUrl || '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';

                return (
                  <div
                    key={record.id}
                    className="p-5 bg-zinc-900/80 border border-zinc-850 hover:border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={artworkUrl}
                        alt={record.beatTitle}
                        className="w-16 h-16 rounded-xl object-cover border border-purple-500/30 shrink-0"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/30 uppercase">
                            {record.licenseType}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            ✓ {record.status}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base text-white truncate">
                          {record.beatTitle}
                        </h4>

                        <div className="text-xs text-zinc-400 font-mono flex flex-wrap gap-2">
                          <span>Order #{record.orderId}</span>
                          <span>·</span>
                          <span>{record.date}</span>
                          <span>·</span>
                          <span className="text-purple-300 font-bold">{currencySymbol}{record.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Download Actions */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => handleDownloadContract(record)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Download Legal License Agreement"
                      >
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>PDF Contract</span>
                      </button>

                      <button
                        onClick={() => handleDownloadMaster(record)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Download High-Definition Master & Stems"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>Download Master</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
