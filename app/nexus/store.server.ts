export type NexusPublishEntry = {
  id: string;
  source: string;
  key: string;
  type: string;
  items: unknown;
  at: string;
  receivedAt: string;
};

const MAX_ENTRIES = 50;
const entries: NexusPublishEntry[] = [];

export function recordPublish(entry: Omit<NexusPublishEntry, 'id' | 'receivedAt'>): NexusPublishEntry {
  const stored: NexusPublishEntry = {
    ...entry,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  entries.unshift(stored);
  entries.length = Math.min(entries.length, MAX_ENTRIES);
  return stored;
}

export function getRecentPublishes(limit = 20): NexusPublishEntry[] {
  return entries.slice(0, limit);
}
