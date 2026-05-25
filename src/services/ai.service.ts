import { supabase } from '@/lib/supabase';

/**
 * Pregunta al "IA Coach". La clave del proveedor (Gemini/Groq) NO está en el
 * cliente: vive en una Supabase Edge Function llamada `ai-coach` (ver supabase/README).
 */
export async function askCoachAI(prompt: string, context?: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply: string }>('ai-coach', {
    body: { prompt, context },
  });
  if (error) {
    throw new Error(
      'El IA Coach no está disponible. Despliega la Edge Function "ai-coach" en Supabase.',
    );
  }
  return data?.reply ?? '';
}
