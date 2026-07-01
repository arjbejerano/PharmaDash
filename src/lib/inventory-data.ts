import { InventoryItem, InventoryItemInput, InventoryStats } from '@/types/inventory';

const STORAGE_KEY = 'pharmadash-inventory';

// Sample pharmaceutical inventory data (20-30 products)
const SEED_INVENTORY_DATA: InventoryItem[] = [
  {
    id: 'DRUG001',
    name: 'Amoxicillin 500mg',
    currentStock: 45,
    reorderPoint: 100,
    maxStock: 500,
    location: 'Warehouse A',
    category: 'Antibiotics',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG002',
    name: 'Ibuprofen 200mg',
    currentStock: 250,
    reorderPoint: 150,
    maxStock: 800,
    location: 'Distribution Hub B',
    category: 'Pain Relief',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG003',
    name: 'Metformin 850mg',
    currentStock: 80,
    reorderPoint: 120,
    maxStock: 600,
    location: 'Warehouse A',
    category: 'Diabetes',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG004',
    name: 'Lisinopril 10mg',
    currentStock: 320,
    reorderPoint: 100,
    maxStock: 500,
    location: 'Distribution Hub B',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG005',
    name: 'Omeprazole 20mg',
    currentStock: 75,
    reorderPoint: 90,
    maxStock: 400,
    location: 'Warehouse C',
    category: 'Gastric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG006',
    name: 'Atorvastatin 40mg',
    currentStock: 180,
    reorderPoint: 80,
    maxStock: 350,
    location: 'Warehouse A',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG007',
    name: 'Levothyroxine 50mcg',
    currentStock: 65,
    reorderPoint: 100,
    maxStock: 300,
    location: 'Distribution Hub B',
    category: 'Endocrine',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG008',
    name: 'Amlodipine 5mg',
    currentStock: 220,
    reorderPoint: 120,
    maxStock: 450,
    location: 'Warehouse C',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG009',
    name: 'Metoprolol 50mg',
    currentStock: 95,
    reorderPoint: 110,
    maxStock: 400,
    location: 'Warehouse A',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG010',
    name: 'Hydrochlorothiazide 25mg',
    currentStock: 160,
    reorderPoint: 80,
    maxStock: 300,
    location: 'Distribution Hub B',
    category: 'Diuretics',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG011',
    name: 'Prednisone 20mg',
    currentStock: 40,
    reorderPoint: 60,
    maxStock: 200,
    location: 'Warehouse C',
    category: 'Corticosteroids',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG012',
    name: 'Gabapentin 300mg',
    currentStock: 130,
    reorderPoint: 70,
    maxStock: 250,
    location: 'Warehouse A',
    category: 'Neurological',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG013',
    name: 'Sertraline 50mg',
    currentStock: 85,
    reorderPoint: 100,
    maxStock: 300,
    location: 'Distribution Hub B',
    category: 'Psychiatric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG014',
    name: 'Losartan 50mg',
    currentStock: 200,
    reorderPoint: 90,
    maxStock: 350,
    location: 'Warehouse C',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG015',
    name: 'Pantoprazole 40mg',
    currentStock: 55,
    reorderPoint: 80,
    maxStock: 250,
    location: 'Warehouse A',
    category: 'Gastric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG016',
    name: 'Tramadol 50mg',
    currentStock: 110,
    reorderPoint: 60,
    maxStock: 200,
    location: 'Distribution Hub B',
    category: 'Pain Relief',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG017',
    name: 'Clopidogrel 75mg',
    currentStock: 70,
    reorderPoint: 90,
    maxStock: 300,
    location: 'Warehouse C',
    category: 'Anticoagulants',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG018',
    name: 'Furosemide 40mg',
    currentStock: 140,
    reorderPoint: 70,
    maxStock: 250,
    location: 'Warehouse A',
    category: 'Diuretics',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG019',
    name: 'Warfarin 5mg',
    currentStock: 35,
    reorderPoint: 50,
    maxStock: 150,
    location: 'Distribution Hub B',
    category: 'Anticoagulants',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG020',
    name: 'Insulin Glargine 100U/mL',
    currentStock: 25,
    reorderPoint: 40,
    maxStock: 100,
    location: 'Warehouse C',
    category: 'Diabetes',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG021',
    name: 'Alprazolam 0.5mg',
    currentStock: 90,
    reorderPoint: 50,
    maxStock: 150,
    location: 'Warehouse A',
    category: 'Psychiatric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG022',
    name: 'Montelukast 10mg',
    currentStock: 120,
    reorderPoint: 80,
    maxStock: 250,
    location: 'Distribution Hub B',
    category: 'Respiratory',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG023',
    name: 'Escitalopram 10mg',
    currentStock: 60,
    reorderPoint: 75,
    maxStock: 200,
    location: 'Warehouse C',
    category: 'Psychiatric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  },
  {
    id: 'DRUG024',
    name: 'Rosuvastatin 20mg',
    currentStock: 150,
    reorderPoint: 70,
    maxStock: 300,
    location: 'Warehouse A',
    category: 'Cardiovascular',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: false
  },
  {
    id: 'DRUG025',
    name: 'Duloxetine 60mg',
    currentStock: 45,
    reorderPoint: 60,
    maxStock: 180,
    location: 'Distribution Hub B',
    category: 'Psychiatric',
    lastUpdated: new Date().toISOString(),
    isUrgentReorder: true
  }
];

const applyUrgentFlag = (item: InventoryItem): InventoryItem => ({
  ...item,
  isUrgentReorder: item.currentStock <= item.reorderPoint,
});

const normalizeInventory = (items: InventoryItem[]): InventoryItem[] =>
  items.map(applyUrgentFlag);

const cloneSeedData = (): InventoryItem[] =>
  normalizeInventory(
    SEED_INVENTORY_DATA.map(item => ({
      ...item,
      lastUpdated: new Date().toISOString(),
    }))
  );

let inventoryStore: InventoryItem[] = cloneSeedData();

const persistInventory = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryStore));
};

