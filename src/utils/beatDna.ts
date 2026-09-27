import { Beat, BeatDNA } from '../types';

/**
 * Returns complete Beat DNA for a track.
 * If the producer manually configured DNA properties, those take precedence.
 * Otherwise, derives sonic characteristics accurately from BPM, Key, Genre, Moods, and Tags.
 */
export function getBeatDNA(beat: Beat): BeatDNA {
  if (beat.dna) {
    return {
      bpm: beat.dna.bpm || beat.bpm,
      key: beat.dna.key || beat.key,
      mood: beat.dna.mood || (beat.moods?.length ? beat.moods.join(' / ') : 'Dark / Atmospheric'),
      energy: beat.dna.energy || (beat.bpm >= 150 ? 'Explosive' : beat.bpm >= 135 ? 'High' : beat.bpm >= 115 ? 'Medium' : 'Low'),
      texture: beat.dna.texture || (beat.genre === 'DRILL' ? 'Gritty / Distorted' : beat.genre === 'DARK SYNTH' ? 'Atmospheric / Analog' : 'Crisp / Clean'),
      instrumentation: beat.dna.instrumentation && beat.dna.instrumentation.length > 0
        ? beat.dna.instrumentation
        : deriveDefaultInstrumentation(beat),
      sonicCharacter: beat.dna.sonicCharacter || deriveDefaultSonicCharacter(beat),
      genre: beat.dna.genre || beat.genre,
      tags: beat.dna.tags || beat.tags || [],
    };
  }

  return {
    bpm: beat.bpm,
    key: beat.key,
    mood: beat.moods?.length ? beat.moods.join(' / ') : 'Dark / Eerie',
    energy: beat.bpm >= 150 ? 'Explosive' : beat.bpm >= 135 ? 'High' : beat.bpm >= 115 ? 'Medium' : 'Low',
    texture: beat.genre === 'DRILL' ? 'Gritty / Sliding 808s' : beat.genre === 'DARK SYNTH' ? 'Analog / Cinematic Synth' : 'Punchy 808 / Atmospheric',
    instrumentation: deriveDefaultInstrumentation(beat),
    sonicCharacter: deriveDefaultSonicCharacter(beat),
    genre: beat.genre,
    tags: beat.tags || [],
  };
}

function deriveDefaultInstrumentation(beat: Beat): string[] {
  const list: string[] = ['808 Bass'];
  const titleLower = beat.title.toLowerCase();
  const tagsLower = (beat.tags || []).map((t) => t.toLowerCase());

  if (titleLower.includes('bell') || tagsLower.some((t) => t.includes('bell'))) {
    list.push('Bells');
  } else {
    list.push('Dark Bells');
  }

  if (titleLower.includes('string') || tagsLower.some((t) => t.includes('string') || t.includes('orchestral'))) {
    list.push('Cinematic Strings');
  } else if (beat.genre === 'DARK SYNTH' || titleLower.includes('synth')) {
    list.push('Analog Synth');
  } else {
    list.push('Layered Synths');
  }

  if (beat.genre === 'DRILL' || tagsLower.some((t) => t.includes('drill'))) {
    list.push('Sliding Hi-Hats');
  } else {
    list.push('Trap Rolls & Percs');
  }

  return list;
}

function deriveDefaultSonicCharacter(beat: Beat): string {
  const bpm = beat.bpm;
  const genre = beat.genre;
  if (genre === 'DARK SYNTH') return 'Dark / Retro-Futuristic / Wide Reverb';
  if (genre === 'DRILL') return 'Aggressive / Gritty / Sliding Low-End';
  if (genre === 'HARD TRAP') return 'Punchy / Distorted 808 / Hard-Hitting';
  if (genre === 'FREESTYLE TRAP') return 'Bounce / Rhythmic / Spacious Mix';
  if (bpm >= 140) return 'Fast-Paced / Dark / High Energy';
  return 'Atmospheric / Luxury Trap / Spacious';
}

export interface PairingResult {
  beat: Beat;
  compatibilityPercent: number;
  matchReasons: string[];
}

/**
 * Feature 47: Smart Beat Pairing
 * Computes harmonic and sonic compatibility between the source beat and catalog.
 */
