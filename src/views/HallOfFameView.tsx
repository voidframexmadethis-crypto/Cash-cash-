import React, { useState, useEffect } from 'react';
import { Award, Lock, Download, Radio, ShieldCheck, Sparkles, Trophy, Disc, CheckCircle, Info } from 'lucide-react';
import {
  HALL_OF_FAME_MILESTONES,
  PlaqueMilestone,
  AchievementHistoryRecord,
} from '../utils/hallOfFameData';
import { exportPlaqueHighResImage } from '../utils/plaqueCanvasRenderer';

interface HallOfFameViewProps {
  producerTotalStreams: number;
  onNavigateToBrowse?: () => void;
}

export const HallOfFameView: React.FC<HallOfFameViewProps> = ({
  producerTotalStreams,
  onNavigateToBrowse,
}) => {
  const [achievementHistory, setAchievementHistory] = useState<AchievementHistoryRecord[]>(() => {
    const saved = localStorage.getItem('voodoo_achievement_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Track and record new unlock events in history when stream threshold is passed
  useEffect(() => {
    let updated = false;
    const historyMap = new Map(achievementHistory.map((h) => [h.id, h]));

    HALL_OF_FAME_MILESTONES.forEach((m) => {
      if (producerTotalStreams >= m.requiredStreams && !historyMap.has(m.id)) {
        const newRecord: AchievementHistoryRecord = {
          id: m.id,
          title: m.title,
          requiredStreams: m.requiredStreams,
          actualStreamsAtUnlock: producerTotalStreams,
          unlockDate: new Date().toISOString().split('T')[0],
          plaqueVersion: 'v1.0 Master Digital Plaque',
        };
        historyMap.set(m.id, newRecord);
        updated = true;
      }
    });

    if (updated) {
      const newList = Array.from(historyMap.values());
      setAchievementHistory(newList);
      localStorage.setItem('voodoo_achievement_history', JSON.stringify(newList));
    }
  }, [producerTotalStreams, achievementHistory]);

  const getUnlockRecord = (milestoneId: string): AchievementHistoryRecord | undefined => {
    return achievementHistory.find((h) => h.id === milestoneId);
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
      {/* Header Section (Understated & Elegant) */}
      <div className="border-b border-zinc-900 pb-8 text-center sm:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest justify-center sm:justify-start">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>CASHMERE KID$ PRODUCER LEGACY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-brand font-black text-white uppercase tracking-tight">
            RECORD PLAQUE HALL OF FAME
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium italic max-w-2xl">
            “Every milestone represents real streams earned by the music.”
          </p>
        </div>

        {/* Real Stream Count Counter HUD */}
        <div className="bg-zinc-950 border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-6 shrink-0 shadow-xl shadow-purple-950/20">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              VERIFIED PRODUCER STREAMS
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-purple-300">
              {producerTotalStreams.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Verified Data Transparency Note */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex items-start gap-3 text-xs font-mono text-zinc-400">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-200 uppercase">PRODUCER ACHIEVEMENT AUTHENTICITY GUARANTEE:</span>
          <span>
            {' '}Plaque milestones are unlocked strictly through verified audio playback streams of CASHMERE KID$ master instrumentals. No fake streams, page views, or vanity stats contribute to award progression.
          </span>
        </div>
      </div>

      {/* Plaque Milestones Grid (11 Progression Steps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {HALL_OF_FAME_MILESTONES.map((milestone) => {
          const isUnlocked = producerTotalStreams >= milestone.requiredStreams;
          const historyRecord = getUnlockRecord(milestone.id);
          const unlockDate = historyRecord
            ? historyRecord.unlockDate
            : isUnlocked
            ? new Date().toISOString().split('T')[0]
            : null;

          const ariaLabel = `${milestone.title} plaque — ${milestone.requiredStreams.toLocaleString()} verified streams — ${
            isUnlocked ? 'unlocked' : 'locked'
          }`;

          return (
            <div
              key={milestone.id}
              aria-label={ariaLabel}
              className={`relative rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                milestone.isGrammyHorn
                  ? isUnlocked
                    ? 'bg-gradient-to-b from-amber-950/60 via-zinc-950 to-black border-amber-500/60 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-400/40'
                    : 'bg-zinc-950/60 border-zinc-900'
                  : isUnlocked
                  ? milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND'
                    ? 'bg-gradient-to-b from-sky-950/60 via-zinc-950 to-black border-sky-500/50 shadow-2xl shadow-sky-950/30'
                    : 'bg-gradient-to-b from-purple-950/60 via-zinc-950 to-black border-purple-500/40 shadow-xl shadow-purple-950/30'
                  : 'bg-zinc-950/60 border-zinc-900 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Plaque Top Badge Ribbon */}
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between gap-3">
                <span
                  className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    milestone.isGrammyHorn
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : isUnlocked
                      ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {milestone.subtitle}
                </span>

                {isUnlocked ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>EARNED</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-zinc-500 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-zinc-500" />
                    <span>LOCKED</span>
                  </span>
                )}
              </div>

              {/* Plaque Canvas Artwork Mockup Display */}
              <div className="p-6 flex flex-col items-center justify-center text-center space-y-5">
                {/* Vinyl Record Centerpiece */}
                <div className="relative group">
                  <div
                    className={`w-40 h-40 rounded-full flex items-center justify-center relative shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
                      isUnlocked
                        ? milestone.isGrammyHorn
                          ? 'bg-gradient-to-tr from-amber-700 via-amber-900 to-black border-4 border-amber-400 shadow-amber-950'
                          : milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND'
                          ? 'bg-gradient-to-tr from-sky-600 via-sky-900 to-black border-4 border-sky-400 shadow-sky-950'
                          : 'bg-gradient-to-tr from-purple-600 via-purple-900 to-black border-4 border-purple-400 shadow-purple-950'
                        : 'bg-zinc-900 border-4 border-zinc-800'
                    }`}
                  >
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-5 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-8 rounded-full border border-white/10 pointer-events-none" />

                    {/* Record Center Label */}
                    <div
                      className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border shadow-inner ${
                        isUnlocked
                          ? milestone.isGrammyHorn
                            ? 'bg-amber-400 border-amber-200 text-amber-950'
                            : 'bg-purple-500 border-purple-200 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                      }`}
                    >
                      {milestone.isGrammyHorn ? (
                        <span className="text-xl">🎺</span>
                      ) : (
                        <Disc className={`w-6 h-6 ${isUnlocked ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                      )}
                    </div>
                  </div>

                  {/* Lock Overlay for Locked Plaques */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-zinc-500" />
                    </div>
                  )}
                </div>

                {/* Plaque Metallic Plate Text */}
                <div className="space-y-1.5 max-w-xs">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    PRESENTED TO CASHMERE KID$
                  </span>
                  <h3
                    className={`text-lg font-brand font-black uppercase tracking-tight ${
                      milestone.isGrammyHorn && isUnlocked
                        ? 'text-amber-300'
                        : isUnlocked
                        ? 'text-white'
                        : 'text-zinc-400'
                    }`}
                  >
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Bottom Details & Download Action */}
              <div className="p-5 border-t border-zinc-900 bg-zinc-950/90 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500">
                  <span>SERIAL #:</span>
                  <span className="font-bold text-zinc-400">{milestone.serialNumber}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-500">UNLOCK DATE:</span>
                  <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-zinc-600 italic'}>
                    {isUnlocked ? unlockDate || '2026-09-26' : 'Unlock date unavailable'}
                  </span>
                </div>

                {/* Progress bar if locked */}
                {!isUnlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>PROGRESS</span>
                      <span>
                        {producerTotalStreams.toLocaleString()} / {milestone.requiredStreams.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (producerTotalStreams / milestone.requiredStreams) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Download High-Resolution Plaque Action */}
                {isUnlocked ? (
                  <button
                    onClick={() => exportPlaqueHighResImage(milestone, true, unlockDate)}
                    className="w-full py-2.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download Digital Plaque (High-Res)</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-zinc-900/60 border border-zinc-800 text-zinc-600 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Not Yet Achieved (Locked)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Back to Store */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-brand font-black text-white text-sm uppercase">EXPLORE CASHMERE KID$ MASTER BEATS</h4>
          <p className="text-xs text-zinc-400 mt-0.5">Stream beats in the catalog to contribute to official record plaque achievements.</p>
        </div>
        {onNavigateToBrowse && (
          <button
            onClick={onNavigateToBrowse}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shrink-0"
          >
            Stream Vault Beats
          </button>
        )}
      </div>
    </div>
  );
};
