import React, { useEffect, useState } from 'react';
import { PurchaseRecord } from '@/types/inventory';
import { mockApiService } from '@/lib/mock-api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props { drugId: string | null; drugName: string | null; open: boolean; onOpenChange: (open: boolean) => void; }
const today = () => new Date().toISOString().split('T')[0];

export const PurchaseHistoryDialog: React.FC<Props> = ({ drugId, drugName, open, onOpenChange }) => {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [date, setDate] = useState(today());
  const [units, setUnits] = useState('');
  const [saving, setSaving] = useState(false);
  const load = async () => { if (drugId) { const result = await mockApiService.getPurchaseRecords(drugId); if (result.success) setRecords(result.data ?? []); } };
  useEffect(() => { if (open) load(); }, [open, drugId]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!drugId || !date || units === '' || Number(units) < 0) return;
    setSaving(true);
    try { const result = await mockApiService.savePurchaseRecord({ drugId, date, units: Number(units) }); if (result.success) { toast.success('Daily purchase saved. The next forecast will use it.'); setUnits(''); await load(); } } finally { setSaving(false); }
  };
  const remove = async (record: PurchaseRecord) => { const result = await mockApiService.deletePurchaseRecord(record.drugId, record.date); if (result.success) { toast.success('Purchase record removed'); await load(); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Daily purchases — {drugName}</DialogTitle><DialogDescription>Enter units bought from the supplier for any day. Saving the same date updates it.</DialogDescription></DialogHeader>
    <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"><div><Label htmlFor="purchase-date">Date</Label><Input id="purchase-date" type="date" max={today()} value={date} onChange={e => setDate(e.target.value)} required /></div><div><Label htmlFor="purchase-units">Units bought</Label><Input id="purchase-units" type="number" min="0" step="1" value={units} onChange={e => setUnits(e.target.value)} required /></div><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save day'}</Button></form>
    <div className="max-h-72 overflow-auto border rounded-md"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Units bought</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{records.length ? records.map(record => <TableRow key={record.date}><TableCell>{new Date(`${record.date}T12:00:00`).toLocaleDateString()}</TableCell><TableCell>{record.units}</TableCell><TableCell className="text-right"><Button type="button" variant="ghost" size="sm" onClick={() => { setDate(record.date); setUnits(String(record.units)); }}>Edit</Button><Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => remove(record)} aria-label={`Delete purchase for ${record.date}`}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No daily purchases recorded yet.</TableCell></TableRow>}</TableBody></Table></div>
  </DialogContent></Dialog>;
};
