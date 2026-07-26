import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, AlertStatus, LocationFilter, InventoryStats } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Package, MapPin, Clock, Plus, Pencil, Trash2, MoreHorizontal, ShoppingCart, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { mockApiService } from '@/lib/mock-api';
import { InventoryFormDialog, InventoryFormValues } from '@/components/InventoryFormDialog';
import { PurchaseHistoryDialog } from '@/components/PurchaseHistoryDialog';
import { LocationManagerDialog } from '@/components/LocationManagerDialog';

interface InventoryTableProps {
  onSelectDrug: (drugId: string) => void;
  selectedDrugId: string | null;
  onStatsChange?: (stats: InventoryStats) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  onSelectDrug,
  selectedDrugId,
  onStatsChange,
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<AlertStatus>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<InventoryItem | null>(null);
  const [locationManagerOpen, setLocationManagerOpen] = useState(false);
  const [managedLocations, setManagedLocations] = useState<string[]>([]);

  const emitStats = useCallback((items: InventoryItem[]) => {
    const locations = new Set(items.map(item => item.location));
    onStatsChange?.({
      total: items.length,
      urgentCount: items.filter(item => item.isUrgentReorder).length,
      locationCount: locations.size,
    });
  }, [onStatsChange]);

  const fetchInventory = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const result = await mockApiService.getInventory();

      if (result.success && result.data) {
        setInventory(result.data);
        emitStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Inventory fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [emitStats]);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(() => fetchInventory(false), 30000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  useEffect(() => {
    mockApiService.getLocations().then(result => {
      if (result.success) setManagedLocations(result.data ?? []);
    });
  }, []);

  const filteredInventory = inventory.filter(item => {
    const alertMatch = alertFilter === 'all' ||
      (alertFilter === 'urgent' && item.isUrgentReorder) ||
      (alertFilter === 'normal' && !item.isUrgentReorder);

    const locationMatch = locationFilter === 'all' || item.location === locationFilter;

    return alertMatch && locationMatch;
  });

  const urgentCount = inventory.filter(item => item.isUrgentReorder).length;
  const locations = [...new Set([...managedLocations, ...inventory.map(item => item.location)])];
  const categories = [...new Set(inventory.map(item => item.category))];

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: InventoryFormValues) => {
    setIsSubmitting(true);

    try {
      const result = formMode === 'create'
        ? await mockApiService.createInventory(values)
        : await mockApiService.updateInventory(editingItem!.id, values);

      if (result.success) {
        toast.success(formMode === 'create' ? 'Product added' : 'Product updated');
        setFormOpen(false);
        await fetchInventory(false);
        return;
      }

      toast.error(result.error || 'Unable to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const result = await mockApiService.deleteInventory(deleteTarget.id);

      if (result.success) {
        toast.success('Product deleted');
        setDeleteTarget(null);
        await fetchInventory(false);
        return;
      }

      toast.error(result.error || 'Unable to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStockLevelColor = (current: number, reorder: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= reorder) return 'text-red-600';
    if (percentage < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockLevelBadge = (current: number, reorder: number) => {
    if (current <= reorder) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          URGENT REORDER
        </Badge>
      );
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
          <Button onClick={() => fetchInventory()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Monitor
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <Button onClick={openCreateDialog} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
              <Button onClick={() => setLocationManagerOpen(true)} size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-1" />
                Locations
              </Button>
            </div>
          </div>

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow
                  key={item.id}
                  className={`hover:bg-muted/50 ${selectedDrugId === item.id ? 'bg-primary/10' : ''}`}
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
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectDrug(item.id)}
                      >
                        Forecast
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" aria-label={`Manage ${item.name}`}>
                            <MoreHorizontal className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" sideOffset={8}>
                          <DropdownMenuItem onSelect={() => setPurchaseItem(item)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchases
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEditDialog(item)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit product & location
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={() => setDeleteTarget(item)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

      <InventoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        item={editingItem}
        locations={locations}
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <PurchaseHistoryDialog
        open={!!purchaseItem}
        onOpenChange={(open) => !open && setPurchaseItem(null)}
        drugId={purchaseItem?.id ?? null}
        drugName={purchaseItem?.name ?? null}
      />

      <LocationManagerDialog
        open={locationManagerOpen}
        onOpenChange={setLocationManagerOpen}
        onLocationsChange={(nextLocations) => {
          setManagedLocations(nextLocations);
          fetchInventory(false);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-medium">{deleteTarget?.name}</span> from inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
