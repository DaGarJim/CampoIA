import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { createTask, listTasks, setTaskDone, type CreateTaskInput } from '@/services/tasks.service';

export function useTasks() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['tasks', coachId],
    queryFn: () => listTasks(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', coachId] }),
  });
}

export function useToggleTask() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => setTaskDone(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', coachId] }),
  });
}
