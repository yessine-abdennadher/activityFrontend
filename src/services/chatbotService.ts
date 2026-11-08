/**
 * chatbotService.ts
 * Service client pour l'Assistant IA KharjaBot.
 *
 * Gère le cycle de vie de la session (création, persistance, réinitialisation)
 * et les échanges bidirectionnels avec le backend (/api/chat/session, /api/chat/send).
 */

import { getApiBaseUrl, getFallbackApiUrls, setApiBaseUrl } from './apiConfig';
import { Storage, STORAGE_KEYS } from './storage';
import { getAuthToken } from './authService';

export interface ChatCardItem {
  id: string;
  name: string;
  category?: string;
  city?: string;
  rating?: number;
  imageUrl?: string;
  priceLevel?: number | string;
  address?: string;
}

export interface ChatMetadata {
  intentKey?: string;
  lang?: string;
  category?: string;
  city?: string;
  cards?: ChatCardItem[];
  turnIndex?: number;
  [key: string]: any;
}

export interface ChatbotReply {
  id?: string;
  sender: 'bot';
  text: string;
  timestamp?: string | number;
  suggestions?: string[];
  metadata?: ChatMetadata;
}

export interface SessionData {
  sessionId: string;
  sessionToken: string;
}

export interface SessionInitData extends SessionData {
  session?: any;
  messages?: ChatbotReply[];
  suggestions?: string[];
}

export interface ChatHistoryItem {
  id: string;
  sessionId: string;
  sessionToken: string;
  title: string;
  preview: string;
  updatedAt: number;
  createdAt: number;
  messageCount: number;
  messages: any[];
  suggestions: string[];
}

function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function apiChatFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const authToken = getAuthToken();
  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const activeBaseUrl = getApiBaseUrl();

  try {
    const url = `${activeBaseUrl}${path}`;
    const response = await fetchWithTimeout(url, { ...options, headers }, 8000);
    return response;
  } catch (err) {
    const fallbacks = getFallbackApiUrls();
    for (const candidate of fallbacks) {
      if (candidate === activeBaseUrl) continue;
      try {
        const testUrl = `${candidate}${path}`;
        const res = await fetchWithTimeout(testUrl, { ...options, headers }, 3000);
        if (res.ok || res.status < 500) {
          setApiBaseUrl(candidate);
          return res;
        }
      } catch {
        // Ignorer et essayer le suivant
      }
    }
    throw err;
  }
}

