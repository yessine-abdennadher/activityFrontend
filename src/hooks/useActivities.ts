import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getActivities,
  getPaginatedActivities,
  getCategories,
  type ActivityFilters,
  type PaginatedActivitiesResult,
} from '../services/activityService';
import type { Activity, Category } from '../types';

/**
 * Hook standard pour charger les activités (20 par défaut avec cache TanStack 10 minutes)
 */
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

/**
 * Hook d'Infinite Scroll optimisé : Charge 20 par 20 à la demande.
 * Idéal pour les listes longues sans bloquer la mémoire ni le réseau.
 */
export function useInfiniteActivities(filters?: ActivityFilters) {
  const query = useInfiniteQuery<PaginatedActivitiesResult>({
    queryKey: ['infinite-activities', filters || {}],
    queryFn: ({ pageParam = 1 }) =>
      getPaginatedActivities({ ...filters, page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 1000 * 60 * 10,
  });

  const activities = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.activities) ?? [];
  }, [query.data]);

  return {
    activities,
    total: query.data?.pages[0]?.total ?? activities.length,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    isError: query.isError,
  };
}
