import React, { useState } from 'react';
import { Youtube, Play, Film, ExternalLink, Search, Video, Plus, Sparkles, Tv } from 'lucide-react';
import { ProducerProfile } from '../types';

interface YouTubeVideo {
  id: string;
  title: string;
  youtubeId: string;
  category: string;
  description?: string;
  date?: string;
}

interface YouTubeVideosViewProps {
  youtubeVideos: YouTubeVideo[];
  profile?: ProducerProfile;
  onOpenDashboard?: () => void;
}

export const YouTubeVideosView: React.FC<YouTubeVideosViewProps> = ({
  youtubeVideos = [],
  profile,
  onOpenDashboard,
}) => {
  const allVideos = youtubeVideos;

  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(allVideos[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(allVideos.map((v) => v.category).filter(Boolean)))];

  const filteredVideos = allVideos.filter((video) => {
    const matchesCategory = selectedCategory === 'ALL' || video.category === selectedCategory;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const youtubeChannelUrl = profile?.socialLinks?.youtube || 'https://youtube.com';

  const activeVideo = selectedVideo || filteredVideos[0] || null;

  return (
    <div className="space-y-8 pb-28 text-left animate-fadeIn font-sans">
      {/* Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 bg-gradient-to-r from-red-950/70 via-purple-950/40 to-zinc-950 border border-red-500/30 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0 shadow-lg">
            <Youtube className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-wider">
                YOUTUBE VAULT
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono bg-red-900/80 text-red-200 rounded border border-red-500/40 font-bold uppercase">
                {allVideos.length} {allVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Studio Cookups · Beat Visualizers · DAW Breakdowns · Producer Vlogs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-extrabold text-xs uppercase rounded-2xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>ADD YOUTUBE VIDEO</span>
            </button>
          )}

          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase rounded-2xl shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-red-400/30"
          >
            <Youtube className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">SUBSCRIBE ON YOUTUBE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Empty State when no YouTube videos uploaded yet */}
      {allVideos.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-zinc-950/80 backdrop-blur-xl border border-zinc-850 rounded-3xl space-y-5 max-w-2xl mx-auto my-8 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-xl">
            <Youtube className="w-10 h-10 fill-current animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              NO YOUTUBE VIDEOS UPLOADED YET
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed max-w-md mx-auto">
              Only videos uploaded by you in the Producer Portal will appear on this page. Add YouTube video IDs, studio cookups, or beat visualizers to showcase them here.
            </p>
          </div>

          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-950/60 transition-all cursor-pointer border border-red-400/40 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>UPLOAD & MANAGE YOUTUBE VIDEOS</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Main Theater Video Player */}
          {activeVideo && (
            <div className="bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-850 shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-900">
                <span className="flex items-center gap-2 text-red-400 font-bold">
                  <Video className="w-4 h-4" />
                  <span>NOW STREAMING IN 4K HIGH-DEFINITION</span>
                </span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-bold">
                  {activeVideo.category || 'Official Video'}
                </span>
              </div>

              {/* Embedded YouTube iFrame Video */}
              <div className="relative aspect-video w-full rounded-2xl bg-black border border-zinc-800 overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Active Video Title & Description */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">{activeVideo.title}</h2>
                  {activeVideo.description && (
                    <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
                      {activeVideo.description}
                    </p>
                  )}
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Filter Toolbar & Search */}
          {categories.length > 1 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/40 border border-red-400/40'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search uploaded videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Video Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const isSelected = activeVideo?.id === video.id;
              const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setSelectedVideo(video);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`group flex flex-col justify-between p-4 bg-zinc-950 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500/70 ring-1 ring-red-500/40 shadow-xl shadow-red-950/20'
                      : 'border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {video.category && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-[10px] font-bold rounded">
                          {video.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-xs text-zinc-400 font-mono mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900/80 mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>UPLOADED VIDEO</span>
                    <span className="text-red-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Watch Video →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
