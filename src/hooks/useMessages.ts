import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { listThread, sendMessage } from '@/services/messages.service';

export function useThread(playerId: string | null) {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['messages', coachId, playerId],
    queryFn: () => listThread(coachId, playerId as string),
    enabled: coachId.length > 0 && !!playerId,
  });
}

export function useSendMessage(playerId: string | null) {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendMessage(coachId, playerId as string, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', coachId, playerId] }),
  });
}
