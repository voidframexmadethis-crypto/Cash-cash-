export interface AudienceEvent {
  id: string;
  type: 'beat_played' | 'beat_favorited' | 'free_download' | 'purchase_completed' | 'product_viewed' | 'collection_viewed';
  title: string;
  details?: string;
  beatId?: string;
  beatTitle?: string;
  amount?: number;
  timestamp: string;
}

const STORAGE_KEY = 'voodoo_audience_events';

export const getAudienceEvents = (): AudienceEvent[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse audience events', e);
  }
  return [];
};

export const logAudienceEvent = (event: Omit<AudienceEvent, 'id' | 'timestamp'>) => {
  try {
    const events = getAudienceEvents();
    const newEvent: AudienceEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEvent, ...events].slice(0, 100); // keep last 100 real events
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEvent;
  } catch (e) {
    console.error('Failed to log audience event', e);
  }
};
