import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createCheckin,
  getMyPlayer,
  listMyCheckins,
  listMyMatches,
  listMyTasks,
  type CreateCheckinInput,
} from '@/services/player.service';
import { setTaskDone } from '@/services/tasks.service';

export function useMyPlayer() {
  const { user } = useAuth();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: ['my-player', uid],
    queryFn: () => getMyPlayer(uid),
    enabled: uid.length > 0,
  });
}

export function useMyTasks(playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-tasks', playerId],
    queryFn: () => listMyTasks(playerId as string),
    enabled: !!playerId,
  });
}

export function useMyMatches(playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-matches', playerId],
    queryFn: () => listMyMatches(playerId as string),
    enabled: !!playerId,
  });
}

export function useMyCheckins(playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-checkins', playerId],
    queryFn: () => listMyCheckins(playerId as string),
    enabled: !!playerId,
  });
}

export function useToggleMyTask(playerId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => setTaskDone(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks', playerId] }),
  });
}

export function useCreateCheckin(playerId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateCheckinInput, 'player_id'>) =>
      createCheckin({ ...input, player_id: playerId as string }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-checkins', playerId] }),
  });
}
