/**
 * storage.ts
 * Adaptateur de stockage persistant universel (Web & Mobile).
 * Permet de sauvegarder de façon résiliente la session utilisateur et les préférences.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
      // Sur iOS & Android : Stockage matériel chiffré (Keychain / Keystore)
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn(`[Storage] Erreur lecture sécurisée ${key}:`, err);
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
      // Sur iOS & Android : Écriture chiffrée
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.warn(`[Storage] Erreur écriture sécurisée ${key}:`, err);
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
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn(`[Storage] Erreur suppression sécurisée ${key}:`, err);
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

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'activitytn_access_token',
  REFRESH_TOKEN: 'activitytn_refresh_token',
  CURRENT_USER: 'activitytn_current_user',
  LANGUAGE: 'activitytn_pref_language',
  THEME_MODE: 'activitytn_pref_theme_mode',
};