export const chatbotService = {
  /**
   * Récupère la session active stockée ou en initialise une nouvelle auprès du serveur.
   * Récupère également le message d'accueil et les suggestions initiales du serveur.
   */
  async getOrCreateSession(
    language = 'fr',
    forceNew = false,
    options?: { hasGps?: boolean; userCity?: string }
  ): Promise<SessionInitData> {
    if (!forceNew) {
      const storedId = await Storage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);
      const storedToken = await Storage.getItem(STORAGE_KEYS.CHAT_SESSION_TOKEN);

      if (storedId && storedToken) {
        // Valide la session existante auprès du serveur
        try {
          const res = await apiChatFetch('/chat/session', {
            method: 'POST',
            headers: {
              'x-chat-session-token': storedToken,
            },
            body: JSON.stringify({
              sessionId: storedId,
              language,
              hasGps: Boolean(options?.hasGps),
              userCity: options?.userCity || 'Sfax',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.session) {
              const realSessionId = data.session.sessionId || storedId;
              const msgs = data.session.messages || [];
              const lastMsg = msgs[msgs.length - 1];
              return {
                sessionId: realSessionId,
                sessionToken: storedToken,
                session: data.session,
                messages: msgs,
                suggestions: data.suggestions || lastMsg?.suggestions || [],
              };
            }
          } else if (res.status === 404) {
            await Storage.removeItem(STORAGE_KEYS.CHAT_SESSION_ID);
            await Storage.removeItem(STORAGE_KEYS.CHAT_SESSION_TOKEN);
          }
        } catch {
          // En cas de panne temporaire du réseau, conserver la session locale
          return { sessionId: storedId, sessionToken: storedToken };
        }
      }
    }

    // Créer une nouvelle session avec la langue demandée
    const createRes = await apiChatFetch('/chat/session', {
      method: 'POST',
      body: JSON.stringify({
        roleContext: 'anonyme',
        language,
        hasGps: Boolean(options?.hasGps),
        userCity: options?.userCity || 'Sfax',
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Impossible d'initialiser la session de chat (${createRes.status})`);
    }

    const createData = await createRes.json();
    const sessionId = createData.session?.sessionId || createData.session?.id || createData.session?._id;
    const sessionToken = createData.sessionToken;

    if (!sessionId || !sessionToken) {
      throw new Error('Réponse invalide lors de la création de session chat.');
    }

    await Storage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, sessionId);
    await Storage.setItem(STORAGE_KEYS.CHAT_SESSION_TOKEN, sessionToken);

    const msgs = createData.session?.messages || [];
    const lastMsg = msgs[msgs.length - 1];

    return {
      sessionId,
      sessionToken,
      session: createData.session,
      messages: msgs,
      suggestions: createData.suggestions || lastMsg?.suggestions || [],
    };
  },

  /**
   * Envoie un message utilisateur à KharjaBot et retourne la réponse générée.
   */
  async sendMessage(
    text: string,
    options?: { hasGps?: boolean; coords?: any; userCity?: string }
  ): Promise<ChatbotReply> {
    const cleanText = text.trim();
    if (!cleanText) {
      throw new Error('Le message ne peut pas être vide.');
    }

    let session = await this.getOrCreateSession('fr', false, options);

    let res = await apiChatFetch('/chat/send', {
      method: 'POST',
      headers: {
        'x-chat-session-token': session.sessionToken,
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        text: cleanText,
        hasGps: Boolean(options?.hasGps),
        coords: options?.coords || null,
        userCity: options?.userCity || 'Sfax',
      }),
    });

    // Si la session a expiré ou est introuvable côté serveur (404), recréer une session fraîche et retenter
    if (res.status === 404) {
      session = await this.getOrCreateSession('fr', true, options);
      res = await apiChatFetch('/chat/send', {
        method: 'POST',
        headers: {
          'x-chat-session-token': session.sessionToken,
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          text: cleanText,
          hasGps: Boolean(options?.hasGps),
          coords: options?.coords || null,
          userCity: options?.userCity || 'Sfax',
        }),
      });
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();
    if (!data.success || !data.reply) {
      throw new Error('Réponse chatbot inattendue.');
    }

    return data.reply as ChatbotReply;
  },

  /**
   * Réinitialise complètement la session de chat (nouvelle conversation).
   */
  async resetSession(
    language = 'fr',
    options?: { hasGps?: boolean; userCity?: string }
  ): Promise<SessionInitData> {
    await Storage.removeItem(STORAGE_KEYS.CHAT_SESSION_ID);
    await Storage.removeItem(STORAGE_KEYS.CHAT_SESSION_TOKEN);
    return this.getOrCreateSession(language, true, options);
  },

  /**
   * Récupère la liste de l'historique des discussions sauvegardées.
   */
  async getConversationHistory(): Promise<ChatHistoryItem[]> {
    try {
      const raw = await Storage.getItem(STORAGE_KEYS.CHAT_CONVERSATION_HISTORY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Sauvegarde ou met à jour une discussion dans l'historique local.
   */
  async saveDiscussionToHistory(item: {
    sessionId: string;
    sessionToken: string;
    messages: any[];
    suggestions?: string[];
    title?: string;
  }): Promise<void> {
    if (!item.sessionId || !item.messages || item.messages.length === 0) return;

    try {
      const history = await this.getConversationHistory();
      const existingIndex = history.findIndex((h) => h.sessionId === item.sessionId);

      // Calculer un titre pertinent basé sur le premier message utilisateur
      let computedTitle = item.title || '';
      if (!computedTitle) {
        const firstUserMsg = item.messages.find((m: any) => m.sender === 'user');
        if (firstUserMsg && typeof firstUserMsg.text === 'string' && firstUserMsg.text.trim()) {
          const clean = firstUserMsg.text.trim();
          computedTitle = clean.length > 38 ? clean.substring(0, 35) + '...' : clean;
        } else {
          computedTitle = 'Discussion KharjaBot';
        }
      }

      // Calculer un aperçu textuel basé sur le dernier message
      const lastMsg = item.messages[item.messages.length - 1];
      const previewText =
        typeof lastMsg?.text === 'string'
          ? (lastMsg.text.trim().length > 70
              ? lastMsg.text.trim().substring(0, 67) + '...'
              : lastMsg.text.trim())
          : '';

      const now = Date.now();
      const historyEntry: ChatHistoryItem = {
        id: existingIndex >= 0 ? history[existingIndex].id : `chat-${item.sessionId}-${now}`,
        sessionId: item.sessionId,
        sessionToken: item.sessionToken,
        title: computedTitle,
        preview: previewText,
        updatedAt: now,
        createdAt: existingIndex >= 0 ? history[existingIndex].createdAt : now,
        messageCount: item.messages.length,
        messages: item.messages,
        suggestions: item.suggestions || [],
      };

      let updatedList: ChatHistoryItem[];
      if (existingIndex >= 0) {
        updatedList = [
          historyEntry,
          ...history.filter((_, idx) => idx !== existingIndex),
        ];
      } else {
        updatedList = [historyEntry, ...history];
      }

      // Limiter à 30 discussions max
      const capped = updatedList.slice(0, 30);
      await Storage.setItem(STORAGE_KEYS.CHAT_CONVERSATION_HISTORY, JSON.stringify(capped));
    } catch (e) {
      console.warn('[chatbotService] Erreur lors de la sauvegarde de l\'historique:', e);
    }
  },

  /**
   * Supprime une discussion spécifique de l'historique par son id ou sessionId.
   */
  async deleteConversation(idOrSessionId: string): Promise<ChatHistoryItem[]> {
    try {
      const history = await this.getConversationHistory();
      const filtered = history.filter(
        (h) => h.id !== idOrSessionId && h.sessionId !== idOrSessionId
      );
      await Storage.setItem(STORAGE_KEYS.CHAT_CONVERSATION_HISTORY, JSON.stringify(filtered));
      return filtered;
    } catch {
      return [];
    }
  },

  /**
   * Efface l'intégralité de l'historique des discussions.
   */
  async clearAllConversations(): Promise<void> {
    try {
      await Storage.removeItem(STORAGE_KEYS.CHAT_CONVERSATION_HISTORY);
    } catch (e) {
      console.warn('[chatbotService] Erreur lors de la suppression de l\'historique:', e);
    }
  },

  /**
   * Charge et restaure une discussion passée comme session active.
   */
  async resumeConversation(item: ChatHistoryItem): Promise<void> {
    if (!item.sessionId || !item.sessionToken) return;
    await Storage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, item.sessionId);
    await Storage.setItem(STORAGE_KEYS.CHAT_SESSION_TOKEN, item.sessionToken);
  },
};

