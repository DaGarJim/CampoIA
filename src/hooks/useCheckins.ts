import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { listCheckins } from '@/services/checkins.service';

export function useCheckins() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['checkins', coachId],
    queryFn: () => listCheckins(),
    enabled: coachId.length > 0,
  });
}
