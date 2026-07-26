import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { mockApiService } from '@/lib/mock-api';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onLocationsChange: (locations: string[]) => void; }

export const LocationManagerDialog: React.FC<Props> = ({ open, onOpenChange, onLocationsChange }) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const load = async () => { const result = await mockApiService.getLocations(); if (result.success) { const values = result.data ?? []; setLocations(values); onLocationsChange(values); } };
  useEffect(() => { if (open) load(); }, [open]);
  const add = async (event: React.FormEvent) => { event.preventDefault(); const result = await mockApiService.createLocation(newLocation); if (result.success) { setNewLocation(''); toast.success('Location added'); await load(); } else toast.error(result.error); };
  const rename = async (oldName: string) => { const result = await mockApiService.renameLocation(oldName, editName); if (result.success) { setEditing(null); toast.success('Location and assigned products updated'); await load(); } else toast.error(result.error); };
  const remove = async (name: string) => { const result = await mockApiService.deleteLocation(name); if (result.success) { toast.success('Location deleted'); await load(); } else toast.error(result.error); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Manage locations</DialogTitle><DialogDescription>Create, rename, or delete warehouse and hub locations. Renaming updates all assigned products.</DialogDescription></DialogHeader>
    <form onSubmit={add} className="flex gap-2"><div className="flex-1"><Label htmlFor="new-location" className="sr-only">New location</Label><Input id="new-location" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="e.g. Warehouse D" required /></div><Button type="submit">Add location</Button></form>
    <div className="space-y-2 max-h-72 overflow-auto">{locations.map(location => <div key={location} className="flex items-center gap-2 rounded-md border p-2"><MapPin className="w-4 h-4 text-muted-foreground shrink-0" />{editing === location ? <><Input value={editName} onChange={e => setEditName(e.target.value)} autoFocus /><Button size="sm" onClick={() => rename(location)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></> : <><span className="flex-1 text-sm font-medium">{location}</span><Button size="icon" variant="ghost" onClick={() => { setEditing(location); setEditName(location); }} aria-label={`Rename ${location}`}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="ghost" className="text-red-600" onClick={() => remove(location)} aria-label={`Delete ${location}`}><Trash2 className="w-4 h-4" /></Button></>}</div>)}</div>
  </DialogContent></Dialog>;
};
