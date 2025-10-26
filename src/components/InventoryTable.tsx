import React, { useState, useEffect } from 'react';
import { InventoryItem, AlertStatus, LocationFilter } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, MapPin, Clock } from 'lucide-react';
import { mockApiService } from '@/lib/mock-api';

interface InventoryTableProps {
  onSelectDrug: (drugId: string) => void;
  selectedDrugId: string | null;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ onSelectDrug, selectedDrugId }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<AlertStatus>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const result = await mockApiService.getInventory();
      
      if (result.success && result.data) {
        setInventory(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredInventory = inventory.filter(item => {
    const alertMatch = alertFilter === 'all' || 
      (alertFilter === 'urgent' && item.isUrgentReorder) ||
      (alertFilter === 'normal' && !item.isUrgentReorder);
    
    const locationMatch = locationFilter === 'all' || item.location === locationFilter;
    
    return alertMatch && locationMatch;
  });

  const urgentCount = inventory.filter(item => item.isUrgentReorder).length;
  const locations = [...new Set(inventory.map(item => item.location))];

  const getStockLevelColor = (current: number, reorder: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= reorder) return 'text-red-600';
    if (percentage < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockLevelBadge = (current: number, reorder: number) => {
    if (current <= reorder) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        URGENT REORDER
      </Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Error Loading Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchInventory} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Monitor
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{inventory.length}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-sm text-muted-foreground">Urgent Reorders</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{inventory.length - urgentCount}</div>
            <div className="text-sm text-muted-foreground">Normal Stock</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <Select value={alertFilter} onValueChange={(value: AlertStatus) => setAlertFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by alert status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="urgent">Urgent Reorder Only</SelectItem>
              <SelectItem value="normal">Normal Stock Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={(value: LocationFilter) => setLocationFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow 
                key={item.id}
                className={`cursor-pointer hover:bg-muted/50 ${selectedDrugId === item.id ? 'bg-primary/10' : ''}`}
                onClick={() => onSelectDrug(item.id)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.category}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`font-semibold ${getStockLevelColor(item.currentStock, item.reorderPoint, item.maxStock)}`}>
                    {item.currentStock}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {item.maxStock} max
                  </div>
                </TableCell>
                <TableCell>{item.reorderPoint}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                </TableCell>
                <TableCell>
                  {getStockLevelBadge(item.currentStock, item.reorderPoint)}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDrug(item.id);
                    }}
                  >
                    View Forecast
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products match the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};