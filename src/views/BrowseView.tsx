import React, { useState } from 'react';
import { Search, Grid, List, Music, SlidersHorizontal, Sparkles, Filter, X, ChevronRight, Volume2, Heart } from 'lucide-react';
import { Beat } from '../types';
import { BeatCard } from '../components/BeatCard';
import { BeatRow } from '../components/BeatRow';
import { EmptyState } from '../components/EmptyState';

interface BrowseViewProps {
  beats: Beat[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail: (beat: Beat) => void;
  currencySymbol: string;
  initialQuery?: string;
  initialGenreFilter?: string;
  favoriteIds?: string[];
  onToggleFavorite?: (beat: Beat) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  beats,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  currencySymbol,
  initialQuery = '',
  initialGenreFilter = 'ALL',
  favoriteIds = [],
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenreFilter || 'ALL');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [minBpm, setMinBpm] = useState<number>(0);
  const [maxBpm, setMaxBpm] = useState<number>(200);
  const [freeDownloadOnly, setFreeDownloadOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'bpm' | 'featured'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const genres = ['ALL', 'TRAP', 'DARK SYNTH', 'FREESTYLE TRAP', 'HARD TRAP', 'DRILL', 'HYPER TRAP'];
  const musicalKeys = ['ALL', 'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'F Minor', 'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'E Minor'];

  // Real Catalog Filtering
  const filteredBeats = beats
    .filter((beat) => {
      const matchesSearch =
        searchQuery === '' ||
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.bpm.toString().includes(searchQuery);

      const matchesGenre = selectedGenre === 'ALL' || beat.genre === selectedGenre;
      const matchesKey = selectedKey === 'ALL' || beat.key === selectedKey;
      const matchesBpm = beat.bpm >= minBpm && beat.bpm <= maxBpm;
      const matchesFree = !freeDownloadOnly || beat.freeDownload;
      const matchesFeatured = !featuredOnly || beat.featured;
      const matchesFavorite = !favoritesOnly || favoriteIds.includes(beat.id);

      return matchesSearch && matchesGenre && matchesKey && matchesBpm && matchesFree && matchesFeatured && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      if (sortBy === 'price-asc') return a.pricing.mp3Lease - b.pricing.mp3Lease;
      if (sortBy === 'price-desc') return b.pricing.mp3Lease - a.pricing.mp3Lease;
      if (sortBy === 'bpm') return a.bpm - b.bpm;
      if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      // Default: Newest
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  // Separate catalog sections
  const featuredBeats = beats.filter((b) => b.featured);

  const isFilteringActive =
    searchQuery !== '' ||
    selectedGenre !== 'ALL' ||
    selectedKey !== 'ALL' ||
    freeDownloadOnly ||
    featuredOnly ||
    favoritesOnly ||
    minBpm > 0 ||
    maxBpm < 200;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('ALL');
    setSelectedKey('ALL');
    setMinBpm(0);
    setMaxBpm(200);
    setFreeDownloadOnly(false);
    setFeaturedOnly(false);
    setFavoritesOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="space-y-10 pb-28">
      {/* Search Input Bar */}
      <div className="relative w-full max-w-4xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, genre, key, BPM or #tag..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-white rounded-2xl py-4 pl-6 pr-12 text-sm sm:text-base font-medium focus:outline-none shadow-2xl transition-all placeholder-zinc-500"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* Featured Beats Section Spotlight (When no search active) */}
      {!isFilteringActive && featuredBeats.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                FEATURED VAULT SPOTLIGHT
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {featuredBeats.length} Featured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBeats.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                isPlaying={isPlaying}
                isCurrent={currentBeat?.id === beat.id}
                onPlayToggle={onPlayToggle}
                onBuyClick={onBuyClick}
                onFreeDownloadClick={onFreeDownloadClick}
                onShareClick={onShareClick}
                onViewDetail={onViewDetail}
                currencySymbol={currencySymbol}
                isFavorite={favoriteIds.includes(beat.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Sorting & Layout View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900 shadow-2xl">
        {/* Genre Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedGenre === g
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 ring-1 ring-purple-400/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Desktop Filter Controls & View Mode */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile Filter Sheet Trigger Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-extrabold text-zinc-300 flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span>Filters</span>
          </button>

          {/* Key Selector */}
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="hidden md:block bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {musicalKeys.map((k) => (
              <option key={k} value={k}>
                Key: {k}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="bpm">Sort: BPM</option>
            <option value="featured">Sort: Featured</option>
          </select>

          {/* Saved Vault / Favorites Toggle */}
          {favoriteIds.length > 0 && (
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
              <span>Saved ({favoriteIds.length})</span>
            </button>
          )}

          {/* Free Download Toggle */}
          <button
            onClick={() => setFreeDownloadOnly(!freeDownloadOnly)}
            className={`hidden sm:block px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
              freeDownloadOnly
                ? 'bg-purple-950 border-purple-500 text-purple-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Free Downloads
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / iPad Filters Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-white text-base">Filter Vault Catalog</h3>
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 py-6 overflow-y-auto">
            {/* Genre */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">Genre</span>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      selectedGenre === g ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Key */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">Musical Key</span>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs font-bold rounded-xl p-3"
              >
                {musicalKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Free Downloads Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-xs font-bold text-white">Free Downloads Only</span>
              <button
                onClick={() => setFreeDownloadOnly(!freeDownloadOnly)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  freeDownloadOnly ? 'bg-purple-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    freeDownloadOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-extrabold text-xs"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Catalog Beats Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            {isFilteringActive ? 'SEARCH & FILTERED RESULTS' : 'ALL BEATS CATALOG'}
          </h2>
          <span className="text-xs text-zinc-400 font-mono font-bold">
            {filteredBeats.length} {filteredBeats.length === 1 ? 'Beat' : 'Beats'} Available
          </span>
        </div>

        {filteredBeats.length === 0 ? (
          <EmptyState
            icon={Music}
            title="NO MATCHING BEATS"
            description="No beats match your current filters."
            actionLabel="Clear Filters"
            onAction={resetFilters}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                isPlaying={isPlaying}
                isCurrent={currentBeat?.id === beat.id}
                onPlayToggle={onPlayToggle}
                onBuyClick={onBuyClick}
                onFreeDownloadClick={onFreeDownloadClick}
                onShareClick={onShareClick}
                onViewDetail={onViewDetail}
                currencySymbol={currencySymbol}
                isFavorite={favoriteIds.includes(beat.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBeats.map((beat, index) => (
              <BeatRow
                key={beat.id}
                beat={beat}
                index={index}
                isPlaying={isPlaying}
                isCurrent={currentBeat?.id === beat.id}
                onPlayToggle={onPlayToggle}
                onBuyClick={onBuyClick}
                onFreeDownloadClick={onFreeDownloadClick}
                onShareClick={onShareClick}
                onViewDetail={onViewDetail}
                currencySymbol={currencySymbol}
                isFavorite={favoriteIds.includes(beat.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
