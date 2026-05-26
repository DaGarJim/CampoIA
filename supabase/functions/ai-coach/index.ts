import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

/**
 * IA Coach — Edge Function multi-modo. Un único punto para toda la IA de CAMPO:
 *  - chat:          copiloto conversacional con contexto real.
 *  - report:        informe profesional en markdown por tipo.
 *  - metrics:       atributos (0-99) y métricas (%) estimadas de un jugador.
 *  - season-import: parsea texto de calendario a partidos estructurados.
 *
 * El proveedor (Gemini o Groq) se configura por secret: GEMINI_API_KEY o GROQ_API_KEY.
 * Si no hay ninguno, cada modo devuelve un FALLBACK determinista basado en datos para
 * que la app siga siendo funcional (modo degradado) hasta tener la clave.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

type Mode = 'chat' | 'report' | 'metrics' | 'season-import' | 'player-import';

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY');
const GROQ_KEY = Deno.env.get('GROQ_API_KEY');
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash';
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';

class NoProvider extends Error {}

async function callProvider(system: string, user: string): Promise<string> {
  if (GEMINI_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
  if (GROQ_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.6,
      }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }
  throw new NoProvider('Sin proveedor de IA configurado');
}

/** Extrae el primer objeto/array JSON de una respuesta (tolera ``` y texto extra). */
function extractJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.search(/[[{]/);
  if (start < 0) return null;
  const open = cleaned[start];
  const close = open === '[' ? ']' : '}';
  const end = cleaned.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)));

// --- chat ------------------------------------------------------------------
interface ChatPayload {
  question?: string;
  context?: string;
  conversation?: { role: 'user' | 'ai'; text: string }[];
}

async function handleChat(p: ChatPayload) {
  const question = (p.question ?? '').trim();
  if (!question) return json({ error: 'Pregunta requerida' }, 400);
  const history = (p.conversation ?? [])
    .slice(-10)
    .map((t) => `${t.role === 'user' ? 'Entrenador' : 'IA'}: ${t.text}`)
    .join('\n');
  const system =
    'Eres "CAMPO Intelligence", un analista de rendimiento de fútbol experto. Respondes en ' +
    'español, claro y accionable, basándote SOLO en los datos del contexto. Si faltan datos, dilo.';
  const user = `${p.context ? `CONTEXTO:\n${p.context}\n\n` : ''}${history ? `CONVERSACIÓN:\n${history}\n\n` : ''}PREGUNTA: ${question}`;
  try {
    const reply = await callProvider(system, user);
    return json({ reply: reply || '(sin respuesta)' });
  } catch (e) {
    if (e instanceof NoProvider) {
      return json({
        reply:
          'IA Coach en modo sin proveedor: configura GEMINI_API_KEY o GROQ_API_KEY como secret ' +
          'de la Edge Function para respuestas con IA. Mientras tanto tienes el contexto:\n\n' +
          (p.context ?? 'Sin contexto de jugadores.'),
        degraded: true,
      });
    }
    return json({ error: 'Error del proveedor de IA' }, 502);
  }
}

// --- metrics ---------------------------------------------------------------
interface MetricsPayload {
  player?: {
    name?: string;
    pos?: string;
    score?: number;
    adherence?: number;
    mins?: number;
    height_cm?: number;
    weight_kg?: number;
    age?: number;
  };
}

function heuristicMetrics(pl: NonNullable<MetricsPayload['player']>) {
  const score = pl.score ?? 60;
  const adh = pl.adherence ?? 60;
  const base = clamp(score, 30, 95);
  return {
    ai_attributes: {
      tecnica: clamp(base + 4, 0, 99),
      tactica: clamp(base, 0, 99),
      fisico: clamp((base + adh) / 2, 0, 99),
      mental: clamp(adh, 0, 99),
      velocidad: clamp(base + 2, 0, 99),
      lectura: clamp(base - 3, 0, 99),
    },
    ai_metrics: {
      mejora: clamp(adh, 0, 100),
      competitividad: clamp(score, 0, 100),
      descanso: clamp(adh - 5, 0, 100),
      trabajo: clamp(adh + 5, 0, 100),
      ejercicio: clamp(score - 5, 0, 100),
    },
    strength: `Buen nivel general (score ${score}). Punto fuerte: implicación y velocidad.`,
    improve: 'Consolidar la toma de decisiones y la regularidad semana a semana.',
  };
}

