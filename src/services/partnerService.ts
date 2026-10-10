import { getApiBaseUrl } from './apiConfig';
import { getAuthToken } from './authService';
import type {
  PartnerActivitiesResponse,
  PartnerActivityItem,
  PartnerActivityInput,
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
