import React, { useState } from 'react';
import { InventoryTable } from '@/components/InventoryTable';
import { ForecastChart } from '@/components/ForecastChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Package, AlertTriangle } from 'lucide-react';

const Index = () => {
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);
  const [forecastOpen, setForecastOpen] = useState(false);

  const handleSelectDrug = (drugId: string) => {
    setSelectedDrugId(drugId);
    setForecastOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pharma Supply Chain Dashboard by Arjay Bejerano
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time inventory monitoring & predictive analytics
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Data
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Cards (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">Across all locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Reorders</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-xs text-muted-foreground">Below reorder point</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">87%</div>
              <p className="text-xs text-muted-foreground">Prophet algorithm</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">3</div>
              <p className="text-xs text-muted-foreground">Warehouses & hubs</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <InventoryTable onSelectDrug={handleSelectDrug} selectedDrugId={selectedDrugId} />

        {/* Forecast Popup */}
        <Dialog open={forecastOpen} onOpenChange={setForecastOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>7-Day Demand Forecast</DialogTitle>
            </DialogHeader>
            <ForecastChart selectedDrugId={selectedDrugId} />
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Dashboard updates every 30 seconds • Forecasts generated using Prophet algorithm • Data simulated for demonstration purposes
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
