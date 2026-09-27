import React, { useState } from 'react';
import { X, Copy, Check, Code, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Beat } from '../types';

interface ShareModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ beat, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen || !beat) return null;

  const beatUrl = `${window.location.origin}/?beat=${beat.id}`;
  const embedCode = `<iframe src="${window.location.origin}/?beat=${beat.id}" width="100%" height="180" frameborder="0" scrolling="no"></iframe>`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: beat.title,
          text: `Check out "${beat.title}" produced by CASHMERE KID$`,
          url: beatUrl,
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard(beatUrl, false);
      }
    } else {
      copyToClipboard(beatUrl, false);
    }
  };

  const copyToClipboard = (text: string, isEmbed: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-md bg-zinc-950 border border-purple-500/40 rounded-3xl shadow-2xl p-6 text-left space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src={beat.artworkUrl}
            alt={beat.title}
            className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
              SHARE INSTRUMENTAL
            </span>
            <h3 className="text-base font-extrabold text-white truncate">{beat.title}</h3>
            <p className="text-xs text-zinc-400 font-mono">{beat.genre} · {beat.bpm} BPM</p>
          </div>
        </div>

        {/* Feature 30: Native Share Button where supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full min-h-[48px] px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Device...</span>
          </button>
        )}

        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Direct Beat Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={beatUrl}
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(beatUrl, false)}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer uppercase tracking-wider"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            {copiedLink && (
              <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Beat link copied to clipboard!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Code className="w-3.5 h-3.5 text-purple-400" />
              <span>Embed Waveform Player Code</span>
            </label>
            <div className="flex gap-2">
              <textarea
                readOnly
                rows={2}
                value={embedCode}
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl p-2.5 text-[11px] font-mono text-zinc-400 focus:outline-none resize-none"
              />
              <button
                onClick={() => copyToClipboard(embedCode, true)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 self-start border border-zinc-800 cursor-pointer"
              >
                {copiedEmbed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmbed ? 'Copied' : 'Embed'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
