import { InventoryItem, ForecastResponse, InventoryItemInput } from '@/types/inventory';
import {
  getInventoryData,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/lib/inventory-data';
import { forecastingEngine } from '@/lib/forecasting';

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
      
      // Generate forecast using our Prophet-like algorithm
      const forecast = forecastingEngine.generateForecast(drugId, baseConsumption, 7);
      const confidence = forecastingEngine.calculateConfidence(forecast);
      
      const response: ForecastResponse = {
        drugId: inventoryItem.id,
        drugName: inventoryItem.name,
        forecast,
        confidence: Math.round(confidence * 100) / 100
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