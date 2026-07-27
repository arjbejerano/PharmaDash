import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, MapPin, PackageCheck, TrendingUp } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { mockApiService } from '@/lib/mock-api';
import { getAllPurchaseRecords } from '@/lib/purchase-data';
import { getLocations } from '@/lib/location-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ForecastChart } from '@/components/ForecastChart';
import { LocationManagerDialog } from '@/components/LocationManagerDialog';

const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const load = useCallback(async () => { const result = await mockApiService.getInventory(); if (result.success) setInventory(result.data ?? []); }, []);
  useEffect(() => { load(); }, [load]);
  return { inventory, load };
};

export const ForecastsWorkspace = () => {
  const { inventory } = useInventory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => { if (!selectedId && inventory[0]) setSelectedId(inventory[0].id); }, [inventory, selectedId]);
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Planning</p><h2 className="mt-2 text-3xl font-semibold">Demand forecasts</h2><p className="mt-2 text-sm text-muted-foreground">Review the next seven days of expected purchase volume by product.</p></div><Card className="border-white/10 bg-card/90 shadow-none"><CardContent className="p-6"><label className="mb-2 block text-sm font-medium">Select product</label><Select value={selectedId ?? undefined} onValueChange={setSelectedId}><SelectTrigger className="max-w-md"><SelectValue placeholder="Choose a product" /></SelectTrigger><SelectContent>{inventory.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></CardContent></Card><ForecastChart selectedDrugId={selectedId} /></section>;
};

export const LocationsWorkspace = () => {
  const { inventory, load } = useInventory();
  const [managerOpen, setManagerOpen] = useState(false);
  const locations = getLocations();
  return <section className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Network</p><h2 className="mt-2 text-3xl font-semibold">Locations</h2><p className="mt-2 text-sm text-muted-foreground">Track capacity and stock risk across warehouses and distribution hubs.</p></div><Button onClick={() => setManagerOpen(true)} className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"><Building2 className="mr-2 h-4 w-4" />Manage locations</Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{locations.map(location => { const items = inventory.filter(item => item.location === location); const urgent = items.filter(item => item.currentStock <= item.reorderPoint).length; const units = items.reduce((sum, item) => sum + item.currentStock, 0); return <Card key={location} className="border-white/10 bg-card/90 shadow-none"><CardContent className="p-6"><div className="flex items-start justify-between"><div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><MapPin className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${urgent ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{urgent ? `${urgent} at risk` : 'Healthy'}</span></div><h3 className="mt-5 font-semibold">{location}</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Products</p><p className="mt-1 text-xl font-semibold">{items.length}</p></div><div><p className="text-muted-foreground">Units on hand</p><p className="mt-1 text-xl font-semibold">{units.toLocaleString()}</p></div></div></CardContent></Card>; })}</div><LocationManagerDialog open={managerOpen} onOpenChange={setManagerOpen} onLocationsChange={() => load()} /></section>;
};

export const AnalyticsWorkspace = () => {
  const { inventory } = useInventory();
  const rankings = useMemo(() => {
    const names = new Map(inventory.map(item => [item.id, item.name]));
    const totals = new Map<string, number>();
    const month = new Date().toISOString().slice(0, 7);
    getAllPurchaseRecords().filter(record => record.date.startsWith(month)).forEach(record => totals.set(record.drugId, (totals.get(record.drugId) ?? 0) + record.units));
    return [...totals.entries()].map(([id, units]) => ({ name: names.get(id) ?? id, units })).sort((a, b) => b.units - a.units);
  }, [inventory]);
  const categoryCounts = useMemo(() => { const counts = new Map<string, number>(); inventory.forEach(item => counts.set(item.category, (counts.get(item.category) ?? 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1]); }, [inventory]);
  const maxUnits = rankings[0]?.units ?? 1;
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Performance</p><h2 className="mt-2 text-3xl font-semibold">Operations analytics</h2><p className="mt-2 text-sm text-muted-foreground">Explore product mix and the recorded purchase demand behind your inventory decisions.</p></div><div className="grid gap-6 lg:grid-cols-2"><Card className="border-white/10 bg-card/90 shadow-none"><CardContent className="p-6"><div className="mb-5 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-300" /><div><h3 className="font-semibold">Most purchased this month</h3><p className="text-sm text-muted-foreground">Based on recorded purchase history</p></div></div>{rankings.length ? <div className="space-y-4">{rankings.slice(0, 6).map((item, index) => <div key={item.name}><div className="mb-1.5 flex justify-between text-sm"><span>{index + 1}. {item.name}</span><span className="text-emerald-300">{item.units} units</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(item.units / maxUnits) * 100}%` }} /></div></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">No purchase records for this month yet.</p>}</CardContent></Card><Card className="border-white/10 bg-card/90 shadow-none"><CardContent className="p-6"><div className="mb-5 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-300" /><div><h3 className="font-semibold">Portfolio mix</h3><p className="text-sm text-muted-foreground">Products by therapeutic category</p></div></div><div className="space-y-4">{categoryCounts.map(([category, count]) => <div key={category} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"><span className="text-sm">{category}</span><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">{count} products</span></div>)}</div></CardContent></Card></div><Card className="border-white/10 bg-emerald-400/5 shadow-none"><CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center"><div className="rounded-xl bg-emerald-400/15 p-3 text-emerald-300"><PackageCheck className="h-6 w-6" /></div><div><h3 className="font-semibold">Data quality tip</h3><p className="mt-1 text-sm text-muted-foreground">Add daily purchase records from the Inventory page to improve trend analytics and forecast confidence.</p></div></CardContent></Card></section>;
};
