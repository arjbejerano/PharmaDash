import { NextRequest, NextResponse } from 'next/server';
import { getInventoryData } from '@/lib/inventory-data';

export async function GET(request: NextRequest) {
  try {
    // Simulate network delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const inventory = getInventoryData();
    
    return NextResponse.json({
      success: true,
      data: inventory,
      timestamp: new Date().toISOString(),
      total: inventory.length,
      urgentCount: inventory.filter(item => item.isUrgentReorder).length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}