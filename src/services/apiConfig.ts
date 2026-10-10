import { Platform } from 'react-native';

const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

let currentApiUrl = getDefaultApiUrl();

export const API_BASE_URL = currentApiUrl;

export function getApiBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && currentApiUrl.includes('192.168.')) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/api`;
  }
  return currentApiUrl;
}

export function setApiBaseUrl(newUrl: string): void {
  currentApiUrl = newUrl;
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
