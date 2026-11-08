import { getApiBaseUrl } from './apiConfig';
import { getAuthToken } from './authService';
import type {
  PartnerActivitiesResponse,
  PartnerActivityItem,
  PartnerActivityInput,
  PartnerSubscriptionInfo,
} from '../types';

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Récupérer les activités et les métriques de l'établissement du partenaire
 */
export async function fetchPartnerMyActivities(): Promise<PartnerActivitiesResponse> {
  const url = `${getApiBaseUrl()}/activities/partner/my-activities`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de récupérer vos activités partenaires.');
  }

  return data;
}

/**
 * Créer une nouvelle activité / offre pour son restaurant ou établissement
 */
export async function createPartnerActivity(
  input: PartnerActivityInput
): Promise<PartnerActivityItem> {
  const url = `${getApiBaseUrl()}/activities`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Échec lors de la création de l'activité.");
  }

  return data.activity;
}

/**
 * Récupérer l'état de l'abonnement du partenaire et le temps restant avant expiration
 */
export async function fetchPartnerSubscription(): Promise<PartnerSubscriptionInfo> {
  const url = `${getApiBaseUrl()}/auth/me`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Impossible de récupérer les détails de l'abonnement.");
  }

  const user = data.user;
  return {
    tier: user.partnerTier || 'standard',
    requestedTier: user.requestedTier || 'standard',
    billingCycle: user.requestedBillingCycle || 'monthly',
    status: user.subscriptionStatus || 'none',
    startedAt: user.subscriptionStartedAt,
    expiresAt: user.subscriptionExpiresAt,
    daysRemaining: user.daysRemaining || 0,
    isExpiringSoon: user.isExpiringSoon || false,
  };
}


/**
 * Mettre à jour une activité existante de son établissement
 */
export async function updatePartnerActivity(
  activityId: string,
  input: Partial<PartnerActivityInput>
): Promise<PartnerActivityItem> {
  const url = `${getApiBaseUrl()}/activities/${activityId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Échec de la mise à jour de l'activité.");
  }

  return data.activity;
}

/**
 * Supprimer une activité de son établissement
 */
export async function deletePartnerActivity(activityId: string): Promise<boolean> {
  const url = `${getApiBaseUrl()}/activities/${activityId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Échec de la suppression de l'activité.");
  }

  return true;
}

/**
 * Basculer le mode électricité / lumière garantie en direct
 */
export async function togglePartnerPowerMode(
  activityId: string,
  powerBackupMode: boolean
): Promise<PartnerActivityItem> {
  const url = `${getApiBaseUrl()}/activities/partner/${activityId}/power-mode`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ powerBackupMode }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de modifier le mode électricité / lumière.');
  }

  return data.activity;
}

/**
 * Configurer une promotion exclusive (Réservé Partenaire Pro)
 */
export async function updatePartnerPromotion(
  activityId: string,
  promotion: {
    isPromo: boolean;
    promoType?: 'all' | 'item';
    discountPercent: number;
    targetItem?: string;
    promoLabel: string;
    validUntil?: string;
  }
): Promise<PartnerActivityItem> {
  const url = `${getApiBaseUrl()}/activities/partner/${activityId}/promotion`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(promotion),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de configurer la promotion.');
  }

  return data.activity;
}

/**
 * Publier un événement spécial / soirée musicale (Réservé Partenaire Pro)
 */
export async function addPartnerEvent(
  activityId: string,
  event: {
    title: string;
    image?: string;
    date?: string;
    time?: string;
    description?: string;
    category?: string;
    price?: number;
  }
): Promise<PartnerActivityItem> {
  const url = `${getApiBaseUrl()}/activities/partner/${activityId}/events`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Impossible d'ajouter l'événement.");
  }

  return data.activity;
}


