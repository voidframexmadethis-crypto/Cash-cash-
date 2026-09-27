import React, { useState } from 'react';
import {
  Search,
  Grid,
  List,
  Music,
  SlidersHorizontal,
  Sparkles,
  Filter,
  X,
  Volume2,
  Heart,
  Flame,
  Clock,
  Check,
  Tag,
  DollarSign,
  Share2
} from 'lucide-react';
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
  // Feature 25: Search Query State
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Feature 26: Filter Chips States
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenreFilter || 'ALL');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [selectedBpmRange, setSelectedBpmRange] = useState<string>('ALL');
  const [selectedPriceMax, setSelectedPriceMax] = useState<number | 'ALL'>('ALL');
  const [selectedMood, setSelectedMood] = useState<string>('ALL');
  
  const [freeDownloadOnly, setFreeDownloadOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'bpm' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Feature 23: Top Tracks Timeframe State
  const [topTracksTimeframe, setTopTracksTimeframe] = useState<'all' | '30days' | '7days'>('all');

  const genres = ['ALL', 'TRAP', 'FREESTYLE TRAP', 'DARK SYNTH', 'HARD TRAP', 'DRILL', 'HYPER TRAP'];
  const musicalKeys = ['ALL', 'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'F Minor', 'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'E Minor'];
  const moodsList = ['ALL', 'Dark', 'Aggressive', 'High Fashion', 'Bouncy', 'Melancholic', 'Energetic'];
  const bpmRanges = [
    { label: 'ALL BPM', value: 'ALL' },
    { label: '120–130 BPM', value: '120-130' },
    { label: '130–140 BPM', value: '130-140' },
    { label: '140–150 BPM', value: '140-150' },
    { label: '150+ BPM', value: '150+' },
  ];

  // Filter Published Beats Only Guardrail
  const publishedBeats = beats.filter((b) => b.published !== false);

  // Multi-Field Search & Filter Processing
  const filteredBeats = publishedBeats
    .filter((beat) => {
      // Feature 25: Multi-Field Partial Matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        beat.title.toLowerCase().includes(q) ||
        beat.tags.some((t) => t.toLowerCase().includes(q)) ||
        beat.moods.some((m) => m.toLowerCase().includes(q)) ||
        beat.genre.toLowerCase().includes(q) ||
        beat.key.toLowerCase().includes(q) ||
        beat.bpm.toString().includes(q) ||
        (q.includes('bpm') && beat.bpm.toString().includes(q.replace('bpm', '').trim()));

      const matchesGenre = selectedGenre === 'ALL' || beat.genre.toUpperCase() === selectedGenre.toUpperCase();
      const matchesKey = selectedKey === 'ALL' || beat.key === selectedKey;
      const matchesMood = selectedMood === 'ALL' || beat.moods.some((m) => m.toLowerCase() === selectedMood.toLowerCase());
      
      let matchesBpmRange = true;
      if (selectedBpmRange === '120-130') matchesBpmRange = beat.bpm >= 120 && beat.bpm <= 130;
      if (selectedBpmRange === '130-140') matchesBpmRange = beat.bpm >= 130 && beat.bpm <= 140;
      if (selectedBpmRange === '140-150') matchesBpmRange = beat.bpm >= 140 && beat.bpm <= 150;
      if (selectedBpmRange === '150+') matchesBpmRange = beat.bpm >= 150;

      let matchesPrice = true;
      if (selectedPriceMax === 30) matchesPrice = beat.pricing.mp3Lease <= 30;
      if (selectedPriceMax === 50) matchesPrice = beat.pricing.mp3Lease <= 50;

      const matchesFree = !freeDownloadOnly || beat.freeDownload;
      const matchesFeatured = !featuredOnly || beat.featured;
      const matchesFavorite = !favoritesOnly || favoriteIds.includes(beat.id);

      return (
        matchesSearch &&
        matchesGenre &&
        matchesKey &&
        matchesMood &&
        matchesBpmRange &&
        matchesPrice &&
        matchesFree &&
        matchesFeatured &&
        matchesFavorite
      );
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdDate || '').getTime() - new Date(b.createdDate || '').getTime();
      if (sortBy === 'price-asc') return a.pricing.mp3Lease - b.pricing.mp3Lease;
      if (sortBy === 'price-desc') return b.pricing.mp3Lease - a.pricing.mp3Lease;
      if (sortBy === 'bpm') return a.bpm - b.bpm;
      if (sortBy === 'popular') return (b.playCount || 0) - (a.playCount || 0);
      return new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime();
    });

  // Feature 21: Featured Beats Catalog
  const featuredBeats = publishedBeats.filter((b) => b.featured);

  // Feature 22: New Releases Catalog
  const newReleasesBeats = [...publishedBeats]
    .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
    .slice(0, 8);

  // Feature 23: Top Tracks Catalog
  const topTracksBeats = [...publishedBeats]
    .filter((b) => (b.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 8);

  // Feature 26: Active Filters Check & Reset
  const isFilteringActive =
    searchQuery !== '' ||
    selectedGenre !== 'ALL' ||
    selectedKey !== 'ALL' ||
    selectedBpmRange !== 'ALL' ||
    selectedPriceMax !== 'ALL' ||
    selectedMood !== 'ALL' ||
    freeDownloadOnly ||
    featuredOnly ||
    favoritesOnly;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('ALL');
    setSelectedKey('ALL');
    setSelectedBpmRange('ALL');
    setSelectedPriceMax('ALL');
    setSelectedMood('ALL');
    setFreeDownloadOnly(false);
    setFeaturedOnly(false);
    setFavoritesOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="space-y-10 pb-32 text-left font-sans animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 25. ADVANCED STORE SEARCH BAR                                             */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-4xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search beats by title, BPM (e.g. 140 BPM), Key (e.g. C Minor), Genre, Mood, or #tag..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-white rounded-2xl py-4 pl-6 pr-12 text-sm sm:text-base font-medium focus:outline-none shadow-2xl transition-all placeholder-zinc-500"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 26. FAST-ACCESS FILTER CHIPS & ACTIVE FILTERS STRIP                       */}
      {/* ========================================================================= */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-3xl border border-zinc-850 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-400/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile Filter Sheet Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-extrabold text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>Filters</span>
            </button>

            {/* Key Filter Dropdown */}
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

            {/* BPM Range Filter */}
            <select
              value={selectedBpmRange}
              onChange={(e) => setSelectedBpmRange(e.target.value)}
              className="hidden md:block bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {bpmRanges.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest Releases</option>
              <option value="popular">Sort: Most Played</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="bpm">Sort: BPM</option>
            </select>

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

        {/* Feature 26: Active Filters Strip Display */}
        {isFilteringActive && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-900 text-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              ACTIVE FILTERS:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl font-mono">
                <span>"{searchQuery}"</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
              </span>
            )}

            {selectedGenre !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl font-mono">
                <span>Genre: {selectedGenre}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedGenre('ALL')} />
              </span>
            )}

            {selectedKey !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl font-mono">
                <span>Key: {selectedKey}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedKey('ALL')} />
              </span>
            )}

            {selectedBpmRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl font-mono">
                <span>BPM: {selectedBpmRange}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedBpmRange('ALL')} />
              </span>
            )}

            {favoritesOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950 border border-rose-500/40 text-rose-300 rounded-xl font-mono">
                <span>Saved Favorites</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setFavoritesOnly(false)} />
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 21. FEATURED BEAT SECTION                                                 */}
      {/* ========================================================================= */}
      {!isFilteringActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                FEATURED BEAT SPOTLIGHT
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono font-bold">
              {featuredBeats.length} Featured
            </span>
          </div>

          {featuredBeats.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/60 border border-zinc-900 rounded-3xl space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto" />
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">No Featured Beats Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                Featured spotlight releases will appear here once pinned from the Producer Dashboard.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 23. TOP TRACKS SECTION WITH TIMEFRAME SELECTOR                             */}
      {/* ========================================================================= */}
      {!isFilteringActive && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                TOP TRACKS
              </h2>
            </div>

            {/* Timeframe Tabs */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 text-xs font-bold font-mono">
              <button
                onClick={() => setTopTracksTimeframe('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topTracksTimeframe === 'all' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTopTracksTimeframe('30days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topTracksTimeframe === '30days' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTopTracksTimeframe('7days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topTracksTimeframe === '7days' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Last 7 Days
              </button>
            </div>
          </div>

          {topTracksBeats.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/60 border border-zinc-900 rounded-3xl space-y-3">
              <Flame className="w-8 h-8 text-rose-500/50 mx-auto" />
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Top Tracks</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                Top tracks will appear once listeners start playing your beats.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTracksBeats.slice(0, 5).map((beat, idx) => (
                <BeatRow
                  key={beat.id}
                  beat={beat}
                  index={idx}
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
      )}

      {/* ========================================================================= */}
      {/* MAIN CATALOG DISPLAY                                                      */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4">
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
            description="No beats match your current search or active filter chips."
            actionLabel="Clear All Filters"
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
