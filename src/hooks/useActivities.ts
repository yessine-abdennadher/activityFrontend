import { useEffect, useState } from 'react';
import { getActivities, getCategories } from '../services/activityService';
import type { Activity, Category } from '../types';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([getActivities(), getCategories()])
      .then(([nextActivities, nextCategories]) => {
        if (!active) return;
        console.log(`[useActivities] 📱 Mise à jour du state : ${nextActivities.length} activités injectées dans l'interface.`);
        setActivities(nextActivities);
        setCategories(nextCategories);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { activities, categories, isLoading };
}
