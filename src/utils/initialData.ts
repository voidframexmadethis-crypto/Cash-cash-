import {
  Beat,
  Collection,
  FreeDownloadLead,
  ProducerProfile,
  Promotion,
  SaleRecord,
  StoreSettings,
  BeatPack,
} from '../types';

export const INITIAL_PRODUCER_PROFILE: ProducerProfile = {
  name: 'CASHMERE KID$',
  handle: '@cashmerekid',
  avatarUrl: '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
  bannerUrl: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
  bio: 'Multi-Platinum & Grammy-Nominated Audio Architect crafting luxury instrumentals for world-tier recording artists. Beats built for the next era.',
  verified: true,
  location: 'Atlanta / Los Angeles / Tokyo',
  socialLinks: {
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    spotify: 'https://spotify.com',
    twitter: 'https://twitter.com',
    soundcloud: 'https://soundcloud.com',
  },
};

export const INITIAL_COLLECTIONS: Collection[] = [];

export const INITIAL_BEATS: Beat[] = [];

export const INITIAL_PROMOTIONS: Promotion[] = [];

// Clean zero-state arrays for real transaction history (NO fake sales or fake customers!)
export const INITIAL_SALES_RECORDS: SaleRecord[] = [];
export const INITIAL_FREE_DOWNLOAD_LEADS: FreeDownloadLead[] = [];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  currency: 'USD',
  currencySymbol: '$',
  storeName: 'CASHMERE KID$',
  customDomain: 'cashmerekid.com',
  stripeConnected: true,
  paypalConnected: false,
  requireEmailForFreeDownload: true,
  voiceTagFrequencySeconds: 15,
  autoSendInvoices: true,
};

export const INITIAL_BEAT_PACKS: BeatPack[] = [];
