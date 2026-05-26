import { supabase } from '@/lib/supabase';
import type { Highlight, Video, VideoAnalysis, VideoType } from '@/types/domain';

// --- Vídeos (biblioteca del coach) -----------------------------------------
export async function listVideos(coachId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Video[];
}

export interface CreateVideoInput {
  title: string;
  url: string;
  size_mb?: number;
}

export async function createVideo(coachId: string, input: CreateVideoInput): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .insert({ coach_id: coachId, title: input.title, url: input.url, size_mb: input.size_mb ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Video;
}

export async function updateVideoHighlights(id: string, highlights: Highlight[]): Promise<void> {
  const { error } = await supabase.from('videos').update({ highlights }).eq('id', id);
  if (error) throw error;
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

// --- Análisis de vídeo (compartido con jugador) ----------------------------
export async function listVideoAnalysis(coachId: string): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analysis')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VideoAnalysis[];
}

export interface CreateVideoAnalysisInput {
  player_id: string;
  title: string;
  video_url: string;
  video_type: VideoType;
  comment?: string;
}

export async function createVideoAnalysis(
  coachId: string,
  input: CreateVideoAnalysisInput,
): Promise<VideoAnalysis> {
  const { data, error } = await supabase
    .from('video_analysis')
    .insert({
      coach_id: coachId,
      player_id: input.player_id,
      title: input.title,
      video_url: input.video_url,
      video_type: input.video_type,
      comment: input.comment?.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as VideoAnalysis;
}

/** Análisis compartidos con el jugador autenticado (RLS los limita a los suyos). */
export async function listMyVideoAnalysis(playerId: string): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analysis')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VideoAnalysis[];
}
