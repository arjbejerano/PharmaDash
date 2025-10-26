import { NextRequest, NextResponse } from 'next/server';
import { getInventoryItem } from '@/lib/inventory-data';
import { forecastingEngine } from '@/lib/forecasting';
import { ForecastResponse } from '@/types/inventory';

export async function GET(
  request: NextRequest,
  { params }: { params: { drugId: string } }
) {
  try {
    const { drugId } = params;
    
    // Simulate network delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const inventoryItem = getInventoryItem(drugId);
    
    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: 'Drug not found' },
        { status: 404 }
      );
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
    
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}