async function handleMetrics(p: MetricsPayload) {
  const pl = p.player ?? {};
  const system =
    'Eres un analista de rendimiento. Devuelve SOLO JSON válido con esta forma exacta: ' +
    '{"ai_attributes":{"tecnica":0-99,"tactica":0-99,"fisico":0-99,"mental":0-99,"velocidad":0-99,"lectura":0-99},' +
    '"ai_metrics":{"mejora":0-100,"competitividad":0-100,"descanso":0-100,"trabajo":0-100,"ejercicio":0-100},' +
    '"strength":"texto","improve":"texto"}. Sin markdown ni explicación.';
  const user = `Estima atributos y métricas para este jugador: ${JSON.stringify(pl)}`;
  try {
    const raw = await callProvider(system, user);
    const parsed = extractJson<ReturnType<typeof heuristicMetrics>>(raw);
    return json(parsed ?? heuristicMetrics(pl));
  } catch (e) {
    if (e instanceof NoProvider) return json({ ...heuristicMetrics(pl), degraded: true });
    return json({ error: 'Error del proveedor de IA' }, 502);
  }
}

// --- report ----------------------------------------------------------------
interface ReportPayload {
  type?: string;
  playerName?: string;
  period?: string;
  context?: string;
  coachName?: string;
}

const REPORT_TONE: Record<string, string> = {
  weekly: 'Informe semanal para el entrenador: entrenamiento, hábitos, partidos y evolución.',
  parents: 'Informe para la familia: tono positivo y orientado al desarrollo del jugador.',
  club: 'Informe para el club: análisis técnico-físico-táctico riguroso.',
  match: 'Informe post-partido: análisis del último partido.',
  monthly: 'Informe mensual: KPIs, evolución vs mes anterior y tendencias.',
  agent: 'Informe para representante/scout: datos de mercado y rendimiento competitivo.',
};

function fallbackReport(p: ReportPayload) {
  const tone = REPORT_TONE[p.type ?? 'weekly'] ?? REPORT_TONE.weekly;
  return (
    `# Informe ${p.type ?? 'semanal'}\n\n` +
    `**Jugador/cartera:** ${p.playerName ?? 'Toda la cartera'}\n\n` +
    `**Periodo:** ${p.period ?? 'Esta semana'}\n\n` +
    `**Entrenador:** ${p.coachName ?? 'CAMPO'}\n\n` +
    `## Resumen\n\n${tone}\n\n` +
    `## Datos\n\n${p.context ?? 'Sin datos disponibles.'}\n\n` +
    `_Generado en modo sin proveedor de IA. Configura una clave para informes redactados por IA._`
  );
}

async function handleReport(p: ReportPayload) {
  const tone = REPORT_TONE[p.type ?? 'weekly'] ?? REPORT_TONE.weekly;
  const system =
    'Eres un analista de fútbol que redacta informes profesionales en español, en markdown ' +
    '(títulos #, ##, listas con -, negrita **). Basado SOLO en los datos. Conciso y útil.';
  const user = `Tipo de informe: ${tone}\nJugador/cartera: ${p.playerName ?? 'Toda la cartera'}\nPeriodo: ${p.period ?? 'Esta semana'}\nEntrenador: ${p.coachName ?? 'CAMPO'}\n\nDATOS:\n${p.context ?? 'Sin datos.'}`;
  try {
    const markdown = await callProvider(system, user);
    return json({ markdown: markdown || fallbackReport(p) });
  } catch (e) {
    if (e instanceof NoProvider) return json({ markdown: fallbackReport(p), degraded: true });
    return json({ error: 'Error del proveedor de IA' }, 502);
  }
}

