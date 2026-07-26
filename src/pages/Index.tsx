import { useState } from 'react';
import { Activity, BarChart3, Boxes, Menu, X } from 'lucide-react';
import { InventoryTable } from '@/components/InventoryTable';
import { ForecastChart } from '@/components/ForecastChart';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { DataAssistant } from '@/components/DataAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryStats } from '@/types/inventory';

type Page = 'insights' | 'inventory';

const Index = () => {
  const [page, setPage] = useState<Page>('insights');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [stats, setStats] = useState<InventoryStats>({ total: 25, urgentCount: 12, locationCount: 3 });
  const selectDrug = (drugId: string) => { setSelectedDrugId(drugId); setForecastOpen(true); };
  const navigate = (nextPage: Page) => { setPage(nextPage); setMenuOpen(false); };
  const navigation = [{ id: 'insights' as const, label: 'Insights', icon: BarChart3 }, { id: 'inventory' as const, label: 'Inventory', icon: Boxes }];

  return <div className="pharma-theme min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101511]/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-400 p-2 text-emerald-950"><Activity className="h-5 w-5" /></div><div><h1 className="text-base font-semibold sm:text-lg">Pharma<span className="text-emerald-300">Dash</span></h1><p className="hidden text-xs text-muted-foreground sm:block">Supply chain intelligence</p></div></div><nav className="hidden items-center gap-1 md:flex">{navigation.map(item => <Button key={item.id} variant="ghost" onClick={() => navigate(item.id)} className={page === item.id ? 'bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/15 hover:text-emerald-300' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}><item.icon className="mr-2 h-4 w-4" />{item.label}</Button>)}</nav><div className="flex items-center gap-3"><Badge className="hidden border-emerald-400/20 bg-emerald-400/10 text-emerald-300 sm:flex"><span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />Live</Badge><Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</Button></div></div>{menuOpen && <nav className="border-t border-white/10 px-4 py-2 md:hidden">{navigation.map(item => <Button key={item.id} variant="ghost" onClick={() => navigate(item.id)} className="w-full justify-start"><item.icon className="mr-2 h-4 w-4" />{item.label}</Button>)}</nav>}</header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{page === 'insights' ? <InsightsDashboard onOpenInventory={() => navigate('inventory')} /> : <section><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Operations</p><h2 className="mt-2 text-3xl font-semibold">Inventory management</h2><p className="mt-2 text-sm text-muted-foreground">Manage products, locations, purchase history, and product-level forecasts.</p></div><InventoryTable onSelectDrug={selectDrug} selectedDrugId={selectedDrugId} onStatsChange={setStats} /></section>}</main>
    <Dialog open={forecastOpen} onOpenChange={setForecastOpen}><DialogContent className="max-w-4xl border-white/10 bg-card"><DialogHeader><DialogTitle>7-Day Purchase Forecast</DialogTitle></DialogHeader><ForecastChart selectedDrugId={selectedDrugId} /></DialogContent></Dialog>
    <DataAssistant />
  </div>;
};

export default Index;
