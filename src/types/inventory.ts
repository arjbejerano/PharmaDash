export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  location: string;
  category: string;
  lastUpdated: string;
  isUrgentReorder: boolean;
}

export interface ForecastData {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  historical?: number;
}

export interface ForecastResponse {
  drugId: string;
  drugName: string;
  forecast: ForecastData[];
  confidence: number;
}

export type AlertStatus = 'all' | 'urgent' | 'normal';
export type LocationFilter = 'all' | string;