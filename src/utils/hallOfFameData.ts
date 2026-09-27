/**
 * CASHMERE KID$ Digital Record Plaque Hall of Fame
 * Authoritative Milestone Definitions and Stream Count Architecture
 */

export type PlaqueBadgeType =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'TITANIUM'
  | 'DIAMOND'
  | 'ULTRA_DIAMOND'
  | 'GRAMMY_HORN';

export interface PlaqueMilestone {
  id: string;
  requiredStreams: number;
  title: string;
  subtitle: string;
  badgeType: PlaqueBadgeType;
  description: string;
  serialNumber: string;
  isGrammyHorn?: boolean;
}

export interface AchievementHistoryRecord {
  id: string;
  title: string;
  requiredStreams: number;
  actualStreamsAtUnlock: number;
  unlockDate: string;
  plaqueVersion: string;
}

export const HALL_OF_FAME_MILESTONES: PlaqueMilestone[] = [
  {
    id: 'stream-100',
    requiredStreams: 100,
    title: 'First Record Achievement',
    subtitle: '100 VERIFIED STREAMS',
    badgeType: 'BRONZE',
    description: 'Celebrating the first 100 verified master streams across the CASHMERE KID$ store catalog.',
    serialNumber: 'CK-PLAQUE-100-2026',
  },
  {
    id: 'stream-400',
    requiredStreams: 400,
    title: 'Second Record Achievement',
    subtitle: '400 VERIFIED STREAMS',
    badgeType: 'SILVER',
    description: 'In recognition of exceeding 400 verified audio streams.',
    serialNumber: 'CK-PLAQUE-400-2026',
  },
  {
    id: 'stream-700',
    requiredStreams: 700,
    title: 'Third Record Achievement',
    subtitle: '700 VERIFIED STREAMS',
    badgeType: 'GOLD',
    description: 'In recognition of exceeding 700 verified audio streams.',
    serialNumber: 'CK-PLAQUE-700-2026',
  },
  {
    id: 'stream-1k',
    requiredStreams: 1000,
    title: '1K Record Achievement',
    subtitle: '1,000 VERIFIED STREAMS',
    badgeType: 'GOLD',
    description: 'Commercial stream milestone marking 1,000 verified master streams.',
    serialNumber: 'CK-PLAQUE-1K-2026',
  },
  {
    id: 'stream-10k',
    requiredStreams: 10000,
    title: '10K Record Achievement',
    subtitle: '10,000 VERIFIED STREAMS',
    badgeType: 'PLATINUM',
    description: 'Major streaming landmark exceeding 10,000 verified listens.',
    serialNumber: 'CK-PLAQUE-10K-2026',
  },
  {
    id: 'stream-45k',
    requiredStreams: 45000,
    title: '45K Record Achievement',
    subtitle: '45,000 VERIFIED STREAMS',
    badgeType: 'PLATINUM',
    description: 'High-rotation milestone surpassing 45,000 verified audio streams.',
    serialNumber: 'CK-PLAQUE-45K-2026',
  },
  {
    id: 'stream-85k',
    requiredStreams: 85000,
    title: '85K Record Achievement',
    subtitle: '85,000 VERIFIED STREAMS',
    badgeType: 'TITANIUM',
    description: 'Heavyweight streaming milestone reaching 85,000 verified plays.',
    serialNumber: 'CK-PLAQUE-85K-2026',
  },
  {
    id: 'stream-140k',
    requiredStreams: 140000,
    title: '140K Record Achievement',
    subtitle: '140,000 VERIFIED STREAMS',
    badgeType: 'TITANIUM',
    description: 'Elite radio and digital stream landmark passing 140,000 verified streams.',
    serialNumber: 'CK-PLAQUE-140K-2026',
  },
  {
    id: 'stream-1m',
    requiredStreams: 1000000,
    title: 'DIAMOND',
    subtitle: '1,000,000 VERIFIED STREAMS',
    badgeType: 'DIAMOND',
    description: 'Certified 1,000,000 Master Streams Diamond Disc Award.',
    serialNumber: 'CK-PLAQUE-1M-2026',
  },
  {
    id: 'stream-2m',
    requiredStreams: 2000000,
    title: 'ULTRA PLATINUM DIAMOND',
    subtitle: '2,000,000 VERIFIED STREAMS',
    badgeType: 'ULTRA_DIAMOND',
    description: 'Double Million Multi-Platinum Diamond Master Record Plaque.',
    serialNumber: 'CK-PLAQUE-2M-2026',
  },
  {
    id: 'stream-3m',
    requiredStreams: 3000000,
    title: 'GRAMMY HORN',
    subtitle: '3,000,000 VERIFIED STREAMS',
    badgeType: 'GRAMMY_HORN',
    description: 'The pinnacle CASHMERE KID$ Independent Master Achievement for 3 Million Verified Streams.',
    serialNumber: 'CK-PLAQUE-3M-GRAMMY-HORN-2026',
    isGrammyHorn: true,
  },
];
