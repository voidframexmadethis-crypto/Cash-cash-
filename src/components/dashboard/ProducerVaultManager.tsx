import React, { useState } from 'react';
import { Archive, Lock, RotateCcw, Trash2, Play, Eye, ShieldCheck, AlertTriangle, Sparkles, Dna, Music, FileText, CheckCircle2 } from 'lucide-react';
import { Beat } from '../../types';
import { BeatDnaPanel } from '../BeatDnaPanel';

interface ProducerVaultManagerProps {
  beats: Beat[];
  onUpdateBeat?: (beat: Beat) => void;
  onDeleteBeat: (beatId: string) => void;
  onPlayToggle?: (beat: Beat) => void;
  currencySymbol: string;
}

export const ProducerVaultManager: React.FC<ProducerVaultManagerProps> = ({
  beats,
  onUpdateBeat,
  onDeleteBeat,
  onPlayToggle,
  currencySymbol,
}) => {
  const [inspectBeat, setInspectBeat] = useState<Beat | null>(null);
  const [deleteConfirmBeatId, setDeleteConfirmBeatId] = useState<string | null>(null);

  // Filter archived tracks (Private Producer Vault)
  const archivedBeats = beats.filter((b) => b.isArchived === true);
  const publishedBeats = beats.filter((b) => b.published !== false && !b.isArchived);

  const handleRestoreToStore = (beat: Beat) => {
    if (!onUpdateBeat) return;
    const restored: Beat = {
      ...beat,
      published: true,
      isArchived: false,
      updatedDate: new Date().toISOString().split('T')[0],
    };
    onUpdateBeat(restored);
  };

  const handleArchiveTrack = (beat: Beat) => {
    if (!onUpdateBeat) return;
    const archived: Beat = {
      ...beat,
      published: false,
      isArchived: true,
      updatedDate: new Date().toISOString().split('T')[0],
    };
    onUpdateBeat(archived);
  };

  const handlePermanentDelete = (beatId: string) => {
    onDeleteBeat(beatId);
    setDeleteConfirmBeatId(null);
    if (inspectBeat?.id === beatId) {
      setInspectBeat(null);
    }
  };

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              FEATURE 48 · PRIVATE PRODUCER VAULT
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            ARCHIVED MASTERS & LICENSING VAULT
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Archived tracks are permanently hidden from the storefront, search, and collections while preserving all audio, Beat DNA, and analytics history.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300">
          <span className="text-purple-400 font-bold">{archivedBeats.length}</span> Archived Assets
        </div>
      </div>

      {/* Security & Preservation Guarantee */}
      <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl flex items-start gap-3 text-xs text-zinc-300">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Complete Data Preservation Guarantee</span>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Archiving a beat instantly halts new public purchases while preserving master audio, square artwork, Beat DNA profiles, play counts, and previous buyers' licenses. Restore back to the live storefront anytime with 1 click.
          </p>
        </div>
      </div>

      {/* Archived Tracks List */}
      {archivedBeats.length > 0 ? (
        <div className="space-y-3">
          {archivedBeats.map((beat) => (
            <div
              key={beat.id}
              className="p-4 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={beat.artworkUrl}
                  alt={beat.title}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-800 grayscale opacity-80 shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white truncate">{beat.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono font-bold uppercase">
                      VAULT ARCHIVED
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                    <span>{beat.bpm} BPM</span>
                    <span>·</span>
                    <span>{beat.key}</span>
                    <span>·</span>
                    <span>{currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}</span>
                    <span>·</span>
                    <span className="text-purple-300">{beat.playCount || 0} lifetime plays</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onPlayToggle && (
                  <button
                    onClick={() => onPlayToggle(beat)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                    title="Audit Audio Playback"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setInspectBeat(beat)}
                  className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Dna className="w-3.5 h-3.5 text-purple-400" />
                  <span>Inspect DNA</span>
                </button>

                <button
                  onClick={() => handleRestoreToStore(beat)}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore to Store</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmBeatId(beat.id)}
                  className="p-2.5 rounded-xl bg-zinc-950 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                  title="Permanent Deletion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
          <Archive className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Producer Vault is Empty</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            When you retire or archive tracks from the live store, their audio, metadata, and analytics will be preserved securely here.
          </p>
        </div>
      )}

      {/* Inspect Beat DNA Modal */}
      {inspectBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-left font-sans">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="font-brand font-black text-white text-base uppercase">
                VAULT ASSET INSPECTION
              </h4>
              <button
                onClick={() => setInspectBeat(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <BeatDnaPanel
              beat={inspectBeat}
              isEditable={true}
              onSaveDna={(updated) => {
                if (onUpdateBeat) onUpdateBeat(updated);
                setInspectBeat(updated);
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleRestoreToStore(inspectBeat);
                  setInspectBeat(null);
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
              >
                Restore Beat to Live Store
              </button>
              <button
                onClick={() => setInspectBeat(null)}
                className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {deleteConfirmBeatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-left font-sans">
          <div className="relative w-full max-w-md bg-zinc-900 border border-red-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-extrabold uppercase">Confirm Permanent Deletion</h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete this master audio asset and all associated records from your database? <strong>This operation cannot be undone.</strong>
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handlePermanentDelete(deleteConfirmBeatId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setDeleteConfirmBeatId(null)}
                className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
