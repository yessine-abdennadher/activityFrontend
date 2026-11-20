import { Activity } from '../../types';

export interface ExploreFilterState {
  query: string;
  category: string;
  budget: string;
  distance: string;
}

export const INITIAL_EXPLORE_FILTERS: ExploreFilterState = {
  query: '',
  category: '',
  budget: '',
  distance: '',
};

export function filterActivities(
  activities: Activity[],
  filters: ExploreFilterState
): Activity[] {
  const { query, category, budget, distance } = filters;
  const q = query.toLowerCase().trim();

  return activities.filter((activity) => {
    const queryMatches =
      !q ||
      `${activity.name} ${activity.city} ${activity.category} ${activity.description || ''}`
        .toLowerCase()
        .includes(q);

    const categoryMatches = !category || activity.category === category;

    const budgetMatches =
      !budget ||
      (budget === '30'
        ? activity.price <= 30
        : budget === '10'
        ? activity.price <= 10
        : true);

    const distanceMatches =
      !distance ||
      (activity.distanceKm !== undefined &&
        (distance === '5'
          ? activity.distanceKm <= 5
          : distance === '10'
          ? activity.distanceKm <= 10
          : true));

    return queryMatches && categoryMatches && budgetMatches && distanceMatches;
  });
}
