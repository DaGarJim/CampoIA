import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getCoachProfile,
  upsertCoachProfile,
  type CoachProfilePatch,
} from '@/services/coach-profile.service';

export function useCoachProfile() {
  const { user } = useAuth();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: ['coach-profile', uid],
    queryFn: () => getCoachProfile(uid),
    enabled: uid.length > 0,
  });
}

export function useSaveCoachProfile() {
  const { user } = useAuth();
  const uid = user?.id ?? '';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CoachProfilePatch) => upsertCoachProfile(uid, patch),
    onSuccess: (data) => qc.setQueryData(['coach-profile', uid], data),
  });
}
