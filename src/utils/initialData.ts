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

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-runway',
    name: 'THE RUNWAY COLLECTION',
    description: 'Ultra-exclusive trap & dark synth compositions tailored for high-fashion runway shows and international campaigns.',
    artworkUrl: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
    beatCount: 4,
    createdDate: '2026-03-01',
  },
  {
    id: 'col-obsidian',
    name: 'THE OBSIDIAN VAULT',
    description: 'Heavy 808s, analog modular synth basslines, and hypnotic atmospheric pads engineered for multi-platinum vocalists.',
    artworkUrl: '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
    beatCount: 3,
    createdDate: '2026-03-10',
  },
];

export const INITIAL_BEATS: Beat[] = [];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    code: 'CASHMERE50',
    discountPercent: 50,
    active: true,
    usageCount: 0,
    expirationDate: '2026-12-31',
    description: '50% OFF All Non-Exclusive Leases for VIP Artist Members',
  },
];

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

export const INITIAL_BEAT_PACKS: BeatPack[] = [
  {
    id: 'pack-platinum-vault',
    name: 'CASHMERE PLATINUM VAULT BUNDLE',
    description: 'All 4 luxury chart-ready trap & dark synth masters bundled with full WAV stems and commercial release contracts.',
    artworkUrl: '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
    beatIds: [
      'beat-obsidian-runway',
      'beat-velvet-vault',
      'beat-platinum-runway',
      'beat-dark-synthesis',
    ],
    price: 99.99,
    freeDownload: false,
    published: true,
    createdDate: '2026-03-25',
  },
];
