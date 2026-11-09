import { useCallback, useState } from 'react';
import { fetchAdminDiagnostics, toggleGlobalElectricityMode } from '../../services/adminService';
import { AdminDiagnostics, AdminPartnerStatus, PartnerTier } from '../../types';

export function useAdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<AdminDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setDiagnostics(await fetchAdminDiagnostics()); }
    catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erreur lors du chargement des diagnostics.';
      setError(message);
      console.error('[AdminDashboard] Erreur chargement diagnostics:', message);
    } finally { setLoading(false); }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const setPartnerTier = useCallback((partnerId: string, partnerTier: PartnerTier) => {
    setDiagnostics((current) => current ? {
      ...current,
      partnersStatus: current.partnersStatus.map((partner: AdminPartnerStatus) => partner.id === partnerId ? { ...partner, partnerTier } : partner),
    } : current);
  }, []);

  const setElectricityMode = useCallback(async (active: boolean) => {
    const response = await toggleGlobalElectricityMode(active);
    setDiagnostics((current) => current ? { ...current, electricityAlertActive: response.electricityAlertActive } : current);
    return response;
  }, []);

  return { diagnostics, loading, refreshing, error, load, refresh, setPartnerTier, setElectricityMode };
}
