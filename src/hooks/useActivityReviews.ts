import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActivityReviews,
  addActivityReview,
  type ActivityReview,
} from '../services/activityService';

export function useActivityReviews(activityId: string) {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['activity-reviews', activityId],
    queryFn: () => getActivityReviews(activityId),
    enabled: Boolean(activityId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addReviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      addActivityReview(activityId, rating, comment),
    onSuccess: () => {
      // Invalider le cache pour forcer le rafraîchissement des avis et des activités
      queryClient.invalidateQueries({ queryKey: ['activity-reviews', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return {
    reviews: reviewsQuery.data ?? [],
    isLoading: reviewsQuery.isLoading,
    isRefetching: reviewsQuery.isRefetching,
    refetchReviews: reviewsQuery.refetch,
    addReview: addReviewMutation.mutateAsync,
    isSubmittingReview: addReviewMutation.isPending,
  };
}
