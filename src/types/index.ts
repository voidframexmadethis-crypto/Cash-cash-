export type GenreType = 'TRAP' | 'FREESTYLE TRAP' | 'DARK SYNTH' | 'HARD TRAP' | 'DRILL' | 'HYPER TRAP';

export interface BeatLicensePricing {
  mp3Lease: number;        // Standard MP3 Lease ($29.99, $39.99, etc.)
  premiumLease: number;    // WAV / Premium Lease ($79.99, $89.99, etc.)
  unlimited: number;       // Unlimited Lease ($199.99, $249.99, etc.)
  exclusive: number;       // Full Exclusive Rights ($899.99, $1200.00, etc.)
}

export interface BeatDNA {
  bpm?: number;
  key?: string;
  mood?: string;
  energy?: 'Low' | 'Medium' | 'High' | 'Explosive' | string;
  texture?: string;
  instrumentation?: string[];
  sonicCharacter?: string;
  genre?: string;
  tags?: string[];
}

export interface Beat {
  id: string;
  title: string;
  producerName?: string; // Permanently defaults to 'CASHMERE KID$'
  bpm: number;
  key: string;
  duration: string; // e.g. "2:48"
  durationSeconds: number;
  pricing: BeatLicensePricing;
  freeDownload: boolean; // Enabled/Disabled per beat
  freeDownloadType?: 'tagged' | 'untagged' | 'email_required';
  genre: GenreType;
  subGenres: string[];
  moods: string[];
  tags: string[];
  artworkUrl: string;
  audioUrl?: string;
  playCount: number;
  downloadCount: number;
  likeCount: number;
  collectionId?: string;
  featured: boolean;
  published?: boolean; // Separates published vs draft/unpublished
  isArchived?: boolean; // Private Producer Vault
  isScheduled?: boolean; // Scheduled release
  dna?: BeatDNA; // Feature 46: Beat DNA Profile
  createdDate?: string;
  updatedDate?: string;
  releaseDate: string;
  description: string;
  voiceTag: boolean;
  isNew?: boolean;
  // Internet Archive persistent storage fields
  storageProvider?: string;
  iaItemIdentifier?: string;
  iaUrl?: string;
  fileSize?: string;
  checksum?: string;
  uploadStatus?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  artworkUrl: string;
  beatCount: number;
  createdDate: string;
}

export type LicenseTierKey = 'mp3Lease' | 'premiumLease' | 'unlimited' | 'exclusive';

export interface LicenseTierInfo {
  key: LicenseTierKey;
  name: string;
  price: number;
  format: string;
  audioStreams: string;
  videoStreams: string;
  radioStations: string;
  performances: string;
  stemsIncluded: boolean;
  royaltySplit: string;
  description: string;
  popular?: boolean;
}

export interface CartItem {
  id: string;
  beatId?: string;
  beatTitle: string;
  artworkUrl: string;
  licenseKey?: LicenseTierKey;
  licenseName: string;
  price: number;
  bpm?: number;
  key?: string;
  genre?: string;
  isMerch?: boolean;
  isBeatPack?: boolean;
  beatPackId?: string;
}

export interface BeatPack {
  id: string;
  name: string;
  description: string;
  price: number;
  artworkUrl: string;
  beatIds: string[]; // List of beats in this pack
  freeDownload: boolean;
  published: boolean;
  createdDate?: string;
  storageProvider?: string;
  iaItemIdentifier?: string;
  iaUrl?: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  usageCount: number;
  expirationDate: string;
  description: string;
}

export interface FreeDownloadLead {
  id: string;
  email: string;
  beatId: string;
  beatTitle: string;
  downloadDate: string;
  ipCountry: string;
}

export interface SaleRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  beatTitle: string;
  licenseType: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export interface ProducerProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  verified: boolean;
  location: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    spotify: string;
    twitter: string;
    soundcloud: string;
    tiktok?: string;
    facebook?: string;
    appleMusic?: string;
  };
}

export interface StoreSettings {
  currency: string;
  currencySymbol: string;
  storeName: string;
  customDomain: string;
  stripeConnected: boolean;
  paypalConnected: boolean;
  requireEmailForFreeDownload: boolean;
  voiceTagFrequencySeconds: number;
  autoSendInvoices: boolean;
  merchStoreUrl?: string;
}
