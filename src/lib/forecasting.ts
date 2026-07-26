import { ForecastData, PurchaseRecord } from '@/types/inventory';

// Simulate Prophet-like forecasting algorithm
export class ForecastingEngine {
  private generateSeasonality(dayOfYear: number): number {
    // Simulate seasonal patterns (weekly and monthly cycles)
    const weeklyPattern = Math.sin((dayOfYear % 7) * 2 * Math.PI / 7) * 0.1;
    const monthlyPattern = Math.sin((dayOfYear % 30) * 2 * Math.PI / 30) * 0.05;
    return weeklyPattern + monthlyPattern;
  }

  private estimateForDate(date: Date, baseValue: number, history: PurchaseRecord[]): number {
    if (history.length === 0) return baseValue;
    const weekday = date.getDay();
    const matchingWeekday = history.filter(record => new Date(`${record.date}T12:00:00`).getDay() === weekday);
    const comparable = matchingWeekday.length >= 2 ? matchingWeekday : history;
    const weightedTotal = comparable.reduce((sum, record, index) => sum + record.units * Math.max(1, comparable.length - index), 0);
    const totalWeight = comparable.reduce((sum, _, index) => sum + Math.max(1, comparable.length - index), 0);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    return Math.max(0, Math.round((weightedTotal / totalWeight) * (1 + this.generateSeasonality(dayOfYear))));
  }

  generateForecast(drugId: string, baseConsumption: number, history: PurchaseRecord[] = [], days: number = 7): ForecastData[] {
    const forecast: ForecastData[] = [];
    const today = new Date();
    
    // Generate historical data for comparison (last 7 days)
    for (let i = -7; i < 0; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dateKey = date.toISOString().split('T')[0];
      const historicalRecord = history.find(record => record.date === dateKey);
      const historical = historicalRecord?.units ?? this.estimateForDate(date, baseConsumption, history);
      
      forecast.push({
        date: dateKey,
        predicted: historical,
        lower: historical * 0.8,
        upper: historical * 1.2,
        historical: historical
      });
    }

    // Generate future predictions (next 7 days)
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const predicted = this.estimateForDate(date, baseConsumption, history);
      const confidenceInterval = predicted * 0.15; // 15% confidence interval
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: predicted,
        lower: Math.max(0, Math.round(predicted - confidenceInterval)),
        upper: Math.round(predicted + confidenceInterval)
      });
    }
    
    return forecast;
  }

  calculateConfidence(forecast: ForecastData[]): number {
    // Calculate confidence based on variance in predictions
    const predictions = forecast.filter(f => !f.historical).map(f => f.predicted);
    const mean = predictions.reduce((sum, val) => sum + val, 0) / predictions.length;
    const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
    const coefficient = mean === 0 ? 1 : Math.sqrt(variance) / mean;
    
    // Convert coefficient of variation to confidence percentage (inverse relationship)
    return Math.max(0.6, Math.min(0.95, 1 - coefficient));
  }
}

export const forecastingEngine = new ForecastingEngine();
