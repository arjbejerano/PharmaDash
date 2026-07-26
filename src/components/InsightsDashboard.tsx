import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BarChart3, Building2, Package, TrendingUp } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { mockApiService } from '@/lib/mock-api';
import { forecastingEngine } from '@/lib/forecasting';
import { getPurchaseRecords } from '@/lib/purchase-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InsightsDashboardProps { onOpenInventory: () => void; }

export const InsightsDashboard = ({ onOpenInventory }: InsightsDashboardProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const loadInventory = useCallback(async () => {
    const result = await mockApiService.getInventory();
    if (result.success) setInventory(result.data ?? []);
  }, []);

  useEffect(() => {
    loadInventory();
    const refresh = setInterval(loadInventory, 30000);
    return () => clearInterval(refresh);
  }, [loadInventory]);

  const urgent = inventory.filter(item => item.currentStock <= item.reorderPoint)
    .sort((a, b) => (a.currentStock / a.reorderPoint) - (b.currentStock / b.reorderPoint));
  const totalUnits = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const locations = [...new Set(inventory.map(item => item.location))];
  const forecastTotal = inventory.reduce((sum, item) => {
    const baseDemand = Math.max(5, Math.round((item.maxStock - item.currentStock) / 30));
    const nextWeek = forecastingEngine.generateForecast(item.id, baseDemand, getPurchaseRecords(item.id), 7)
      .filter(point => !point.historical)
      .reduce((forecastSum, point) => forecastSum + point.predicted, 0);
    return sum + nextWeek;
  }, 0);

  const metrics = [
    { label: 'Active products', value: inventory.length, note: `${totalUnits.toLocaleString()} units on hand`, icon: Package, tone: 'text-emerald-400 bg-emerald-400/10' },
    { label: 'Urgent reorders', value: urgent.length, note: 'At or below reorder point', icon: AlertTriangle, tone: 'text-rose-400 bg-rose-400/10' },
    { label: '7-day demand', value: forecastTotal.toLocaleString(), note: 'Projected purchase volume', icon: TrendingUp, tone: 'text-lime-300 bg-lime-300/10' },
    { label: 'Active locations', value: locations.length, note: 'Warehouses and hubs', icon: Building2, tone: 'text-teal-300 bg-teal-300/10' },
  ];

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 via-card to-card p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Supply chain intelligence</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Inventory insights, at a glance.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Monitor stock risk, forecast demand, and make better replenishment decisions from one clear operational view.</p></div>
        <Button onClick={onOpenInventory} className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"><Package className="mr-2 h-4 w-4" />Manage inventory <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </section>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(metric => <Card key={metric.label} className="border-white/10 bg-card/90 shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-3 text-3xl font-semibold">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.note}</p></div><div className={`rounded-xl p-2.5 ${metric.tone}`}><metric.icon className="h-5 w-5" /></div></div></CardContent></Card>)}
    </section>

    <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="border-white/10 bg-card/90 shadow-none lg:col-span-3"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold">Priority replenishments</h3><p className="mt-1 text-sm text-muted-foreground">Products requiring immediate attention</p></div><Button variant="outline" size="sm" onClick={onOpenInventory} className="border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200">View all</Button></div><div className="space-y-3">{urgent.slice(0, 5).map((item, index) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-xs font-semibold text-rose-300">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.location}</p></div></div><div className="ml-3 text-right"><p className="text-sm font-semibold text-rose-300">{item.currentStock} units</p><p className="text-xs text-muted-foreground">Reorder at {item.reorderPoint}</p></div></div>)}{!urgent.length && <p className="py-8 text-center text-sm text-emerald-300">All products are above their reorder points.</p>}</div></CardContent></Card>
      <Card className="border-white/10 bg-card/90 shadow-none lg:col-span-2"><CardContent className="p-6"><div className="mb-5 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-300" /><div><h3 className="font-semibold">Location health</h3><p className="text-sm text-muted-foreground">Stock-risk distribution</p></div></div><div className="space-y-5">{locations.map(location => { const items = inventory.filter(item => item.location === location); const risk = items.filter(item => item.currentStock <= item.reorderPoint).length; const health = items.length ? Math.round(((items.length - risk) / items.length) * 100) : 0; return <div key={location}><div className="mb-2 flex justify-between text-sm"><span>{location}</span><span className="text-muted-foreground">{risk} at risk</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${health}%` }} /></div></div>; })}{!locations.length && <p className="py-8 text-center text-sm text-muted-foreground">Loading location insights...</p>}</div></CardContent></Card>
    </section>
  </div>;
};
