import { getInventoryData, updateInventoryItem } from '@/lib/inventory-data';

const STORAGE_KEY = 'pharmadash-locations';
const INITIAL_LOCATIONS = ['Warehouse A', 'Distribution Hub B', 'Warehouse C'];
let locationStore = [...INITIAL_LOCATIONS];

const persist = () => { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(locationStore)); };

export const initializeLocationStore = () => {
  if (typeof window === 'undefined') return;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved) && saved.length && saved.every(value => typeof value === 'string' && value.trim())) {
      locationStore = saved;
    } else {
      locationStore = [...new Set([...INITIAL_LOCATIONS, ...getInventoryData().map(item => item.location)])];
    }
  } catch { locationStore = [...new Set([...INITIAL_LOCATIONS, ...getInventoryData().map(item => item.location)])]; }
};
initializeLocationStore();

export const getLocations = () => [...locationStore].sort((a, b) => a.localeCompare(b));

export const createLocation = (name: string): string | null => {
  const value = name.trim();
  if (!value || locationStore.some(location => location.toLowerCase() === value.toLowerCase())) return null;
  locationStore = [...locationStore, value];
  persist();
  return value;
};

export const renameLocation = (oldName: string, newName: string): boolean => {
  const value = newName.trim();
  if (!value || value !== oldName && locationStore.some(location => location.toLowerCase() === value.toLowerCase())) return false;
  if (!locationStore.includes(oldName)) return false;
  locationStore = locationStore.map(location => location === oldName ? value : location);
  getInventoryData().filter(item => item.location === oldName).forEach(item => updateInventoryItem(item.id, { ...item, location: value }));
  persist();
  return true;
};

export const deleteLocation = (name: string): boolean => {
  if (!locationStore.includes(name) || getInventoryData().some(item => item.location === name)) return false;
  locationStore = locationStore.filter(location => location !== name);
  persist();
  return true;
};
