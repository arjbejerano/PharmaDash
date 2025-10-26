import { ForecastData } from '@/types/inventory';

// Simulate Prophet-like forecasting algorithm
export class ForecastingEngine {
  private generateSeasonality(dayOfYear: number): number {
    // Simulate seasonal patterns (weekly and monthly cycles)
    const weeklyPattern = Math.sin((dayOfYear % 7) * 2 * Math.PI / 7) * 0.1;
    const monthlyPattern = Math.sin((dayOfYear % 30) * 2 * Math.PI / 30) * 0.05;
    return weeklyPattern + monthlyPattern;
  }

  private generateTrend(baseValue: number, days: number): number {
    // Simulate slight upward or downward trend
    const trendFactor = 0.002; // 0.2% daily trend
    return baseValue * (1 + (Math.random() - 0.5) * trendFactor * days);
  }

  private generateNoise(): number {
    // Add realistic noise to predictions
    return (Math.random() - 0.5) * 0.1;
  }

  generateForecast(drugId: string, baseConsumption: number, days: number = 7): ForecastData[] {
    const forecast: ForecastData[] = [];
    const today = new Date();
    
    // Generate historical data for comparison (last 7 days)
    for (let i = -7; i < 0; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const seasonality = this.generateSeasonality(dayOfYear);
      const trend = this.generateTrend(baseConsumption, Math.abs(i));
      const noise = this.generateNoise();
      
      const historical = Math.max(0, Math.round(trend + seasonality * baseConsumption + noise * baseConsumption));
      
      forecast.push({
        date: date.toISOString().split('T')[0],
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
      
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const seasonality = this.generateSeasonality(dayOfYear);
      const trend = this.generateTrend(baseConsumption, i);
      const noise = this.generateNoise();
      
      const predicted = Math.max(0, Math.round(trend + seasonality * baseConsumption + noise * baseConsumption));
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
    const coefficient = Math.sqrt(variance) / mean;
    
    // Convert coefficient of variation to confidence percentage (inverse relationship)
    return Math.max(0.6, Math.min(0.95, 1 - coefficient));
  }
}

export const forecastingEngine = new ForecastingEngine();