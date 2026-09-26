import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  TrendingUp,
  Sparkles,
  Play,
  Pause,
  ShoppingBag,
  Download,
  Share2,
  Search,
  CheckCircle2,
  Music,
  Clock,
  Filter,
  BarChart3,
  Volume2
} from 'lucide-react';
import { Beat } from '../types';
import { EmptyState } from '../components/EmptyState';

interface TopChartsViewProps {
  beats: Beat[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  onViewDetail: (beat: Beat) => void;
  currencySymbol: string;
  favoriteIds?: string[];
  onToggleFavorite?: (beat: Beat) => void;
}

export const TopChartsView: React.FC<TopChartsViewProps> = ({
  beats,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  onViewDetail,
  currencySymbol,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  const [chartCategory, setChartCategory] = useState<'top' | 'trending' | 'new' | 'featured'>('top');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all'>('week');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = ['ALL', 'TRAP', 'DRILL', 'HYPER TRAP', 'FREESTYLE TRAP', 'DARK SYNTH', 'HARD TRAP'];

  // Process & rank beats
  const rankedBeats = beats
    .filter((beat) => {
      const matchesGenre = selectedGenre === 'ALL' || beat.genre === selectedGenre;
      const matchesSearch =
        searchQuery === '' ||
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        chartCategory === 'featured' ? beat.featured : true;

      return matchesGenre && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (chartCategory === 'trending') {
        return (b.playCount || 0) + (b.likeCount || 0) - ((a.playCount || 0) + (a.likeCount || 0));
      }
      if (chartCategory === 'new') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (chartCategory === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      // 'top' chart default sorting by plays & release
      return (b.playCount || 0) - (a.playCount || 0) || new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-zinc-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-200">
          👑 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-zinc-950 font-black text-sm flex items-center justify-center shadow-md shadow-slate-400/20 border border-slate-100">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 text-amber-200 font-black text-sm flex items-center justify-center shadow-md border border-amber-600/40">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-extrabold text-xs flex items-center justify-center">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Top Banner Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-zinc-950 to-indigo-950 border border-purple-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Beat Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Top Charts
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
            Explore the highest-ranking productions, trending instrumentals, and top-streamed beats by <strong className="text-purple-300">CASHMERE KID$</strong>.
          </p>
        </div>

        {/* Ambient background graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-indigo-900/10 to-transparent pointer-events-none" />
      </div>

      {/* Chart Categories & Time Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900 shadow-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setChartCategory('top')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              chartCategory === 'top'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Beats</span>
          </button>
          <button
            onClick={() => setChartCategory('trending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              chartCategory === 'trending'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Trending Now</span>
          </button>
          <button
            onClick={() => setChartCategory('new')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              chartCategory === 'new'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>New Entries</span>
          </button>
          <button
            onClick={() => setChartCategory('featured')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              chartCategory === 'featured'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Featured Vault</span>
          </button>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setTimePeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timePeriod === 'week' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timePeriod === 'month' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timePeriod === 'all' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Genre Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Genre Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedGenre === g
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chart rankings..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white text-xs rounded-xl py-2 pl-3 pr-8 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Ranked Chart List */}
      {rankedBeats.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="NO CHARTS DATA YET"
          description="There are currently no published beats matching this category or genre filter. Publish beats from the Studio Dashboard to populate the official rankings."
          actionLabel="Reset Chart Filters"
          onAction={() => {
            setSelectedGenre('ALL');
            setSearchQuery('');
            setChartCategory('top');
          }}
        />
      ) : (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl divide-y divide-zinc-900">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Title & Producer</div>
            <div className="col-span-2 text-center">BPM / Key</div>
            <div className="col-span-1 text-center">Genre</div>
            <div className="col-span-3 text-right">License & Actions</div>
          </div>

          {/* Chart Beats Rows */}
          {rankedBeats.map((beat, idx) => {
            const isCurrent = currentBeat?.id === beat.id;
            const isThisPlaying = isCurrent && isPlaying;
            const rank = idx + 1;

            return (
              <div
                key={beat.id}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center transition-colors hover:bg-zinc-900/60 ${
                  isCurrent ? 'bg-purple-950/20 border-l-4 border-l-purple-500' : ''
                }`}
              >
                {/* Rank Badge */}
                <div className="col-span-1 flex items-center justify-between md:justify-center gap-2">
                  <div className="flex items-center gap-3">
                    {getRankBadge(rank)}
                    <span className="md:hidden font-bold text-xs text-zinc-400">Rank #{rank}</span>
                  </div>
                </div>

                {/* Artwork & Title & Producer */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 group/art bg-zinc-900 border border-zinc-800 shadow-md">
                    <img
                      src={beat.artworkUrl}
                      alt={beat.title}
                      className="w-full h-full object-cover transition-transform group-hover/art:scale-110"
                    />
                    <button
                      onClick={() => onPlayToggle(beat)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-6 h-6 text-purple-400 fill-purple-400" />
                      ) : (
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      )}
                    </button>
                    {isThisPlaying && (
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetail(beat)}
                        className="font-extrabold text-sm text-white hover:text-purple-300 transition-colors truncate max-w-[200px] sm:max-w-[280px]"
                      >
                        {beat.title}
                      </button>
                      {beat.featured && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold text-[9px] uppercase">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
                      <span>CASHMERE KID$</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
                    </div>

                    <div className="md:hidden flex items-center gap-2 text-[11px] text-zinc-500 font-mono pt-1">
                      <span>{beat.bpm} BPM</span>
                      <span>·</span>
                      <span>{beat.key}</span>
                      <span>·</span>
                      <span className="text-purple-400">{beat.genre}</span>
                    </div>
                  </div>
                </div>

                {/* BPM & Key (Desktop) */}
                <div className="hidden md:flex col-span-2 flex-col items-center justify-center text-xs font-mono text-zinc-300">
                  <span className="font-bold">{beat.bpm} BPM</span>
                  <span className="text-[11px] text-zinc-500">{beat.key}</span>
                </div>

                {/* Genre (Desktop) */}
                <div className="hidden md:flex col-span-1 items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {beat.genre}
                  </span>
                </div>

                {/* License Price & Action Buttons */}
                <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-900">
                  <div className="text-left md:text-right pr-2">
                    <div className="text-xs font-extrabold text-white">
                      {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium">MP3 Lease</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Free Download button if enabled */}
                    {beat.freeDownload && (
                      <button
                        onClick={() => onFreeDownloadClick(beat)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                        title="Free Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {/* Share Button */}
                    <button
                      onClick={() => onShareClick(beat)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden sm:block"
                      title="Share Beat"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Buy Button */}
                    <button
                      onClick={() => onBuyClick(beat)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-950 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy</span>
                    </button>
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