const loadInventoryFromStorage = (): InventoryItem[] | null => {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as InventoryItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return normalizeInventory(parsed);
  } catch {
    return null;
  }
};

export const initializeInventoryStore = () => {
  inventoryStore = loadInventoryFromStorage() ?? cloneSeedData();
};

initializeInventoryStore();

const generateDrugId = (): string => {
  const numbers = inventoryStore.map(item => {
    const match = item.id.match(/^DRUG(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const next = Math.max(0, ...numbers) + 1;
  return `DRUG${String(next).padStart(3, '0')}`;
};

export const getInventoryStats = (): InventoryStats => {
  const locations = new Set(inventoryStore.map(item => item.location));
  return {
    total: inventoryStore.length,
    urgentCount: inventoryStore.filter(item => item.isUrgentReorder).length,
    locationCount: locations.size,
  };
};

export const getInventoryData = (): InventoryItem[] => {
  return inventoryStore.map(item => ({
    ...item,
    lastUpdated: new Date().toISOString(),
  }));
};

export const getInventoryItem = (id: string): InventoryItem | undefined => {
  return inventoryStore.find(item => item.id === id);
};

export const createInventoryItem = (input: InventoryItemInput): InventoryItem => {
  const item = applyUrgentFlag({
    id: generateDrugId(),
    ...input,
    lastUpdated: new Date().toISOString(),
  });

  inventoryStore = [...inventoryStore, item];
  persistInventory();
  return item;
};

export const updateInventoryItem = (
  id: string,
  input: InventoryItemInput
): InventoryItem | null => {
  const index = inventoryStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const updated = applyUrgentFlag({
    ...inventoryStore[index],
    ...input,
    id,
    lastUpdated: new Date().toISOString(),
  });

  inventoryStore = [
    ...inventoryStore.slice(0, index),
    updated,
    ...inventoryStore.slice(index + 1),
  ];
  persistInventory();
  return updated;
};

export const deleteInventoryItem = (id: string): boolean => {
  const nextStore = inventoryStore.filter(item => item.id !== id);
  if (nextStore.length === inventoryStore.length) return false;

  inventoryStore = nextStore;
  persistInventory();
  return true;
};

export const resetInventoryToSeed = (): InventoryItem[] => {
  inventoryStore = cloneSeedData();
  persistInventory();
  return getInventoryData();
};