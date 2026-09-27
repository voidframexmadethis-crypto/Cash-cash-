import React, { useState } from 'react';
import { Dna, Sparkles, Edit2, Save, X, Activity, Layers, Sliders, Music, Tag, Check, Info } from 'lucide-react';
import { Beat, BeatDNA } from '../types';
import { getBeatDNA } from '../utils/beatDna';

interface BeatDnaPanelProps {
  beat: Beat;
  isEditable?: boolean;
  onSaveDna?: (updatedBeat: Beat) => void;
  className?: string;
}

export const BeatDnaPanel: React.FC<BeatDnaPanelProps> = ({
  beat,
  isEditable = false,
  onSaveDna,
  className = '',
}) => {
  const dna = getBeatDNA(beat);
  const [isEditing, setIsEditing] = useState(false);

  // Form edit states
  const [mood, setMood] = useState(dna.mood || '');
  const [energy, setEnergy] = useState(dna.energy || 'High');
  const [texture, setTexture] = useState(dna.texture || '');
  const [instrumentationStr, setInstrumentationStr] = useState((dna.instrumentation || []).join(', '));
  const [sonicCharacter, setSonicCharacter] = useState(dna.sonicCharacter || '');

  const handleSave = () => {
    if (!onSaveDna) return;
    const instruments = instrumentationStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedDNA: BeatDNA = {
      bpm: beat.bpm,
      key: beat.key,
      mood,
      energy,
      texture,
      instrumentation: instruments,
      sonicCharacter,
      genre: beat.genre,
      tags: beat.tags,
    };

    const updatedBeat: Beat = {
      ...beat,
      dna: updatedDNA,
    };

    onSaveDna(updatedBeat);
    setIsEditing(false);
  };

  return (
    <div className={`p-5 bg-zinc-950 border border-purple-500/30 rounded-3xl space-y-4 text-left font-sans ${className}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Dna className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                FEATURE 46 · SONIC PROFILE
              </span>
            </div>
            <h4 className="text-sm font-brand font-black text-white uppercase tracking-wider">
              BEAT DNA™
            </h4>
          </div>
        </div>

        {isEditable && onSaveDna && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Cancel' : 'Edit DNA'}</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        /* DNA Visualization View */
        <div className="space-y-3 text-xs">
          {/* Top Key / BPM / Energy Badges */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-850 rounded-2xl">
              <span className="text-[9px] uppercase text-zinc-500 font-bold block">BPM</span>
              <span className="text-sm font-black text-purple-300">{dna.bpm} BPM</span>
            </div>
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-850 rounded-2xl">
              <span className="text-[9px] uppercase text-zinc-500 font-bold block">KEY</span>
              <span className="text-sm font-black text-white">{dna.key}</span>
            </div>
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-850 rounded-2xl">
              <span className="text-[9px] uppercase text-zinc-500 font-bold block">ENERGY</span>
              <span className="text-sm font-black text-amber-400">{dna.energy}</span>
            </div>
          </div>

          {/* DNA Attributes Grid */}
          <div className="space-y-2 font-sans pt-1">
            <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>MOOD & VIBE</span>
                <span className="text-purple-400 font-mono">GENRE: {dna.genre}</span>
              </div>
              <p className="font-semibold text-white text-xs">{dna.mood}</p>
            </div>

            <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">TEXTURE</span>
              <p className="font-semibold text-zinc-200 text-xs">{dna.texture}</p>
            </div>

            <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">INSTRUMENTATION</span>
              <div className="flex flex-wrap gap-1.5">
                {(dna.instrumentation || []).map((inst, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">SONIC CHARACTER</span>
              <p className="font-semibold text-zinc-300 text-xs leading-relaxed">{dna.sonicCharacter}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
            <Info className="w-3 h-3 text-purple-400 shrink-0" />
            <span>Producer verified sonic DNA profile used for precision recommendation pairing.</span>
          </div>
        </div>
      ) : (
        /* DNA Producer Editor View */
        <div className="space-y-3 text-xs animate-fadeIn">
          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Mood / Emotional Tone
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. Dark / Eerie / Cinematic"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Energy Level
            </label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="Low">Low (Chill / Ambient)</option>
              <option value="Medium">Medium (Rhythmic / Steady)</option>
              <option value="High">High (Energetic / Hard)</option>
              <option value="Explosive">Explosive (Peak Festival / Rager)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Texture & Feel
            </label>
            <input
              type="text"
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
              placeholder="e.g. Distorted / Atmospheric / Gritty 808"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Instrumentation (comma separated)
            </label>
            <input
              type="text"
              value={instrumentationStr}
              onChange={(e) => setInstrumentationStr(e.target.value)}
              placeholder="808, Bell, Strings, Synth, Sliding Hi-Hats"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Sonic Character Description
            </label>
            <textarea
              rows={2}
              value={sonicCharacter}
              onChange={(e) => setSonicCharacter(e.target.value)}
              placeholder="Dark / Cinematic / Spacious / Heavy Low-End"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Beat DNA Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};
