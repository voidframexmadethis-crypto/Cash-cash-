import React, { useState } from 'react';
import { X, Download, Mail, CheckCircle2, ShieldCheck, Sparkles, FileAudio, Info } from 'lucide-react';
import { Beat } from '../types';

interface FreeDownloadModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured: (email: string, beat: Beat) => void;
}

export const FreeDownloadModal: React.FC<FreeDownloadModalProps> = ({
  beat,
  isOpen,
  onClose,
  onLeadCaptured,
}) => {
  const [email, setEmail] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !beat) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid artist email address');
      return;
    }

    setError('');
    setIsDownloading(true);

    try {
      // Trigger lead capture in parent and track download count accurately
      onLeadCaptured(email, beat);

      // Trigger real file download (or media download)
      const downloadFilename = `${beat.title.replaceAll(' ', '_')}_CASHMERE_KIDS_DEMO.mp3`;
      
      if (beat.iaUrl || beat.audioUrl) {
        const fileUrl = beat.iaUrl || beat.audioUrl;
        const link = document.createElement('a');
        link.href = fileUrl || '';
        link.target = '_blank';
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback demo blob download if external URL is not yet bound
        const demoContent = `[CASHMERE KID$ FREE TAGGED BEAT DEMO]\nTitle: ${beat.title}\nProducer: ${beat.producerName || 'CASHMERE KID$'}\nBPM: ${beat.bpm}\nKey: ${beat.key}\nGenre: ${beat.genre}\nLicense: Non-Commercial Promotional Demonstration Only\nDownloaded by: ${email}\nTimestamp: ${new Date().toISOString()}`;
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${beat.title.replaceAll(' ', '_')}_DEMO_AGREEMENT.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloaded(true);
    } catch (err: any) {
      console.error('[FreeDownloadModal] Download error:', err);
      setError('Download could not be initialized. Please retry.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn text-left font-sans">
      <div className="relative w-full max-w-md bg-zinc-900 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/80 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!downloaded ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={beat.artworkUrl}
                alt={beat.title}
                className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shadow-md shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                }}
              />
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-extrabold text-[10px] uppercase tracking-wider border border-purple-500/40">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>100% FREE DOWNLOAD</span>
                </div>
                <h3 className="text-lg font-black text-white truncate mt-0.5">{beat.title}</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {beat.bpm} BPM · {beat.key} · PROD. {beat.producerName || 'CASHMERE KID$'}
                </p>
              </div>
            </div>

            {/* Clear, honest description of what is collected and why */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 mb-4 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Why We Request Your Email</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Enter your artist email below to receive an instant direct download link for the authorized demo version of <strong>{beat.title}</strong> and join the VIP CASHMERE KID$ artist community. No payment or credit card is required for genuinely free downloads.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Your Artist Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@recordlabel.com"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isDownloading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Free Beat Demo</span>
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Zero Spam Guarantee · Non-Commercial Evaluation License</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-950/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Download Started!</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your free tagged demo MP3 for <strong>{beat.title}</strong> has started downloading. A backup access receipt was recorded for <span className="text-purple-300 font-mono">{email}</span>.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-left space-y-1 text-xs text-zinc-400 font-sans">
              <span className="font-bold text-zinc-300 block">Ready to record vocals for streaming?</span>
              <p className="text-[11px]">
                Upgrade to an uncompressed MP3 or Premium M4A Lease anytime from the store to distribute to Spotify, Apple Music, and YouTube.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
