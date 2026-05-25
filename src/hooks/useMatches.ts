import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { listMatches } from '@/services/matches.service';

export function useMatches() {
  const { user } = useAuth();
  const coachId = user?.id ?? '';
  return useQuery({
    queryKey: ['matches', coachId],
    queryFn: () => listMatches(coachId),
    enabled: coachId.length > 0,
  });
}
