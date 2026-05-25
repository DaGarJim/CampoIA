import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type AiCoachRequest = {
  prompt?: string;
  context?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json().catch(() => ({}))) as AiCoachRequest;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      reply:
        'IA Coach está desplegado en staging, pero no tiene proveedor de IA configurado en capa gratuita. ' +
        'Usa este entorno para validar auth, jugadores, tareas, partidos, entrenamientos y mensajes.',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
});
