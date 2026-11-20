import { getApiBaseUrl } from './apiConfig';
import { fetchWithSessionRefresh, getAuthToken } from './authService';
import type { LoyaltyProgramConfig } from '../types';

export interface UserLoyaltyCardStatus {
  isActive: boolean;
  requiredStamps: number;
  rewardType: 'free' | 'discount' | 'gift';
  rewardDiscountPercent: number;
  rewardLabel: string;
  stampsCount: number;
  totalVisits: number;
  rewardsRedeemed: number;
  rewardReady: boolean;
  customerCode?: string;
  history?: { date: string; action: 'stamp' | 'redeem'; note: string }[];
}

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Récupérer l'état de la carte de fidélité du client pour un établissement donné.
 */
export async function fetchUserLoyaltyCard(
  activityId: string
): Promise<UserLoyaltyCardStatus> {
  const url = `${getApiBaseUrl()}/loyalty/activity/${activityId}`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de charger la carte de fidélité.');
  }
  return data;
}

/**
 * Valider un passage (+1 tampon) en saisissant le code PIN caissier.
 */
export async function stampLoyaltyCard(
  activityId: string,
  pin: string
): Promise<{
  message: string;
  card: { stampsCount: number; totalVisits: number; rewardsRedeemed: number };
  requiredStamps: number;
  rewardReady: boolean;
}> {
  const url = `${getApiBaseUrl()}/loyalty/stamp`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ activityId, pin }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de valider le passage.');
  }
  return data;
}

/**
 * Réclamer la récompense fidélité (ex: 6ème offert) avec le code PIN caissier.
 */
export async function redeemLoyaltyReward(
  activityId: string,
  pin: string
): Promise<{
  message: string;
  card: { stampsCount: number; totalVisits: number; rewardsRedeemed: number };
  requiredStamps: number;
  rewardReady: boolean;
}> {
  const url = `${getApiBaseUrl()}/loyalty/redeem`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ activityId, pin }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de réclamer la récompense.');
  }
  return data;
}

/**
 * Partenaire : Activer ou configurer la carte de fidélité de l'établissement.
 */
export async function updatePartnerLoyaltyProgram(
  activityId: string,
  payload: LoyaltyProgramConfig
): Promise<LoyaltyProgramConfig> {
  const url = `${getApiBaseUrl()}/loyalty/partner/${activityId}`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de configurer la carte de fidélité.');
  }
  return data.loyaltyProgram;
}

/**
 * Partenaire : Valider directement un tampon ou récompense client par Code Pass ou Email.
 */
export async function partnerStampCustomerCard(
  activityId: string,
  customerQuery: string,
  action: 'stamp' | 'redeem' = 'stamp'
): Promise<{
  message: string;
  customerName: string;
  card: { stampsCount: number; totalVisits: number; rewardsRedeemed: number };
  requiredStamps: number;
  rewardReady: boolean;
}> {
  const url = `${getApiBaseUrl()}/loyalty/partner/stamp-customer`;
  const response = await fetchWithSessionRefresh(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ activityId, customerQuery, action }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Impossible de valider ce client.');
  }
  return data;
}
