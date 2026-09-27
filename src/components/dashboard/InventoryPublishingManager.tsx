import React, { useState } from 'react';
import { Layers, Radio, CheckCircle, FileText, Calendar, Archive, Edit2, Play, Trash2, RotateCcw, AlertTriangle, Eye, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { Beat } from '../../types';

interface InventoryPublishingManagerProps {
  beats: Beat[];
  onUpdateBeat?: (beat: Beat) => void;
  onDeleteBeat: (beatId: string) => void;
  onPublishBeat?: (beat: Beat) => void;
  onStartEditBeat?: (beat: Beat) => void;
  onPlayToggle?: (beat: Beat) => void;
  currencySymbol: string;
}

export const InventoryPublishingManager: React.FC<InventoryPublishingManagerProps> = ({
  beats,
  onUpdateBeat,
  onDeleteBeat,
  onPublishBeat,
  onStartEditBeat,
  onPlayToggle,
  currencySymbol,
}) => {
  const [activeInventoryTab, setActiveInventoryTab] = useState<'PUBLISHED' | 'DRAFTS' | 'SCHEDULED' | 'ARCHIVED'>('PUBLISHED');
  const [searchQuery, setSearchQuery] = useState('');

  // Partition beats into accurate inventory states
  const publishedBeats = beats.filter((b) => b.published !== false && !(b as any).isArchived && !(b as any).isScheduled);
  const draftBeats = beats.filter((b) => b.published === false && !(b as any).isArchived && !(b as any).isScheduled);
  const scheduledBeats = beats.filter((b) => (b as any).isScheduled || ((b as any).uploadStatus === 'SCHEDULED'));
  const archivedBeats = beats.filter((b) => (b as any).isArchived);

  const getActiveList = () => {
    switch (activeInventoryTab) {
      case 'PUBLISHED':
        return publishedBeats;
      case 'DRAFTS':
        return draftBeats;
      case 'SCHEDULED':
        return scheduledBeats;
      case 'ARCHIVED':
        return archivedBeats;
      default:
        return publishedBeats;
    }
  };

  const activeList = getActiveList().filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick State Actions
  const handleArchiveBeat = (beat: Beat) => {
    if (!onUpdateBeat) return;
    onUpdateBeat({ ...beat, published: false, isArchived: true } as any);
  };

  const handleRestoreBeat = (beat: Beat) => {
    if (!onUpdateBeat) return;
    onUpdateBeat({ ...beat, published: true, isArchived: false } as any);
  };

  const handlePublishDraft = (beat: Beat) => {
    if (!onUpdateBeat) return;
    onUpdateBeat({ ...beat, published: true, releaseDate: new Date().toISOString().split('T')[0] });
  };

  const handleCancelSchedule = (beat: Beat) => {
    if (!onUpdateBeat) return;
    onUpdateBeat({ ...beat, published: false, isScheduled: false, uploadStatus: 'draft' } as any);
  };

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              FEATURE 43 · INVENTORY & PUBLISHING MANAGER
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            CATALOG LIFECYCLE & RELEASE STATES
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Manage public visibility, in-progress drafts, scheduled releases, and archived studio assets.
          </p>
        </div>

        {/* 4-State Inventory Tab Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveInventoryTab('PUBLISHED')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeInventoryTab === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Published ({publishedBeats.length})</span>
          </button>

          <button
            onClick={() => setActiveInventoryTab('DRAFTS')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeInventoryTab === 'DRAFTS'
                ? 'bg-amber-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Drafts ({draftBeats.length})</span>
          </button>

          <button
            onClick={() => setActiveInventoryTab('SCHEDULED')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeInventoryTab === 'SCHEDULED'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled ({scheduledBeats.length})</span>
          </button>

          <button
            onClick={() => setActiveInventoryTab('ARCHIVED')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeInventoryTab === 'ARCHIVED'
                ? 'bg-zinc-700 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived ({archivedBeats.length})</span>
          </button>
        </div>
      </div>

      {/* Beats List for Current State */}
      {activeList.length > 0 ? (
        <div className="space-y-3">
          {activeList.map((beat) => {
            const hasAudio = !!(beat.audioUrl || beat.iaUrl || beat.storageProvider);
            const hasMetadata = !!(beat.bpm && beat.key && beat.genre && beat.tags && beat.tags.length > 0);

            return (
              <div
                key={beat.id}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-purple-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
              >
                {/* Left: Artwork, Title, Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={beat.artworkUrl}
                    alt={beat.title}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white truncate">{beat.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        activeInventoryTab === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : activeInventoryTab === 'DRAFTS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : activeInventoryTab === 'SCHEDULED'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {activeInventoryTab}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>{currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}</span>
                      <span>·</span>
                      <span>{beat.bpm} BPM</span>
                      <span>·</span>
                      <span>{beat.key}</span>
                      <span>·</span>
                      <span className={hasAudio ? 'text-emerald-400' : 'text-red-400'}>
                        {hasAudio ? 'Master MP3' : 'Missing Audio'}
                      </span>
                      <span>·</span>
                      <span className={hasMetadata ? 'text-zinc-400' : 'text-amber-400'}>
                        {hasMetadata ? 'Complete Info' : 'Needs Metadata'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: State-Specific Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {onPlayToggle && (
                    <button
                      onClick={() => onPlayToggle(beat)}
                      className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                      title="Preview Audio"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {/* PUBLISHED Actions: Edit, Archive */}
                  {activeInventoryTab === 'PUBLISHED' && (
                    <>
                      {onStartEditBeat && (
                        <button
                          onClick={() => onStartEditBeat(beat)}
                          className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleArchiveBeat(beat)}
                        className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Archive beat from store"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                    </>
                  )}

                  {/* DRAFT Actions: Continue Editing, Publish, Delete */}
                  {activeInventoryTab === 'DRAFTS' && (
                    <>
                      {onStartEditBeat && (
                        <button
                          onClick={() => onStartEditBeat(beat)}
                          className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Continue Editing</span>
                        </button>
                      )}
                      <button
                        onClick={() => handlePublishDraft(beat)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                      <button
                        onClick={() => onDeleteBeat(beat.id)}
                        className="p-2.5 rounded-xl bg-zinc-950 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* SCHEDULED Actions: Edit, Cancel Schedule */}
                  {activeInventoryTab === 'SCHEDULED' && (
                    <>
                      {onStartEditBeat && (
                        <button
                          onClick={() => onStartEditBeat(beat)}
                          className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Reschedule</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelSchedule(beat)}
                        className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel Schedule
                      </button>
                    </>
                  )}

                  {/* ARCHIVED Actions: Restore, Permanently Delete */}
                  {activeInventoryTab === 'ARCHIVED' && (
                    <>
                      <button
                        onClick={() => handleRestoreBeat(beat)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onDeleteBeat(beat.id)}
                        className="p-2.5 rounded-xl bg-zinc-950 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            No {activeInventoryTab.toLowerCase()} beats in inventory
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            All tracks in this status will appear organized here with instant state management controls.
          </p>
        </div>
      )}
    </div>
  );
};
