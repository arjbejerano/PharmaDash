import { PurchaseRecord } from '@/types/inventory';

const STORAGE_KEY = 'pharmadash-daily-purchases';

let purchaseStore: PurchaseRecord[] = [];

const createSeedPurchases = (): PurchaseRecord[] => {
  const records: PurchaseRecord[] = [];
  const today = new Date();
  for (let drug = 1; drug <= 25; drug++) {
    for (let offset = 1; offset <= 28; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      // Randomized daily purchase volumes make the demo data feel more realistic across all products.
      const units = Math.max(0, Math.round(4 + Math.random() * 28 + (drug % 4) + (offset % 3)));
      records.push({ drugId: `DRUG${String(drug).padStart(3, '0')}`, date: dateKey, units });
    }
  }
  return records;
};

const isValidRecord = (value: unknown): value is PurchaseRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as PurchaseRecord;
  return typeof record.drugId === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(record.date)
    && Number.isInteger(record.units)
    && record.units >= 0;
};

const persist = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseStore));
  }
};

export const initializePurchaseStore = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = JSON.parse(raw ?? '[]');
    purchaseStore = Array.isArray(stored) ? stored.filter(isValidRecord) : [];
    if (!purchaseStore.length) {
      purchaseStore = createSeedPurchases();
      persist();
    }
  } catch {
    purchaseStore = createSeedPurchases();
    persist();
  }
};

initializePurchaseStore();

export const getPurchaseRecords = (drugId: string): PurchaseRecord[] =>
  purchaseStore
    .filter(record => record.drugId === drugId)
    .sort((a, b) => b.date.localeCompare(a.date));

export const getAllPurchaseRecords = (): PurchaseRecord[] =>
  [...purchaseStore].sort((a, b) => b.date.localeCompare(a.date));

export const savePurchaseRecord = (record: PurchaseRecord): PurchaseRecord => {
  const normalized = { ...record, units: Math.max(0, Math.round(record.units)) };
  const existingIndex = purchaseStore.findIndex(item =>
    item.drugId === normalized.drugId && item.date === normalized.date
  );

  purchaseStore = existingIndex === -1
    ? [...purchaseStore, normalized]
    : purchaseStore.map((item, index) => index === existingIndex ? normalized : item);
  persist();
  return normalized;
};

export const deletePurchaseRecord = (drugId: string, date: string): boolean => {
  const next = purchaseStore.filter(record => record.drugId !== drugId || record.date !== date);
  if (next.length === purchaseStore.length) return false;
  purchaseStore = next;
  persist();
  return true;
};
