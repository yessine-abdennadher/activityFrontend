/**
 * storage.ts
 * Adaptateur de stockage persistant universel (Web & Mobile).
 *
 * Architecture de stockage :
 * 1. SecureStore (Matériel chiffré : Keychain iOS / Keystore Android) :
 *    - Réservé aux secrets critiques et jetons d'authentification (ACCESS_TOKEN, REFRESH_TOKEN).
 *    - Conforme aux standards de sécurité OWASP Mobile (MASVS-STORAGE).
 *
 * 2. AsyncStorage (Stockage persistant haute performance) :
 *    - Utilisé pour le profil utilisateur (CURRENT_USER) et les préférences (LANGUAGE, THEME_MODE, THEME_PALETTE).
 *    - Évite le crash Android lié à la limite stricte de 2048 octets imposée par SecureStore (SharedPreferences).
 *    - Offre un temps d'accès quasi-instantané au démarrage sans surcharge cryptographique matérielle.
 *
 * 3. Migration transparente automatique :
 *    - Si une clé non-sensible était précédemment stockée dans SecureStore, elle est lue, migrée
 *      vers AsyncStorage, et purgée de SecureStore.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'activitytn_access_token',
  REFRESH_TOKEN: 'activitytn_refresh_token',
  CURRENT_USER: 'activitytn_current_user',
  LANGUAGE: 'activitytn_pref_language',
  THEME_MODE: 'activitytn_pref_theme_mode',
  THEME_PALETTE: 'activitytn_pref_theme_palette',
  NOTIFICATIONS_ENABLED: 'activitytn_pref_notifications_enabled',
  PUSH_TOKEN: 'activitytn_push_token',
  CHAT_SESSION_ID: 'activitytn_chat_session_id',
  CHAT_SESSION_TOKEN: 'activitytn_chat_session_token',
  CHAT_CONVERSATION_HISTORY: 'activitytn_chat_conversation_history',
} as const;

// Clés qui doivent obligatoirement être chiffrées dans le Keystore / Keychain
const SECURE_KEYS = new Set<string>([
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
]);

function isSecureKey(key: string): boolean {
  return SECURE_KEYS.has(key);
}

class MemoryStorage {
  private cache = new Map<string, string>();

  getItem(key: string): string | null {
    return this.cache.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
  }

  removeItem(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const memoryFallback = new MemoryStorage();

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryFallback.getItem(key);
      }

      // Mobile (iOS / Android) : Routage selon la sensibilité de la clé
      if (isSecureKey(key)) {
        return await SecureStore.getItemAsync(key);
      }

      // Données applicatives / Préférences : AsyncStorage
      const asyncValue = await AsyncStorage.getItem(key);
      if (asyncValue !== null) {
        return asyncValue;
      }

      // Rétrocompatibilité : Migration fluide si la valeur était dans SecureStore
      try {
        const legacySecureValue = await SecureStore.getItemAsync(key);
        if (legacySecureValue !== null) {
          await AsyncStorage.setItem(key, legacySecureValue);
          await SecureStore.deleteItemAsync(key).catch(() => {});
          return legacySecureValue;
        }
      } catch {
        // Ignorer l'erreur de fallback legacy
      }

      return null;
    } catch (err) {
      console.warn(`[Storage] Erreur lecture ${key}:`, err);
      return memoryFallback.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        memoryFallback.setItem(key, value);
        return;
      }

      // Mobile (iOS / Android) : Routage selon la sensibilité de la clé
      if (isSecureKey(key)) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
        // Nettoyage proactif de SecureStore si elle y existait auparavant
        await SecureStore.deleteItemAsync(key).catch(() => {});
      }
    } catch (err) {
      console.warn(`[Storage] Erreur écriture ${key}:`, err);
      memoryFallback.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        memoryFallback.removeItem(key);
        return;
      }

      if (isSecureKey(key)) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
        await SecureStore.deleteItemAsync(key).catch(() => {});
      }
    } catch (err) {
      console.warn(`[Storage] Erreur suppression ${key}:`, err);
      memoryFallback.removeItem(key);
    }
  },

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setJson<T>(key: string, value: T): Promise<void> {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[Storage] Erreur setJson ${key}:`, err);
    }
  },
};
