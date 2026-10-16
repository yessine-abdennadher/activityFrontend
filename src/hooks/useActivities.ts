import { useQuery } from '@tanstack/react-query';
import { getActivities, getCategories, type ActivityFilters } from '../services/activityService';
import type { Activity, Category } from '../types';

export function useActivities(filters?: ActivityFilters) {
  const activitiesQuery = useQuery({
    queryKey: ['activities', filters || {}],
    queryFn: () => getActivities(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 heure
  });

  return {
    activities: (activitiesQuery.data ?? []) as Activity[],
    categories: (categoriesQuery.data ?? []) as Category[],
    isLoading: activitiesQuery.isLoading || categoriesQuery.isLoading,
    isRefetching: activitiesQuery.isRefetching,
    refetchActivities: activitiesQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
    isError: activitiesQuery.isError || categoriesQuery.isError,
  };
}
