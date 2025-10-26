import { InventoryItem, ForecastResponse } from '@/types/inventory';
import { getInventoryData, getInventoryItem } from '@/lib/inventory-data';
import { forecastingEngine } from '@/lib/forecasting';

// Mock API service to simulate backend endpoints
class MockApiService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getInventory(): Promise<{ success: boolean; data?: InventoryItem[]; error?: string; timestamp: string; total: number; urgentCount: number }> {
    try {
      // Simulate network delay
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