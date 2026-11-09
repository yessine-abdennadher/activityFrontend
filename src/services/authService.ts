import { getApiBaseUrl, getFallbackApiUrls, setApiBaseUrl } from './apiConfig';
import { Platform } from 'react-native';
import { USER_PERMISSIONS } from '../types';
import type { AuthUser, UserPermission, UserRole, UserType, PartnerTier } from '../types';
import { Storage, STORAGE_KEYS } from './storage';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

function requireNativeAuthentication(): void {
  if (Platform.OS === 'web') {
    throw new Error('La connexion de l’application est réservée à iOS et Android.');
  }
}

export class AdminMfaRequiredError extends Error {
  challengeId: string;
  maskedEmail: string;

  constructor(challengeId: string, maskedEmail: string) {
    super('Une vérification administrateur par email est nécessaire.');
    this.name = 'AdminMfaRequiredError';
    this.challengeId = challengeId;
    this.maskedEmail = maskedEmail;
  }
}

export function getAuthToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

/**
 * Restaure la session de l'utilisateur au démarrage de l'application
 */
export async function restoreSession(): Promise<AuthUser | null> {
  if (Platform.OS === 'web') {
    accessToken = null;
    refreshToken = null;
    await Promise.all([
      Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      Storage.removeItem(STORAGE_KEYS.CURRENT_USER),
    ]);
    return null;
  }
  try {
    const savedToken = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const savedRefresh = await Storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const savedUser = await Storage.getJson<AuthUser>(STORAGE_KEYS.CURRENT_USER);

    if (savedToken && savedUser) {
      accessToken = savedToken;
      refreshToken = savedRefresh;
      return savedUser;
    }
  } catch (err) {
    console.warn('[authService] Erreur restauration session:', err);
  }
  return null;
}

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city?: string;
  role?: UserRole;
  userType?: UserType;
  partnerTier?: PartnerTier;
  establishmentName?: string;
}): AuthUser {
  const role: UserRole = user.role || 'user';
  const permissions: UserPermission[] = USER_PERMISSIONS[role] || USER_PERMISSIONS.user;

  let computedUserType: UserType = 'simple_user';
  if (role === 'admin') computedUserType = 'administrator';
  else if (role === 'partner') computedUserType = 'partner_business';

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    city: user.city,
    role,
    userType: user.userType || computedUserType,
    partnerTier: user.partnerTier || 'standard',
    establishmentName: user.establishmentName || '',
    permissions,
  };
}

async function persistSession(token: string | null, refresh: string | null, user: AuthUser): Promise<void> {
  if (!token || !refresh) throw new Error('Le serveur a renvoyé une session incomplète.');
  accessToken = token;
  refreshToken = refresh;
  if (token) await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  if (refresh) await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  await Storage.setJson(STORAGE_KEYS.CURRENT_USER, user);
}

/**
 * Fetch avec timeout strict pour éviter les blocages infinis
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Délai d'attente dépassé (6s). Le serveur sur ${url} ne répond pas.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithSessionRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const send = (token: string | null) => {
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  };

  let response = await send(accessToken);
  if (response.status === 401 && refreshToken) {
    const freshToken = await refreshAccessToken();
    if (freshToken) response = await send(freshToken);
  }
  return response;
}

/**
 * Appel API robuste avec bascule automatique entre IP locale et émulateur
 */
async function fetchAuthWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const primaryUrl = `${baseUrl}${endpoint}`;

  try {
    return await fetchWithTimeout(primaryUrl, options, 6000);
  } catch (primaryErr: any) {
    console.warn(`[authService] Échec URL principale (${primaryUrl}):`, primaryErr.message);

    // Fallbacks dynamiques issus de apiConfig.ts (sans IP codée en dur ici)
    const fallbackUrls = getFallbackApiUrls().filter((url) => `${url}${endpoint}` !== primaryUrl);

    for (const fallbackBase of fallbackUrls) {
      try {
        console.log(`[authService] Tentative sur URL de secours: ${fallbackBase}${endpoint}`);
        const fallbackRes = await fetchWithTimeout(`${fallbackBase}${endpoint}`, options, 5000);
        if (fallbackRes.ok || fallbackRes.status < 500) {
          setApiBaseUrl(fallbackBase);
          return fallbackRes;
        }
      } catch {
        // Essayer le fallback suivant
      }
    }

    throw new Error(
      `Impossible de contacter le backend (${primaryUrl}). Vérifiez que le serveur est démarré et sur le même Wi-Fi.`
    );
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  requireNativeAuthentication();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const response = await fetchAuthWithFallback('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });

  const payload = await response.json();
  if (payload.mfaRequired && payload.challengeId) {
    throw new AdminMfaRequiredError(payload.challengeId, payload.maskedEmail || 'votre adresse email');
  }
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la connexion.');
  }

  const token = payload.accessToken || payload.token;
  const refresh = payload.refreshToken || null;
  const mappedUser = mapUser(payload.user);

  await persistSession(token, refresh, mappedUser);
  return mappedUser;
}

