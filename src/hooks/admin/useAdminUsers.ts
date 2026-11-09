import { useCallback, useState } from 'react';
import { fetchAdminUsers, updateUserRole, updateUserStatus } from '../../services/adminService';
import { AdminUser, UserRole } from '../../types';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (role: string, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ role: role === 'all' ? undefined : role, search: search.trim() || undefined, limit: 50 });
      setUsers(data.users);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erreur lors du chargement des utilisateurs.';
      setError(message);
      console.error('[AdminDashboard] Erreur chargement utilisateurs:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (role: string, search: string) => {
    setRefreshing(true);
    try { await load(role, search); } finally { setRefreshing(false); }
  }, [load]);

  const setStatus = useCallback(async (user: AdminUser) => {
    const updated = await updateUserStatus(user._id, !user.isActive);
    setUsers((current) => current.map((entry) => entry._id === user._id ? { ...entry, isActive: updated.isActive } : entry));
  }, []);

  const setRole = useCallback(async (userId: string, role: UserRole) => {
    const updated = await updateUserRole(userId, role);
    setUsers((current) => current.map((entry) => entry._id === userId ? { ...entry, role: updated.role } : entry));
    return updated;
  }, []);

  const updatePartnerTierLocally = useCallback((userId: string, partnerTier: AdminUser['partnerTier']) => {
    setUsers((current) => current.map((entry) => entry._id === userId ? { ...entry, partnerTier } : entry));
  }, []);

  return { users, setUsers, loading, refreshing, error, load, refresh, setStatus, setRole, updatePartnerTierLocally };
}
