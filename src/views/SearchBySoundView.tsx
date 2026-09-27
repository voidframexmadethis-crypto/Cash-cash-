import React, { useState } from 'react';
import {
  Volume2,
  Sliders,
  Sparkles,
  Play,
  Pause,
  ShoppingBag,
  CheckCircle2,
  Radio,
  Share2,
  Download,
  Search,
  Activity,
  Layers,
  ListMusic,
  Check
} from 'lucide-react';
import { Beat } from '../types';

interface SearchBySoundViewProps {
  beats: Beat[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  onPlayToggle: (beat: Beat) => void;
  onBuyClick: (beat: Beat) => void;
  onFreeDownloadClick: (beat: Beat) => void;
  onShareClick: (beat: Beat) => void;
  currencySymbol: string;
}

export const SearchBySoundView: React.FC<SearchBySoundViewProps> = ({
  beats,
  currentBeat,
  isPlaying,
  onPlayToggle,
  onBuyClick,
  onFreeDownloadClick,
  onShareClick,
  currencySymbol,
}) => {
  const [analyzingBeat, setAnalyzingBeat] = useState<Beat | null>(null);
  const [matchedBeats, setMatchedBeats] = useState<{ beat: Beat; matchPercent: number }[] | null>(null);

  const handleFindSimilar = (sourceBeat: Beat) => {
    setAnalyzingBeat(sourceBeat);
    setMatchedBeats(null);

    // Simulate real acoustic AI match analysis
    setTimeout(() => {
      const remaining = beats.filter((b) => b.id !== sourceBeat.id);
      const matches = remaining.map((b, idx) => ({
        beat: b,
        matchPercent: Math.max(82, 99 - idx * 4 - Math.floor(Math.random() * 3)),
      }));
      setMatchedBeats(matches);
    }, 1200);
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Hero Banner Section - Find Beats by Sound, not Words */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950 via-purple-950/80 to-black border border-purple-500/30 p-8 sm:p-16 text-center space-y-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-black/80 to-black pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>ACOUSTIC AI INTELLIGENCE</span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Find Beats by Sound, not Words
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Skip keyword searching. Select any track from our vault and our acoustic audio engine will find every beat in Cashmere Kid$'s catalog with identical BPM, key, harmonic density, and sonic vibe.
          </p>
        </div>
      </div>

      {/* Section: What is Search by Sound? */}
      <div className="space-y-8 w-full px-2">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">What is Search by Sound?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1: Start */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Step 1</div>
              <h3 className="text-lg font-bold text-white mt-0.5">Start</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Find a beat you like on the Voodoo Boomin Vault and click <b className="text-purple-300">Find Similar</b>.
            </p>
          </div>

          {/* Step 2: Analyze */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Step 2</div>
              <h3 className="text-lg font-bold text-white mt-0.5">Analyze</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our proprietary AI-driven technology analyzes the acoustic profile of the beat.
            </p>
          </div>

          {/* Step 3: Match */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <Sliders className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Step 3</div>
              <h3 className="text-lg font-bold text-white mt-0.5">Match</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We find the beats that are most similar to the selected beat, purely by audio reference.
            </p>
          </div>

          {/* Step 4: Results */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <ListMusic className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Step 4</div>
              <h3 className="text-lg font-bold text-white mt-0.5">Results</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We return the beats that are most acoustically similar! No keywords, tags, or guesswork required!
            </p>
          </div>
        </div>
      </div>

      {/* Featured Acoustic Carousel Cards (Matching IMG_3766.png top row) */}
      <div className="space-y-4 w-full px-2">
        <h3 className="text-xl font-bold text-white">Featured Audio References</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {beats.slice(0, 5).map((beat) => (
            <div key={beat.id} className="bg-zinc-900 border border-purple-900/30 rounded-2xl p-3.5 space-y-3 hover:border-purple-500/60 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <img src={beat.artworkUrl} alt={beat.title} className="w-full aspect-square object-cover rounded-xl shadow-lg" />
                <div className="text-center">
                  <h4 className="font-extrabold text-white text-xs truncate">{beat.title}</h4>
                  <p className="text-[11px] text-zinc-400">By Cashmere Kid$</p>
                </div>
              </div>

              <button
                onClick={() => handleFindSimilar(beat)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-950"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Find similar</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Top Beats Today */}
      <div className="space-y-4 w-full px-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Top Beats Today</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Take a listen to the beats below and click <b className="text-purple-300">‘Find Similar’</b> to find beats in Cashmere Kid$'s catalog that sound similar.
          </p>
        </div>

        <div className="space-y-3">
          {beats.map((beat, idx) => {
            const isSelected = currentBeat?.id === beat.id;
            return (
              <div
                key={beat.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isSelected ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-950' : 'bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="font-mono font-bold text-zinc-500 text-sm w-4">{idx + 1}</span>
                  <div className="relative group cursor-pointer" onClick={() => onPlayToggle(beat)}>
                    <img src={beat.artworkUrl} alt={beat.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isSelected && isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-white text-sm hover:text-purple-300 transition-colors cursor-pointer" onClick={() => onPlayToggle(beat)}>
                        {beat.title}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950" />
                    </div>
                    <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                      <span>Cashmere Kid$</span>
                      <span>•</span>
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>{beat.key}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onBuyClick(beat)}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold rounded-xl"
                  >
                    🛒 {currencySymbol}{beat.pricing.mp3Lease.toFixed(2)}
                  </button>

                  <button
                    onClick={() => handleFindSimilar(beat)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-950 transition-all hover:scale-105"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Find similar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Hidden Gems (Matching IMG_3767.png) */}
      <div className="space-y-4 w-full px-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Hidden Gems</h2>
          <p className="text-xs text-zinc-400 mt-1">
            We’ve curated a selection of some of our favourite beats for you, find similar sounding beats now.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {beats.slice(0, 6).map((beat) => (
            <div key={beat.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3">
                <img src={beat.artworkUrl} alt={beat.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">{beat.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">Voodoo Boomin ✔</p>
                </div>
              </div>

              <button
                onClick={() => handleFindSimilar(beat)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-950"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Find similar</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Acoustic AI Match Overlay Modal */}
      {analyzingBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-purple-500/40 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setAnalyzingBeat(null);
                setMatchedBeats(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <span>ACOUSTIC AI MATCHER</span>
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                Acoustic Analysis for "{analyzingBeat.title}"
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Matching {analyzingBeat.bpm} BPM · Key: {analyzingBeat.key} · Genre: {analyzingBeat.genre}
              </p>
            </div>

            {!matchedBeats ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center mx-auto animate-pulse">
                  <Sliders className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
                <div className="text-xs font-mono text-purple-300 font-bold">
                  Extracting waveform harmonics & drum transients...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Top Acoustically Similar Beats Found
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {matchedBeats.map(({ beat, matchPercent }) => (
                    <div key={beat.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <div className="font-extrabold text-white text-xs">{beat.title}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{beat.bpm} BPM · {beat.key}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-purple-950 text-purple-300 font-mono font-extrabold text-xs rounded-lg border border-purple-500/30">
                          {matchPercent}% MATCH
                        </span>

                        <button
                          onClick={() => {
                            onPlayToggle(beat);
                            setAnalyzingBeat(null);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl"
                        >
                          Listen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
