import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createPlayer,
  deletePlayer,
  listPlayers,
  seedDemoPlayers,
  updatePlayer,
  updatePlayerStatus,
} from '@/services/players.service';
import type { CreatePlayerInput, PlayerStatus, UpdatePlayerInput } from '@/types/domain';

function useCoachId(): string {
  const { user } = useAuth();
  return user?.id ?? '';
}

export function usePlayers() {
  const coachId = useCoachId();
  return useQuery({
    queryKey: ['players', coachId],
    queryFn: () => listPlayers(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreatePlayer() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayerInput) => createPlayer(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', coachId] }),
  });
}

export function useUpdatePlayerStatus() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlayerStatus }) =>
      updatePlayerStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', coachId] }),
  });
}

export function useUpdatePlayer() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePlayerInput }) => updatePlayer(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', coachId] }),
  });
}

export function useSeedDemoPlayers() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => seedDemoPlayers(coachId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', coachId] }),
  });
}

export function useDeletePlayer() {
  const coachId = useCoachId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', coachId] }),
  });
}
