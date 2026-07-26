import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { getInventoryData } from '@/lib/inventory-data';
import { getAllPurchaseRecords } from '@/lib/purchase-data';
import { getLocations } from '@/lib/location-data';
import { Button } from '@/components/ui/button';

type Message = { role: 'assistant' | 'user'; text: string };
const assistantUrl = import.meta.env.VITE_AI_ASSISTANT_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const getDashboardContext = () => ({
  generatedAt: new Date().toISOString(),
  inventory: getInventoryData().map(({ id, name, currentStock, reorderPoint, maxStock, location, category }) => ({ id, name, currentStock, reorderPoint, maxStock, location, category })),
  locations: getLocations(),
  purchases: getAllPurchaseRecords().slice(-500),
});

const askAssistant = async (messages: Message[]) => {
  if (!assistantUrl || !supabaseAnonKey) throw new Error('AI assistant endpoint is not configured.');
  const response = await fetch(assistantUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }, body: JSON.stringify({ messages, dashboardData: getDashboardContext() }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.answer !== 'string') throw new Error(body.error || 'The AI assistant could not respond.');
  return body.answer;
};

export const DataAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Hi! I am your Pharma AI Assistant. Ask me anything about inventory, locations, purchases, forecasts, or optimization.' }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const panel = scrollRef.current; panel?.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' }); }, [messages, open, loading]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const conversation = [...messages, { role: 'user' as const, text: question }];
    setMessages(conversation);
    setInput('');
    setLoading(true);
    try {
      const answer = await askAssistant(conversation);
      setMessages(current => [...current, { role: 'assistant', text: answer }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unexpected error';
      setMessages(current => [...current, { role: 'assistant', text: `I could not reach the OpenAI assistant. ${detail}` }]);
    } finally { setLoading(false); }
  };

  return <div className="fixed bottom-5 right-5 z-50">
    {open && <section className="mb-3 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl" aria-label="Pharma AI assistant">
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5" /><div><h2 className="font-semibold">Pharma AI Assistant</h2><p className="text-xs opacity-80">OpenAI-powered data analysis</p></div></div><Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" onClick={() => setOpen(false)} aria-label="Close assistant"><X className="h-5 w-5" /></Button></header>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
        {messages.map((message, index) => <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>{message.role === 'assistant' && <div className="mt-1 rounded-full bg-primary p-1.5 text-primary-foreground"><Bot className="h-3.5 w-3.5" /></div>}<p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm'}`}>{message.text}</p></div>)}
        {loading && <div className="flex gap-2"><div className="mt-1 rounded-full bg-primary p-1.5 text-primary-foreground"><Bot className="h-3.5 w-3.5" /></div><p className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2 text-sm shadow-sm"><LoaderCircle className="h-4 w-4 animate-spin" />Analyzing your dashboard data...</p></div>}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t bg-background p-3"><input value={input} onChange={event => setInput(event.target.value)} disabled={loading} placeholder="Ask anything about your data..." className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60" aria-label="Ask the AI assistant" /><Button type="submit" size="icon" disabled={loading} aria-label="Send question">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button></form>
    </section>}
    <Button onClick={() => setOpen(current => !current)} size="lg" className="h-14 rounded-full px-5 shadow-lg" aria-label={open ? 'Close assistant' : 'Open AI assistant'}>{open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}<span className="ml-2">Ask AI</span></Button>
  </div>;
};
