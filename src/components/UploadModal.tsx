import React from 'react';
import { X } from 'lucide-react';
import { Beat, BeatPack } from '../types';
import { BeatUploadingSystem } from './BeatUploadingSystem';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishBeat: (newBeat: Beat) => void;
  onPublishBeatPack?: (newPack: BeatPack) => void;
  currencySymbol: string;
  beats?: Beat[];
  onSwitchToBeatPacks?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onPublishBeat,
  onPublishBeatPack,
  currencySymbol,
  beats = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 animate-fadeIn">
      <div className="relative max-w-6xl mx-auto my-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Top Dismiss Button */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            BEAT UPLOADER & MANAGEMENT STUDIO
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <BeatUploadingSystem
          onPublishBeat={(beat) => {
            onPublishBeat(beat);
            onClose();
          }}
          onPublishBeatPack={onPublishBeatPack}
          currencySymbol={currencySymbol}
          beats={beats}
          onClose={onClose}
          onExitToDashboard={onClose}
        />
      </div>
    </div>
  );
};
