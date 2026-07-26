import { InventoryItem, ForecastResponse, InventoryItemInput, PurchaseRecord } from '@/types/inventory';
import {
  getInventoryData,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/lib/inventory-data';
import { forecastingEngine } from '@/lib/forecasting';
import { deletePurchaseRecord, getPurchaseRecords, savePurchaseRecord } from '@/lib/purchase-data';
import { createLocation, deleteLocation, getLocations, renameLocation } from '@/lib/location-data';

type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

// Mock API service to simulate backend endpoints
class MockApiService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getInventory(): Promise<{ success: boolean; data?: InventoryItem[]; error?: string; timestamp: string; total: number; urgentCount: number }> {
    try {
      await this.delay(100);
      
      const inventory = getInventoryData();
      
      return {
        success: true,
        data: inventory,
        timestamp: new Date().toISOString(),
        total: inventory.length,
        urgentCount: inventory.filter(item => item.isUrgentReorder).length
      };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return {
        success: false,
        error: 'Failed to fetch inventory data',
        timestamp: new Date().toISOString(),
        total: 0,
        urgentCount: 0
      };
    }
  }

  async createInventory(input: InventoryItemInput): Promise<ApiResult<InventoryItem>> {
    try {
      await this.delay(150);
      const item = createInventoryItem(input);
      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return {
        success: false,
        error: 'Failed to create inventory item',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateInventory(id: string, input: InventoryItemInput): Promise<ApiResult<InventoryItem>> {
    try {
      await this.delay(150);
      const item = updateInventoryItem(id, input);

      if (!item) {
        return {
          success: false,
          error: 'Product not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return {
        success: false,
        error: 'Failed to update inventory item',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async deleteInventory(id: string): Promise<ApiResult<{ id: string }>> {
    try {
      await this.delay(150);
      const deleted = deleteInventoryItem(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Product not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: { id },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return {
        success: false,
        error: 'Failed to delete inventory item',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getPurchaseRecords(drugId: string): Promise<ApiResult<PurchaseRecord[]>> {
    await this.delay(80);
    return { success: true, data: getPurchaseRecords(drugId), timestamp: new Date().toISOString() };
  }

  async savePurchaseRecord(record: PurchaseRecord): Promise<ApiResult<PurchaseRecord>> {
    await this.delay(100);
    return { success: true, data: savePurchaseRecord(record), timestamp: new Date().toISOString() };
  }

  async deletePurchaseRecord(drugId: string, date: string): Promise<ApiResult<{ drugId: string; date: string }>> {
    await this.delay(100);
    if (!deletePurchaseRecord(drugId, date)) {
      return { success: false, error: 'Purchase record not found', timestamp: new Date().toISOString() };
    }
    return { success: true, data: { drugId, date }, timestamp: new Date().toISOString() };
  }

  async getLocations(): Promise<ApiResult<string[]>> {
    await this.delay(80);
    return { success: true, data: getLocations(), timestamp: new Date().toISOString() };
  }

  async createLocation(name: string): Promise<ApiResult<string>> {
    await this.delay(100);
    const location = createLocation(name);
    return location ? { success: true, data: location, timestamp: new Date().toISOString() } : { success: false, error: 'Location already exists or is invalid', timestamp: new Date().toISOString() };
  }

  async renameLocation(oldName: string, newName: string): Promise<ApiResult<string>> {
    await this.delay(100);
    return renameLocation(oldName, newName) ? { success: true, data: newName.trim(), timestamp: new Date().toISOString() } : { success: false, error: 'Unable to rename location. Names must be unique.', timestamp: new Date().toISOString() };
  }

  async deleteLocation(name: string): Promise<ApiResult<{ name: string }>> {
    await this.delay(100);
    return deleteLocation(name) ? { success: true, data: { name }, timestamp: new Date().toISOString() } : { success: false, error: 'Move products to another location before deleting this one.', timestamp: new Date().toISOString() };
  }

  async getForecast(drugId: string): Promise<{ success: boolean; data?: ForecastResponse; error?: string; timestamp: string }> {
    try {
      // Simulate network delay
      await this.delay(200);
      
      const inventoryItem = getInventoryItem(drugId);
      
      if (!inventoryItem) {
        return {
          success: false,
          error: 'Drug not found',
          timestamp: new Date().toISOString()
        };
      }
      
      // Calculate base consumption based on current stock and reorder point
      const baseConsumption = Math.max(5, Math.round((inventoryItem.maxStock - inventoryItem.currentStock) / 30));
      
      const purchases = getPurchaseRecords(drugId);
      // Daily purchases are the primary training signal; stock levels are used only until data is entered.
      const forecast = forecastingEngine.generateForecast(drugId, baseConsumption, purchases, 7);
      const confidence = forecastingEngine.calculateConfidence(forecast);
      
      const response: ForecastResponse = {
        drugId: inventoryItem.id,
        drugName: inventoryItem.name,
        forecast,
        confidence: Math.round(confidence * 100) / 100,
        trainingDataPoints: purchases.length
      };
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating forecast:', error);
      return {
        success: false,
        error: 'Failed to generate forecast',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const mockApiService = new MockApiService();
