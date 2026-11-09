import { getApiBaseUrl } from './apiConfig';
import { fetchWithSessionRefresh, getAuthToken } from './authService';
import type {
  AdminPlatformStats,
  AdminUser,
  AdminActivityItem,
  AdminUsersResponse,
  AdminActivitiesResponse,
  UserRole,
  PartnerTier,
} from '../types';

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AdminReviewItem {
  _id: string;
  activity: { _id: string; name: string } | null;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export async function fetchReviewsForModeration(page = 1): Promise<{ reviews: AdminReviewItem[]; total: number; totalPages: number }> {
  const response = await fetchWithSessionRefresh(`${getApiBaseUrl()}/admin/reviews?status=pending&page=${page}&limit=20`, { headers: getHeaders() });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Impossible de charger les avis.');
  return data;
}

export async function moderateReview(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
  const response = await fetchWithSessionRefresh(`${getApiBaseUrl()}/admin/reviews/${reviewId}/status`, {
    method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Impossible de modérer cet avis.');
}

/**
 * Récupérer les KPI globaux de la plateforme
 */
export async function fetchAdminStats(): Promise<AdminPlatformStats> {
  const url = `${getApiBaseUrl()}/admin/stats`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de récupérer les statistiques administrateur.');
  }

  return data.stats;
}

/**
 * Récupérer la liste des utilisateurs avec filtres et pagination
 */
export async function fetchAdminUsers(params?: {
  role?: string;
  status?: string | boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params?.role) query.append('role', params.role);
  if (params?.status !== undefined && params?.status !== '') {
    query.append('status', String(params.status));
  }
  if (params?.search) query.append('search', params.search);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const url = `${getApiBaseUrl()}/admin/users?${query.toString()}`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de charger les utilisateurs.');
  }

  return data;
}

/**
 * Activer ou suspendre un compte utilisateur
 */
export async function updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
  const url = `${getApiBaseUrl()}/admin/users/${userId}/status`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ isActive }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de modifier le statut du compte.');
  }

  return data.user;
}

/**
 * Changer le rôle d'un compte (user, partner, admin)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<AdminUser> {
  const url = `${getApiBaseUrl()}/admin/users/${userId}/role`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de mettre à jour le rôle.');
  }

  return data.user;
}

/**
 * Récupérer les activités pour la modération
 */
export async function fetchAdminActivities(params?: {
  status?: string;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<AdminActivitiesResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.city) query.append('city', params.city);
  if (params?.category) query.append('category', params.category);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const url = `${getApiBaseUrl()}/admin/activities?${query.toString()}`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de charger les activités.');
  }

  return data;
}

/**
 * Approuver ou désapprouver une activité
 */
export async function toggleActivityApproval(
  activityId: string,
  isApproved: boolean
): Promise<AdminActivityItem> {
  const url = `${getApiBaseUrl()}/admin/activities/${activityId}/approve`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ isApproved }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Impossible de modifier l'approbation.");
  }

  return data.activity;
}

/**
 * Mettre en avant (Featured) ou marquer populaire
 */
export async function toggleActivityHighlight(
  activityId: string,
  field: 'isFeatured' | 'isPopular'
): Promise<AdminActivityItem> {
  const url = `${getApiBaseUrl()}/admin/activities/${activityId}/highlight`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ field }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de modifier la mise en avant.');
  }

  return data.activity;
}

/**
 * Supprimer définitivement une activité
 */
export async function deleteActivityByAdmin(activityId: string): Promise<boolean> {
  const url = `${getApiBaseUrl()}/admin/activities/${activityId}`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Impossible de supprimer l'activité.");
  }

  return true;
}

/**
 * Récupérer les données de diagnostic et d'activité des partenaires
 */
export async function fetchAdminDiagnostics(): Promise<import('../types').AdminDiagnostics> {
  const url = `${getApiBaseUrl()}/admin/diagnostics`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de récupérer les diagnostics administrateur.');
  }

  return data.diagnostics;
}

/**
 * Modifier le niveau / tier d'un partenaire (standard ou pro)
 */
export async function updatePartnerTier(partnerId: string, tier: PartnerTier): Promise<AdminUser> {
  const url = `${getApiBaseUrl()}/admin/partners/${partnerId}/tier`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ tier }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de modifier le tier du partenaire.');
  }

  return data.partner;
}

/**
 * Activer ou désactiver le mode alerte électricité globale au niveau de la plateforme
 */
export async function toggleGlobalElectricityMode(active: boolean): Promise<{ success: boolean; electricityAlertActive: boolean }> {
  const url = `${getApiBaseUrl()}/admin/electricity-mode`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ active }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de modifier le mode électricité globale.');
  }

  return data;
}