export async function verifyAdminMfa(challengeId: string, code: string): Promise<AuthUser> {
  requireNativeAuthentication();
  const response = await fetchAuthWithFallback('/auth/admin/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, otp: code }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Impossible de vérifier le code administrateur.');
  const mappedUser = mapUser(payload.user);
  await persistSession(payload.accessToken || payload.token, payload.refreshToken || null, mappedUser);
  return mappedUser;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  requireNativeAuthentication();
  const response = await fetchAuthWithFallback('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Erreur lors de l'inscription.");
  }

  const token = payload.accessToken || payload.token;
  const refresh = payload.refreshToken || null;
  const mappedUser = mapUser(payload.user);

  await persistSession(token, refresh, mappedUser);
  return mappedUser;
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  requireNativeAuthentication();
  if (!idToken?.trim()) throw new Error('Un jeton Google vérifié est obligatoire.');
  const response = await fetchAuthWithFallback('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la connexion Google.');
  }

  const token = payload.accessToken || payload.token;
  const refresh = payload.refreshToken || null;
  const mappedUser = mapUser(payload.user);

  await persistSession(token, refresh, mappedUser);
  return mappedUser;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.accessToken || !payload.refreshToken) {
        await logout();
        return null;
      }

      const newAccessToken: string = payload.accessToken;
      const newRefreshToken: string = payload.refreshToken;
      accessToken = newAccessToken;
      refreshToken = newRefreshToken;
      await Promise.all([
        Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken),
        Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
      ]);

      return accessToken;
    } catch {
      await logout();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function logout(): Promise<void> {
  if (refreshToken) {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignorer silencieusement les erreurs de réseau lors de la déconnexion
    }
  }

  accessToken = null;
  refreshToken = null;
  await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  await Storage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Met à jour la photo de profil (avatar) de l'utilisateur courant,
 * sauvegarde localement dans le Storage et synchronise avec le backend si connecté.
 */
export async function updateUserAvatar(newAvatarUrl: string): Promise<AuthUser | null> {
  try {
    const savedUser = await Storage.getJson<AuthUser>(STORAGE_KEYS.CURRENT_USER);
    if (!savedUser) return null;

    const updatedUser: AuthUser = {
      ...savedUser,
      avatar: newAvatarUrl,
    };

    await Storage.setJson(STORAGE_KEYS.CURRENT_USER, updatedUser);

    if (accessToken) {
      try {
        const response = await fetchWithSessionRefresh(`${getApiBaseUrl()}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ avatar: newAvatarUrl }),
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.user) {
            const freshMapped = mapUser(resData.user);
            await Storage.setJson(STORAGE_KEYS.CURRENT_USER, freshMapped);
            return freshMapped;
          }
        }
      } catch (err) {
        console.warn('[authService] Sync avatar avec backend différée (sauvegarde locale réussie):', err);
      }
    }

    return updatedUser;
  } catch (err) {
    console.error('[authService] Erreur mise à jour avatar:', err);
    return null;
  }
}

/**
 * Récupère le profil frais depuis le backend (/auth/me) et synchronise le cache local
 */
export async function fetchCurrentUserProfile(): Promise<AuthUser | null> {
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetchWithSessionRefresh(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (payload.success && payload.user) {
      const mapped = mapUser(payload.user);
      await Storage.setJson(STORAGE_KEYS.CURRENT_USER, mapped);
      return mapped;
    }
  } catch (err: any) {
    console.warn('[authService] Échec actualisation profil (/auth/me):', err.message);
  }
  return null;
}



