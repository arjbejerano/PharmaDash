import React, { useState, useEffect, useRef } from 'react';
import { ForecastResponse } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Download, Calendar, Target } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { mockApiService } from '@/lib/mock-api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  selectedDrugId: string | null;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ selectedDrugId }) => {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  const fetchForecast = async (drugId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mockApiService.getForecast(drugId);
      
      if (result.success && result.data) {
        setForecast(result.data);
      } else {
        setError(result.error || 'Failed to fetch forecast');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Forecast fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDrugId) {
      fetchForecast(selectedDrugId);
    }
  }, [selectedDrugId]);

  const exportForecastData = () => {
    if (!forecast) return;
    
    const csvContent = [
      ['Date', 'Predicted Demand', 'Lower Bound', 'Upper Bound', 'Historical'].join(','),
      ...forecast.forecast.map(item => [
        item.date,
        item.predicted,
        item.lower,
        item.upper,
        item.historical || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${forecast.drugName}_forecast_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    if (!forecast) return null;

    const labels = forecast.forecast.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const historicalData = forecast.forecast.map(item => item.historical || null);
    const predictedData = forecast.forecast.map(item => item.historical ? null : item.predicted);
    const lowerBoundData = forecast.forecast.map(item => item.historical ? null : item.lower);
    const upperBoundData = forecast.forecast.map(item => item.historical ? null : item.upper);

    return {
      labels,
      datasets: [
        {
          label: 'Historical Demand',
          data: historicalData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
        },
        {
          label: 'Predicted Demand',
          data: predictedData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          borderDash: [5, 5],
        },
        {
          label: 'Confidence Interval',
          data: upperBoundData,
          borderColor: 'rgba(34, 197, 94, 0.3)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          fill: '+1',
          tension: 0.1,
        },
        {
          label: 'Lower Bound',
          data: lowerBoundData,
          borderColor: 'rgba(34, 197, 94, 0.3)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => legendItem.text !== 'Lower Bound',
        },
      },
      title: {
        display: true,
        text: forecast ? `7-Day Demand Forecast: ${forecast.drugName}` : 'Demand Forecast',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Lower Bound') return null;
            return `${context.dataset.label}: ${context.parsed.y} units`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Demand (Units)',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (!selectedDrugId) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Select a Product</p>
            <p>Choose a pharmaceutical product from the inventory table to view its 7-day demand forecast with confidence intervals.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Generating forecast...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="w-5 h-5" />
            Forecast Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => selectedDrugId && fetchForecast(selectedDrugId)} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();
  const totalPredicted = forecast?.forecast
    .filter(item => !item.historical)
    .reduce((sum, item) => sum + item.predicted, 0) || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Demand Forecast
          </CardTitle>
          <Button onClick={exportForecastData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {forecast && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(forecast.confidence * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalPredicted}</div>
              <div className="text-sm text-muted-foreground">7-Day Total</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(totalPredicted / 7)}
              </div>
              <div className="text-sm text-muted-foreground">Daily Average</div>
            </div>
          </div>
        )}

        {forecast && (
          <div className="flex items-center gap-2 mt-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              Forecast Period: {new Date().toLocaleDateString()} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
            <Badge variant="secondary" className="ml-2">
              <Target className="w-3 h-3 mr-1" />
              Prophet Algorithm
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {chartData && (
          <div className="h-full min-h-[400px]">
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};