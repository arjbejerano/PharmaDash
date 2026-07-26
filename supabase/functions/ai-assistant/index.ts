declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response> | Response): void;
};

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
type ChatMessage = { role: 'assistant' | 'user'; text: string };

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');
    const { messages, dashboardData } = await request.json() as { messages?: ChatMessage[]; dashboardData?: unknown };
    if (!Array.isArray(messages) || !messages.length || messages.length > 30 || !dashboardData) return Response.json({ error: 'Invalid assistant request.' }, { status: 400, headers: corsHeaders });
    const input = messages.map(message => `${message.role === 'user' ? 'User' : 'Assistant'}: ${String(message.text).slice(0, 4000)}`).join('\n\n');
    const instructions = `You are Pharma AI Assistant for an inventory supply-chain dashboard. Answer operational questions clearly from the supplied dashboard data. You may calculate, compare, summarize, forecast, and recommend optimizations. Be transparent about missing data and estimates. Do not invent records or provide medical or clinical guidance. Keep answers concise. Dashboard data: ${JSON.stringify(dashboardData).slice(0, 100000)}`;
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini', instructions, input }) });
    const result = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', result);
      const details = typeof result?.error?.message === 'string' ? result.error.message : `Request failed with status ${openaiResponse.status}.`;
      return Response.json({ error: `OpenAI API error: ${details}` }, { status: 502, headers: corsHeaders });
    }
    if (typeof result.output_text !== 'string' || !result.output_text) return Response.json({ error: 'OpenAI returned an empty response.' }, { status: 502, headers: corsHeaders });
    return Response.json({ answer: result.output_text }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('AI assistant error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to process request.' }, { status: 500, headers: corsHeaders });
  }
});