export function findSmartBeatPairings(
  sourceBeat: Beat,
  catalog: Beat[],
  limit = 4
): PairingResult[] {
  if (!sourceBeat || !catalog || catalog.length === 0) return [];

  const sourceDNA = getBeatDNA(sourceBeat);

  const results: PairingResult[] = [];

  for (const candidate of catalog) {
    // Exclude same beat and any archived tracks
    if (candidate.id === sourceBeat.id || candidate.isArchived || candidate.published === false) {
      continue;
    }

    const candidateDNA = getBeatDNA(candidate);
    let score = 0;
    const reasons: string[] = [];

    // 1. BPM Similarity (Weight: up to 30 pts)
    const bpmDiff = Math.abs(sourceBeat.bpm - candidate.bpm);
    if (bpmDiff === 0) {
      score += 30;
      reasons.push(`Exact ${sourceBeat.bpm} BPM Tempo`);
    } else if (bpmDiff <= 5) {
      score += 25;
      reasons.push(`Similar BPM (±${bpmDiff} BPM)`);
    } else if (bpmDiff <= 10) {
      score += 18;
      reasons.push(`Compatible Tempo (±${bpmDiff} BPM)`);
    } else if (bpmDiff <= 20) {
      score += 10;
    }

    // 2. Key Harmony (Weight: up to 25 pts)
    const sourceKey = (sourceBeat.key || '').trim().toUpperCase();
    const candidateKey = (candidate.key || '').trim().toUpperCase();
    if (sourceKey && candidateKey) {
      if (sourceKey === candidateKey) {
        score += 25;
        reasons.push(`Matching Musical Key (${sourceKey})`);
      } else if (isHarmonicallyRelatedKey(sourceKey, candidateKey)) {
        score += 18;
        reasons.push(`Harmonically Compatible Key (${candidateKey})`);
      }
    }

    // 3. Genre Match (Weight: up to 20 pts)
    if (sourceBeat.genre === candidate.genre) {
      score += 20;
      reasons.push(`Same ${sourceBeat.genre} Subgenre`);
    }

    // 4. Energy Match (Weight: up to 10 pts)
    if (sourceDNA.energy === candidateDNA.energy) {
      score += 10;
      reasons.push(`${sourceDNA.energy} Energy Vibe`);
    }

    // 5. Instrumentation & Mood Overlap (Weight: up to 15 pts)
    const sourceInst = sourceDNA.instrumentation || [];
    const candInst = candidateDNA.instrumentation || [];
    const sharedInst = sourceInst.filter((inst) =>
      candInst.some((c) => c.toLowerCase().includes(inst.toLowerCase()) || inst.toLowerCase().includes(c.toLowerCase()))
    );
    if (sharedInst.length > 0) {
      score += Math.min(10, sharedInst.length * 4);
      reasons.push(`Shared ${sharedInst[0]}`);
    }

    const sourceTags = (sourceBeat.tags || []).map((t) => t.toLowerCase());
    const candTags = (candidate.tags || []).map((t) => t.toLowerCase());
    const sharedTags = sourceTags.filter((t) => candTags.includes(t));
    if (sharedTags.length > 0) {
      score += Math.min(5, sharedTags.length * 2);
    }

    // Normalize to 100%
    const finalPercent = Math.min(99, Math.max(30, score));

    // Only include if there's genuine compatibility
    if (finalPercent >= 40) {
      results.push({
        beat: candidate,
        compatibilityPercent: finalPercent,
        matchReasons: reasons.slice(0, 3),
      });
    }
  }

  // Sort descending by compatibility percent
  results.sort((a, b) => b.compatibilityPercent - a.compatibilityPercent);

  return results.slice(0, limit);
}

function isHarmonicallyRelatedKey(keyA: string, keyB: string): boolean {
  // Relative majors/minors or circle of fifths neighbors
  const relatives: Record<string, string> = {
    'C MIN': 'D# MAJ', 'D# MAJ': 'C MIN',
    'C# MIN': 'E MAJ', 'E MAJ': 'C# MIN',
    'D MIN': 'F MAJ', 'F MAJ': 'D MIN',
    'D# MIN': 'F# MAJ', 'F# MAJ': 'D# MIN',
    'E MIN': 'G MAJ', 'G MAJ': 'E MIN',
    'F MIN': 'G# MAJ', 'G# MAJ': 'F MIN',
    'F# MIN': 'A MAJ', 'A MAJ': 'F# MIN',
    'G MIN': 'A# MAJ', 'A# MAJ': 'G MIN',
    'G# MIN': 'B MAJ', 'B MAJ': 'G# MIN',
    'A MIN': 'C MAJ', 'C MAJ': 'A MIN',
    'A# MIN': 'C# MAJ', 'C# MAJ': 'A# MIN',
    'B MIN': 'D MAJ', 'D MAJ': 'B MIN',
  };

  const normA = keyA.replace('MIN', 'MIN').replace('MINOR', 'MIN').replace('MAJOR', 'MAJ');
  const normB = keyB.replace('MIN', 'MIN').replace('MINOR', 'MIN').replace('MAJOR', 'MAJ');

  return relatives[normA] === normB || relatives[normB] === normA;
}
