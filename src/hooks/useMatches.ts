import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { createMatch, listMatches, type CreateMatchInput } from '@/services/matches.service';

export function useMatches() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['matches', coachId],
    queryFn: () => listMatches(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreateMatch() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMatchInput) => createMatch(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches', coachId] }),
  });
}
