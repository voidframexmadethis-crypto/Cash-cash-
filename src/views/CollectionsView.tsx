import React, { useState } from 'react';
import {
  Folder,
  Play,
  Pause,
  ShoppingBag,
  Search,
  RefreshCw,
  Grid,
  List,
  Sparkles,
  Flame,
  Zap,
  Skull,
  Radio,
  Tag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Music,
  Share2,
  Filter
} from 'lucide-react';
import { Beat, Collection } from '../types';
import { EmptyState } from '../components/EmptyState';

interface CollectionsViewProps {
  beats: Beat[];
  collections: Collection[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail: (beat: Beat) => void;
  currencySymbol: string;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  beats,
  collections,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  currencySymbol,
}) => {
  const [selectedGenreCategory, setSelectedGenreCategory] = useState<string>('ALL');
  const [searchTag, setSearchTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCollectionDetail, setSelectedCollectionDetail] = useState<Collection | null>(null);

  // Circular genre cards required by user prompt
  const genreCards = [
    { id: 'ALL', name: 'All Vaults', icon: Folder, color: 'from-purple-600 to-indigo-600' },
    { id: 'freestyle trap', name: 'Freestyle Trap', icon: Zap, color: 'from-amber-500 to-orange-600' },
    { id: 'dark trap', name: 'Dark Trap', icon: Radio, color: 'from-purple-900 to-zinc-900' },
    { id: 'banger trap', name: 'Banger Trap', icon: Flame, color: 'from-red-600 to-rose-700' },
    { id: 'evil trap', name: 'Evil Trap', icon: Skull, color: 'from-emerald-700 to-zinc-950' },
    { id: 'under50', name: 'Under $50', icon: Tag, color: 'from-cyan-600 to-blue-700' },
    { id: 'exclusive', name: 'Exclusive Packs', icon: Sparkles, color: 'from-purple-500 to-pink-600' },
  ];

  // Quick tags matching BeatStars tags bar in screenshot
  const popularTags = [
    '808',
    'freestyle trap',
    'dark trap',
    'banger trap',
    'evil trap',
    'cashmere',
    'type beat',
    'drill',
    'hyper trap',
    'hard trap',
    '2026 beats',
    'vault',
  ];

  // Filter real collections from props
  const displayCollections = collections.filter((col) => {
    const matchesTag =
      searchTag === '' ||
      col.name.toLowerCase().includes(searchTag.toLowerCase()) ||
      (col.description && col.description.toLowerCase().includes(searchTag.toLowerCase()));

    return matchesTag;
  });

  return (
    <div className="space-y-8 pb-28">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explore Collections
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Curated beat packs and vault bundles by <strong className="text-purple-300">CASHMERE KID$</strong>
          </p>
        </div>
      </div>

      {/* Top Circular Genre Cards Carousel (Matches BeatStars screenshot exactly!) */}
      <div className="relative bg-zinc-950/90 border border-zinc-900 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {genreCards.map((card) => {
            const IconComponent = card.icon;
            const isSelected = selectedGenreCategory === card.id;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedGenreCategory(card.id)}
                className="group flex flex-col items-center gap-3 shrink-0 focus:outline-none"
              >
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-blue-500 bg-blue-950/60 shadow-xl shadow-blue-900/50 scale-105'
                      : 'bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/80'
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-blue-400 font-extrabold' : 'text-zinc-300 group-hover:text-white'
                  }`}
                >
                  {card.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Tags Bar & Filters (Matches BeatStars screenshot) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-900">
        {/* Search for tags input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search for tags..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white text-xs rounded-xl py-2.5 pl-9 pr-4 focus:outline-none placeholder-zinc-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tag pills bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTag(tag === searchTag ? '' : tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                searchTag.toLowerCase() === tag.toLowerCase()
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Refresh & View toggles */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={() => {
              setSearchTag('');
              setSelectedGenreCategory('ALL');
            }}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
            title="Refresh Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid Section */}
      {displayCollections.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="NO COLLECTIONS MATCHED"
          description="There are currently no collection vault packs matching your selected tag or subgenre filter."
          actionLabel="Reset Collection Filters"
          onAction={() => {
            setSelectedGenreCategory('ALL');
            setSearchTag('');
          }}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {displayCollections.map((col) => {
            const colBeats = beats.filter((b) => b.collectionId === col.id);
            const sampleBeat = colBeats[0] || beats[0];
            const isPlayingThisCol = currentBeat && colBeats.some((b) => b.id === currentBeat.id) && isPlaying;

            return (
              <div
                key={col.id}
                className="group relative bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/50 flex flex-col justify-between"
              >
                {/* Album Art Stack Top Folder Rim Effect */}
                <div className="relative pt-2 px-3">
                  <div className="w-full h-2 bg-zinc-800/60 rounded-t-lg mx-auto transform -translate-y-1 scale-95" />
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl group-hover:scale-[1.02] transition-transform">
                    <img
                      src={col.artworkUrl}
                      alt={col.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Play Overlay Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      {sampleBeat && (
                        <button
                          onClick={() => onPlayToggle(sampleBeat)}
                          className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform"
                        >
                          {isPlayingThisCol ? (
                            <Pause className="w-7 h-7 fill-white" />
                          ) : (
                            <Play className="w-7 h-7 fill-white ml-1" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Track Count Pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-3 h-3 text-purple-400" />
                      <span>{col.beatCount || colBeats.length} Tracks</span>
                    </div>
                  </div>
                </div>

                {/* Collection Content Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-base text-white hover:text-purple-300 transition-colors line-clamp-1">
                      {col.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                      <span>CASHMERE KID$</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 pt-1 font-medium leading-relaxed">
                      {col.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
