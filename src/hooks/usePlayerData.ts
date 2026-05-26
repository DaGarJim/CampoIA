import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createCheckin,
  getMyPlayer,
  listMyCheckins,
  listMyMatches,
  listMyTasks,
  setMyPhoto,
  type CreateCheckinInput,
} from '@/services/player.service';
import { setMyTaskDone } from '@/services/tasks.service';
import { listMyTrainings, setMyTrainingDone } from '@/services/training.service';
import { listThread, sendPlayerMessage } from '@/services/messages.service';
import { listMyVideoAnalysis } from '@/services/video.service';

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
    mutationFn: ({ id, done }: { id: string; done: boolean }) => setMyTaskDone(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks', playerId] }),
  });
}

export function useCreateCheckin(playerId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateCheckinInput, 'player_id'>) =>
      createCheckin({ ...input, player_id: playerId as string }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['my-checkins', playerId] });
      void qc.invalidateQueries({ queryKey: ['my-player'] });
    },
  });
}

export function useMyTrainings(playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-trainings', playerId],
    queryFn: () => listMyTrainings(playerId as string),
    enabled: !!playerId,
  });
}

export function useToggleMyTraining(playerId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => setMyTrainingDone(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-trainings', playerId] }),
  });
}

export function useMyVideoAnalysis(playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-video-analysis', playerId],
    queryFn: () => listMyVideoAnalysis(playerId as string),
    enabled: !!playerId,
  });
}

export function useSetMyPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => setMyPhoto(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-player'] }),
  });
}

export function usePlayerThread(coachId: string | null | undefined, playerId: string | null | undefined) {
  return useQuery({
    queryKey: ['player-thread', playerId],
    queryFn: () => listThread(coachId as string, playerId as string),
    enabled: !!coachId && !!playerId,
  });
}

export function useSendPlayerMessage(coachId: string | null | undefined, playerId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendPlayerMessage(coachId as string, playerId as string, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['player-thread', playerId] }),
  });
}
