import React, { useState, useEffect } from 'react';
import { Activity, Play, Heart, Download, ShoppingBag, Eye, Layers, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { AudienceEvent, getAudienceEvents } from '../../utils/activityTracker';

export const AudienceActivityTimeline: React.FC = () => {
  const [events, setEvents] = useState<AudienceEvent[]>([]);

  useEffect(() => {
    const loaded = getAudienceEvents();
    setEvents(loaded);

    // Refresh every 5 seconds or on storage event
    const interval = setInterval(() => {
      setEvents(getAudienceEvents());
    }, 5000);

    const handleStorage = () => setEvents(getAudienceEvents());
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const getEventIcon = (type: AudienceEvent['type']) => {
    switch (type) {
      case 'beat_played':
        return <Play className="w-4 h-4 text-purple-400" />;
      case 'beat_favorited':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'free_download':
        return <Download className="w-4 h-4 text-cyan-400" />;
      case 'purchase_completed':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'product_viewed':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'collection_viewed':
        return <Layers className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatEventTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} · ${timeStr}`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              FEATURE 42 · AUDIENCE ACTIVITY TIMELINE
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            LIVE STOREFRONT ENGAGEMENT STREAM
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Chronological audit log of storefront events, preview streaming, and customer interactions.
          </p>
        </div>

        <button
          onClick={() => setEvents(getAudienceEvents())}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  {getEventIcon(evt.type)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{evt.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">{evt.details || evt.beatTitle}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[11px] text-zinc-500 font-medium">
                  {formatEventTime(evt.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
          <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No audience activity yet.</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            When visitors play beats, favorite tracks, download demos, or complete license orders, real-time activity events will populate here chronologically.
          </p>
        </div>
      )}
    </div>
  );
};