// --- season-import ---------------------------------------------------------
interface SeasonPayload {
  text?: string;
}

interface ParsedMatch {
  date: string;
  rival: string;
  result: string;
  role: string;
  mins: number;
}

function fallbackSeason(text: string): ParsedMatch[] {
  const out: ParsedMatch[] = [];
  for (const line of (text ?? '').split('\n')) {
    const date = /(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{2,4})/.exec(line)?.[0];
    const result = /\b(\d{1,2})\s*[-:]\s*(\d{1,2})\b/.exec(line);
    if (!date && !result) continue;
    out.push({
      date: date ?? '',
      rival: line.replace(/[\d/:-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60),
      result: result ? `${result[1]}-${result[2]}` : '',
      role: '',
      mins: 0,
    });
  }
  return out;
}

async function handleSeason(p: SeasonPayload) {
  const text = (p.text ?? '').trim();
  if (!text) return json({ error: 'Texto requerido' }, 400);
  const system =
    'Extraes partidos de un texto de calendario. Devuelve SOLO un array JSON con objetos ' +
    '{"date":"YYYY-MM-DD","rival":"...","result":"a-b","role":"Titular|Suplente|No jugó|No convocado","mins":number}. ' +
    'Sin markdown ni texto extra. Si un campo no aparece, usa "" o 0.';
  try {
    const raw = await callProvider(system, text);
    const parsed = extractJson<ParsedMatch[]>(raw);
    return json({ matches: parsed ?? fallbackSeason(text) });
  } catch (e) {
    if (e instanceof NoProvider) return json({ matches: fallbackSeason(text), degraded: true });
    return json({ error: 'Error del proveedor de IA' }, 502);
  }
}

// --- player-import (ficha federativa) --------------------------------------
interface PlayerImportPayload {
  text?: string;
}

function fallbackPlayerImport(text: string) {
  const firstLine = (text ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  const age = /\b(\d{1,2})\s*años\b/i.exec(text)?.[1];
  return {
    name: firstLine.slice(0, 60),
    pos: '',
    age: age ? Number(age) : undefined,
    foot: /zurd/i.test(text) ? 'Izquierdo' : /diestr|derech/i.test(text) ? 'Derecho' : '',
    club: '',
    category: '',
  };
}

async function handlePlayerImport(p: PlayerImportPayload) {
  const text = (p.text ?? '').trim();
  if (!text) return json({ error: 'Texto requerido' }, 400);
  const system =
    'Extraes los datos de una ficha de jugador. Devuelve SOLO JSON: ' +
    '{"name":"...","pos":"...","age":number,"foot":"Derecho|Izquierdo|Ambidiestro","club":"...","category":"...",' +
    '"height_cm":number,"weight_kg":number}. Sin markdown. Si falta un campo, usa "" o omítelo.';
  try {
    const raw = await callProvider(system, text);
    const parsed = extractJson<Record<string, unknown>>(raw);
    return json({ player: parsed ?? fallbackPlayerImport(text) });
  } catch (e) {
    if (e instanceof NoProvider) return json({ player: fallbackPlayerImport(text), degraded: true });
    return json({ error: 'Error del proveedor de IA' }, 502);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const body = (await req.json().catch(() => ({}))) as { mode?: Mode; payload?: unknown };
  const mode = body.mode;
  const payload = (body.payload ?? {}) as Record<string, unknown>;

  switch (mode) {
    case 'chat':
      return handleChat(payload as ChatPayload);
    case 'metrics':
      return handleMetrics(payload as MetricsPayload);
    case 'report':
      return handleReport(payload as ReportPayload);
    case 'season-import':
      return handleSeason(payload as SeasonPayload);
    case 'player-import':
      return handlePlayerImport(payload as PlayerImportPayload);
    default:
      return json({ error: 'Modo no válido.' }, 400);
  }
});
