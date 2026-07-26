import { PurchaseRecord } from '@/types/inventory';

const STORAGE_KEY = 'pharmadash-daily-purchases';

let purchaseStore: PurchaseRecord[] = [];

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
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    purchaseStore = Array.isArray(stored) ? stored.filter(isValidRecord) : [];
  } catch {
    purchaseStore = [];
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
