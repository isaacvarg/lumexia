import { canonActions } from '@/actions/canon';
import type { ReviewQueue } from '@/lib/canon/queries';
import { useQuery } from '@tanstack/react-query';

export const useCanonReviewQueuePollingQuery = () => {

    return useQuery<ReviewQueue>({
        queryKey: ['canonReviewQueue'],
        queryFn: async () => {
            return canonActions.artifacts.getReviewQueue()
        },
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
        staleTime: 25000,
    });
}
