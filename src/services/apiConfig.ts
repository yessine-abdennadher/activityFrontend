import { Platform } from 'react-native';

// ============================================================================
// 🌐 CONFIGURATION UNIQUE DU SERVEUR / IP WI-FI
// Pour changer d'adresse IP (lorsque vous changez de Wi-Fi),
// MODIFIEZ UNIQUEMENT CETTE VARIABLE 'SERVER_IP' CI-DESSOUS :
// ============================================================================
export const SERVER_IP = '192.168.0.127';
export const SERVER_PORT = 5000;

/**
 * Calcule l'URL de base par défaut en fonction de la plateforme :
 * - Variable d'environnement EXPO_PUBLIC_API_URL prioritaire si définie
 * - Web : utilise le hostname du navigateur
 * - Mobile (Android/iOS) : utilise l'adresse IP locale configurée ci-dessus
 */
const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:${SERVER_PORT}/api`;
  }
  // Sur appareil Android (physique sur le réseau Wi-Fi local ou émulateur)
  return `http://${SERVER_IP}:${SERVER_PORT}/api`;
};

let currentApiUrl = getDefaultApiUrl();

export const API_BASE_URL = currentApiUrl;

export function getApiBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && currentApiUrl.includes('192.168.')) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:${SERVER_PORT}/api`;
  }
  return currentApiUrl;
}

export function setApiBaseUrl(newUrl: string): void {
  currentApiUrl = newUrl;
}

/**
 * Fournit la liste ordonnée des URLs alternatives pour le basculement automatique
 * en cas de problème réseau (serveur distant, émulateur Android, ou localhost).
 */
export function getFallbackApiUrls(): string[] {
  const primary = getApiBaseUrl();
  const candidates = [
    primary,
    `http://${SERVER_IP}:${SERVER_PORT}/api`,
    `http://10.0.2.2:${SERVER_PORT}/api`,
    `http://localhost:${SERVER_PORT}/api`,
  ];
  return Array.from(new Set(candidates));
}

let cachedGoogleClientId = (typeof window !== 'undefined' && window.localStorage?.getItem('GOOGLE_CLIENT_ID')) || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

export function getGoogleClientId(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('GOOGLE_CLIENT_ID');
    if (saved) return saved;
  }
  return cachedGoogleClientId;
}

export function setGoogleClientId(clientId: string): void {
  cachedGoogleClientId = clientId;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('GOOGLE_CLIENT_ID', clientId);
  }
}
