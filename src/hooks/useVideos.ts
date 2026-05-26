import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createVideo,
  createVideoAnalysis,
  deleteVideo,
  listVideoAnalysis,
  listVideos,
  updateVideoHighlights,
  type CreateVideoAnalysisInput,
  type CreateVideoInput,
} from '@/services/video.service';
import type { Highlight } from '@/types/domain';

function useCoachId(): string {
  const { user } = useAuth();
  return user?.id ?? '';
}

export function useVideos() {
  const coachId = useCoachId();
  return useQuery({
    queryKey: ['videos', coachId],
    queryFn: () => listVideos(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreateVideo() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVideoInput) => createVideo(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos', coachId] }),
  });
}

export function useUpdateVideoHighlights() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, highlights }: { id: string; highlights: Highlight[] }) =>
      updateVideoHighlights(id, highlights),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos', coachId] }),
  });
}

export function useDeleteVideo() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos', coachId] }),
  });
}

export function useVideoAnalysis() {
  const coachId = useCoachId();
  return useQuery({
    queryKey: ['video-analysis', coachId],
    queryFn: () => listVideoAnalysis(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreateVideoAnalysis() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVideoAnalysisInput) => createVideoAnalysis(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video-analysis', coachId] }),
  });
}
