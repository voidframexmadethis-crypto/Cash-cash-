import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (initialGenreFilter) {
      setSelectedGenre(initialGenreFilter);
    }
  }, [initialGenreFilter]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [selectedBpmRange, setSelectedBpmRange] = useState<string>('ALL');
  const [selectedPriceMax, setSelectedPriceMax] = useState<number | 'ALL'>('ALL');
  const [selectedMood, setSelectedMood] = useState<string>('ALL');
  
  const [freeDownloadOnly, setFreeDownloadOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'bpm' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view as in uploaded screenshot
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Feature 23: Top Tracks Timeframe State
  const [topTracksTimeframe, setTopTracksTimeframe] = useState<'all' | '30days' | '7days'>('all');

  const firstTierGenres = [
    { label: '🔥 POP', value: 'POP' },
    { label: 'AFRO', value: 'AFRO' },
    { label: 'TRAP', value: 'TRAP' },
    { label: 'NEW SCHOOL', value: 'NEW SCHOOL' },
    { label: 'LATINO', value: 'LATINO' },
    { label: 'ELECTRO', value: 'ELECTRO' },
    { label: 'HIP HOP', value: 'HIP HOP' },
    { label: 'DIRTY SOUTH', value: 'DIRTY SOUTH' },
    { label: 'SMOOTH', value: 'SMOOTH' },
    { label: 'BANGER', value: 'BANGER' }
  ];

  const secondTierTags = [
    'Guitar', 'AfroPop', 'AfroBeat', 'New School', 'Smooth', 'Banger', 'Rap Fr', 'Chill', 'Pop', 'Dark', 'Melodic', 'Chill Beat', 'Urban Pop', 'AfroHouse', 'Rap Beat'
  ];

  const musicalKeys = ['ALL', 'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'F Minor', 'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'E Minor'];
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

      const matchesGenre = selectedGenre === 'ALL' || 
        beat.genre.toUpperCase() === selectedGenre.toUpperCase() || 
        beat.tags.some(t => t.toUpperCase() === selectedGenre.toUpperCase());

      const matchesTag = selectedTag === 'ALL' || 
        beat.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()) || 
        beat.genre.toLowerCase() === selectedTag.toLowerCase() || 
        beat.moods.some(m => m.toLowerCase() === selectedTag.toLowerCase());

      const matchesKey = selectedKey === 'ALL' || beat.key === selectedKey;
      
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
        matchesTag &&
        matchesKey &&
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
    selectedTag !== 'ALL' ||
    selectedKey !== 'ALL' ||
    selectedBpmRange !== 'ALL' ||
    selectedPriceMax !== 'ALL' ||
    freeDownloadOnly ||
    featuredOnly ||
    favoritesOnly;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('ALL');
    setSelectedTag('ALL');
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
    <div className="space-y-10 pb-32 text-left font-sans animate-fadeIn bg-black min-h-screen">
      
      {/* ========================================================================= */}
      {/* 25. ADVANCED STORE SEARCH BAR WITH LEFT ALIGNED SEARCH ICON              */}
      {/* ========================================================================= */}
      <div className="relative w-full px-4 mt-6">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a Beat, Genre, Type Beat..."
          className="w-full bg-[#0d0d0e] border border-zinc-900 focus:border-zinc-700 text-white rounded-xl py-3.5 pl-12 pr-6 text-sm sm:text-base font-medium focus:outline-none shadow-2xl transition-all placeholder-zinc-600"
        />
      </div>

      {/* ========================================================================= */}
      {/* DOUBLE-TIER FAST-ACCESS PILLS WITH CENTERED RESET BUTTON                 */}
      {/* ========================================================================= */}
      <div className="w-full px-4 flex flex-col items-center gap-4">
        
        {/* Tier 1: Primary Genres */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
          {firstTierGenres.map((g) => {
            const isActive = selectedGenre === g.value;
            return (
              <button
                key={g.value}
                onClick={() => {
                  setSelectedGenre(isActive ? 'ALL' : g.value);
                  setSelectedTag('ALL'); // Reset tag if genre is clicked
                }}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 border ${
                  isActive
                    ? 'bg-[#18181b] text-white border-zinc-700 shadow-lg shadow-black/40'
                    : 'bg-[#0d0d0e] text-zinc-400 hover:text-white border-transparent hover:bg-zinc-900/40'
                }`}
              >
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Specific Tags / Vibes */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
          {secondTierTags.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(isActive ? 'ALL' : tag);
                  setSelectedGenre('ALL'); // Reset genre if tag is clicked
                }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[#18181b] text-white border-zinc-700 shadow-lg shadow-black/40'
                    : 'bg-[#0d0d0e] text-zinc-500 hover:text-white border-transparent hover:bg-zinc-900/40'
                }`}
              >
                <span>{tag}</span>
              </button>
            );
          })}
        </div>

        {/* Reset Button (Centered exactly as shown in screenshot) */}
        {(isFilteringActive || selectedTag !== 'ALL') && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0d0d0e] hover:bg-[#18181b] border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Control Strip (Sort, Key, BPM selectors) */}
      <div className="w-full px-4">
        <div className="flex items-center justify-between p-3 bg-[#0d0d0e]/60 rounded-2xl border border-zinc-900">
          <div className="flex items-center gap-3">
            {/* Key Filter Dropdown */}
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-[#0d0d0e] border border-zinc-900 text-zinc-400 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
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
              className="bg-[#0d0d0e] border border-zinc-900 text-zinc-400 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
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
              className="bg-[#0d0d0e] border border-zinc-900 text-zinc-400 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="popular">Sort: Most Played</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="bpm">Sort: BPM</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0d0d0e] p-1 rounded-xl border border-zinc-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature 26: Active Filters Strip Display (Subtle helper badge) */}
        {isFilteringActive && (
          <div className="flex flex-wrap items-center gap-2 pt-3 text-xs mt-3">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full font-mono">
                <span>"{searchQuery}"</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedGenre !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full font-mono">
                <span>Genre: {selectedGenre}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedGenre('ALL')} />
              </span>
            )}
            {selectedTag !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full font-mono">
                <span>Tag: {selectedTag}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedTag('ALL')} />
              </span>
            )}
            {selectedKey !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full font-mono">
                <span>Key: {selectedKey}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedKey('ALL')} />
              </span>
            )}
            {selectedBpmRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full font-mono">
                <span>BPM: {selectedBpmRange}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedBpmRange('ALL')} />
              </span>
            )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
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
