import { getApiBaseUrl, getFallbackApiUrls, setApiBaseUrl } from './apiConfig';
import { USER_PERMISSIONS } from '../types';
import type { AuthUser, UserPermission, UserRole, UserType } from '../types';
import { Storage, STORAGE_KEYS } from './storage';

let accessToken: string | null = null;
let refreshToken: string | null = null;

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
    establishmentName: user.establishmentName || '',
    permissions,
  };
}

async function persistSession(token: string | null, refresh: string | null, user: AuthUser): Promise<void> {
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
  const normalizedEmail = (email || '').trim().toLowerCase();
  const response = await fetchAuthWithFallback('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password: password?.trim() }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la connexion.');
  }

  const token = payload.accessToken || payload.token;
  const refresh = payload.refreshToken || null;
  const mappedUser = mapUser(payload.user);

  await persistSession(token, refresh, mappedUser);
  return mappedUser;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'user',
  establishmentName: string = ''
): Promise<AuthUser> {
  const response = await fetchAuthWithFallback('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, establishmentName }),
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

export async function loginWithGoogle(googleData: {
  idToken?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  avatar?: string;
  googleId?: string;
}): Promise<AuthUser> {
  const response = await fetchAuthWithFallback('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData),
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
  if (!refreshToken) return null;

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await response.json();
    if (!response.ok) {
      await logout();
      return null;
    }

    accessToken = payload.accessToken;
    if (payload.refreshToken) {
      refreshToken = payload.refreshToken;
      await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
    }
    if (accessToken) {
      await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }

    return accessToken;
  } catch (err) {
    await logout();
    return null;
  }
}

export async function logout(): Promise<void> {
  if (accessToken && refreshToken) {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
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

