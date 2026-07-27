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
  trainingDataPoints: number;
}

export interface PurchaseRecord {
  drugId: string;
  date: string;
  units: number;
}

export type AlertStatus = 'all' | 'urgent' | 'normal';
export type LocationFilter = 'all' | string;

export interface InventoryItemInput {
  name: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  location: string;
  category: string;
}

export interface InventoryStats {
  total: number;
  urgentCount: number;
  locationCount: number;
}

export type AutomationStatus = 'Triggered' | 'Queued' | 'Completed';

export interface AutomationWorkflowStep {
  id: string;
  label: string;
  status: AutomationStatus;
}

export interface AutomationAction {
  id: string;
  itemId: string;
  itemName: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: AutomationStatus;
  workflow: AutomationWorkflowStep[];
  createdAt: string;
}
