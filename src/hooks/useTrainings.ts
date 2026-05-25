import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { createTraining, listTrainings, type CreateTrainingInput } from '@/services/training.service';

export function useTrainings() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['trainings', coachId],
    queryFn: () => listTrainings(coachId),
    enabled: coachId.length > 0,
  });
}

export function useCreateTraining() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrainingInput) => createTraining(coachId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainings', coachId] }),
  });
}
