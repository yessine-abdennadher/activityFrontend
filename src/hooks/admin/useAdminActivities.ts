import { useCallback, useState } from 'react';
import {
  deleteActivityByAdmin,
  fetchAdminActivities,
  toggleActivityApproval,
  toggleActivityHighlight,
} from '../../services/adminService';
import { AdminActivityItem } from '../../types';

export type AdminActivityFilter = 'all' | 'pending' | 'approved';

export function useAdminActivities() {
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filter: AdminActivityFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminActivities({ status: filter === 'all' ? undefined : filter, limit: 50 });
      setActivities(data.activities);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erreur lors du chargement des activités.';
      setError(message);
      console.error('[AdminDashboard] Erreur chargement activités:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (filter: AdminActivityFilter) => {
    setRefreshing(true);
    try { await load(filter); } finally { setRefreshing(false); }
  }, [load]);

  const toggleApproval = useCallback(async (item: AdminActivityItem) => {
    const updated = await toggleActivityApproval(item._id, !item.isApproved);
    setActivities((current) => current.map((activity) => activity._id === item._id
      ? { ...activity, isApproved: updated.isApproved } : activity));
  }, []);

  const toggleHighlight = useCallback(async (item: AdminActivityItem, field: 'isFeatured' | 'isPopular') => {
    const updated = await toggleActivityHighlight(item._id, field);
    setActivities((current) => current.map((activity) => activity._id === item._id ? updated : activity));
  }, []);

  const remove = useCallback(async (item: AdminActivityItem) => {
    await deleteActivityByAdmin(item._id);
    setActivities((current) => current.filter((activity) => activity._id !== item._id));
  }, []);

  return { activities, loading, refreshing, error, load, refresh, toggleApproval, toggleHighlight, remove };
}
