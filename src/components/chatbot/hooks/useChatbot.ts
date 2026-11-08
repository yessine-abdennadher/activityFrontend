/**
 * useChatbot.ts
 * Hook personnalisé reliant directement le frontend à l'API KharjaBot :
 * - Initialise la session auprès du backend (chargement du message d'accueil et des suggestions initiales réelles)
 * - Transmet les prompts et les suggestions sélectionnées
 * - Met à jour en direct les suggestions contextuelles retournées par le serveur
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useLocation } from '../../../context/LocationContext';
import { chatbotService } from '../../../services/chatbotService';
import type { ChatbotMessage, UseChatbotReturn, ChatHistoryItem } from '../types/chatbot.types';

export function useChatbot(): UseChatbotReturn {
  const { t, language } = useTranslation();
  const { location, permissionStatus, requestGpsLocation } = useLocation();

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [conversations, setConversations] = useState<ChatHistoryItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const currentSessionRef = useRef<{ sessionId: string; sessionToken: string } | null>(null);
  const initialLoadDone = useRef(false);

  const hasGps = permissionStatus === 'granted' || location.source === 'gps';

  // Initialisation dynamique de la session et des suggestions depuis le backend
  useEffect(() => {
    let isSubscribed = true;

    async function loadBackendSession() {
      setIsTyping(true);
      try {
        const sessionData = await chatbotService.getOrCreateSession(language, false, {
          hasGps,
          userCity: location.city || 'Sfax',
        });
        if (!isSubscribed) return;

        currentSessionRef.current = {
          sessionId: sessionData.sessionId,
          sessionToken: sessionData.sessionToken,
        };
        setActiveConversationId(sessionData.sessionId);

        // Chargement de l'historique des discussions sauvegardées
        try {
          const storedHistory = await chatbotService.getConversationHistory();
          if (isSubscribed) setConversations(storedHistory);
        } catch {}

        if (Array.isArray(sessionData.messages) && sessionData.messages.length > 0) {
          const mapped: ChatbotMessage[] = sessionData.messages.map((m: any, idx: number) => {
            const timeStr = m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`;

            return {
              id: m.id || `session-msg-${idx}-${Date.now()}`,
              sender: m.sender || 'bot',
              text: m.text,
              time: timeStr,
              suggestions: m.suggestions,
              cards: m.metadata?.cards,
              planSteps: m.metadata?.planSteps,
            };
          });

          setMessages(mapped);

          // Récupère les suggestions réelles de la dernière réponse bot du backend
          if (Array.isArray(sessionData.suggestions) && sessionData.suggestions.length > 0) {
            setActiveSuggestions(sessionData.suggestions);
          } else {
            const lastBot = [...mapped].reverse().find((m) => m.sender === 'bot');
            if (lastBot?.suggestions && lastBot.suggestions.length > 0) {
              setActiveSuggestions(lastBot.suggestions);
            }
          }
        } else {
          // Si le backend n'a pas encore de messages, message d'accueil par défaut
          const now = new Date();
          const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
          setMessages([
            {
              id: 'welcome-init',
              sender: 'bot',
              text: t('chatbotWelcome'),
              time: timeStr,
            },
          ]);
          if (sessionData.suggestions && sessionData.suggestions.length > 0) {
            setActiveSuggestions(sessionData.suggestions);
          } else {
            setActiveSuggestions([
              'Gremda',
              'Chihia',
              'Sakiet Ezzit',
              'Centre-ville',
            ]);
          }
        }
      } catch {
        if (!isSubscribed) return;
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        setMessages([
          {
            id: 'welcome-fallback',
            sender: 'bot',
            text: t('chatbotWelcome'),
            time: timeStr,
          },
        ]);
        setActiveSuggestions([
          'Gremda',
          'Chihia',
          'Sakiet Ezzit',
          'Centre-ville',
        ]);
      } finally {
        if (isSubscribed) {
          setIsTyping(false);
          initialLoadDone.current = true;
        }
      }
    }

    loadBackendSession();

    return () => {
      isSubscribed = false;
    };
  }, [language, t, hasGps, location.city]);

  const sendMessage = useCallback(
    async (textToSend?: string) => {
      let rawText = (textToSend ?? inputVal).trim();
      if (!rawText || isTyping) return;

      // Détection de l'action rapide d'activation GPS
      const isGpsActionChip =
        rawText.includes('Activer position') ||
        rawText.includes('Khaddem GPS') ||
        rawText.includes('Enable GPS') ||
        rawText.includes('تفعيل الموقع');

      let currentHasGps = hasGps;
      if (isGpsActionChip) {
        setIsTyping(true);
        const granted = await requestGpsLocation();
        currentHasGps = granted;
        rawText = granted
          ? (language === 'ar' ? 'أماكن قريبة مني في صفاقس' : language === 'en' ? 'Near me in Sfax' : 'Sorties autour de moi à Sfax')
          : (language === 'ar' ? 'خروجات في صفاقس' : language === 'en' ? 'Outings in Sfax' : 'Sorties à Sfax');
      }

      const now = new Date();
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

      const userMsg: ChatbotMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: rawText,
        time: timeStr,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputVal('');
      setIsTyping(true);

      try {
        const reply = await chatbotService.sendMessage(rawText, {
          hasGps: currentHasGps,
          coords: location.coords,
          userCity: location.city || 'Sfax',
        });
        const replyNow = new Date();
        const replyTimeStr = `${replyNow.getHours()}:${String(replyNow.getMinutes()).padStart(2, '0')}`;

        const botMsg: ChatbotMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply.text,
          time: replyTimeStr,
          suggestions: reply.suggestions,
          cards: reply.metadata?.cards,
          planSteps: reply.metadata?.planSteps,
        };

        setMessages((prev) => {
          const nextMsgs = [...prev, botMsg];

          // Auto-sauvegarde de la conversation dans l'historique
          if (currentSessionRef.current) {
            chatbotService
              .saveDiscussionToHistory({
                sessionId: currentSessionRef.current.sessionId,
                sessionToken: currentSessionRef.current.sessionToken,
                messages: nextMsgs,
                suggestions: reply.suggestions || [],
              })
              .then(async () => {
                const fresh = await chatbotService.getConversationHistory();
                setConversations(fresh);
              })
              .catch(() => {});
          }

          return nextMsgs;
        });

        // Connexion directe des suggestions renvoyées par le backend
        if (Array.isArray(reply.suggestions) && reply.suggestions.length > 0) {
          setActiveSuggestions(reply.suggestions);
        }
      } catch {
        const errNow = new Date();
        const errTimeStr = `${errNow.getHours()}:${String(errNow.getMinutes()).padStart(2, '0')}`;

        const fallbackText =
          language === 'ar'
            ? 'سامحني، ثمة مشكل في الاتصال. عاود جرب مرة أخرى !'
            : language === 'en'
            ? 'Sorry, a connection issue occurred. Please try again!'
            : 'Désolé, une petite erreur de connexion est survenue. Peux-tu réessayer ?';

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: fallbackText,
            time: errTimeStr,
            isError: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputVal, isTyping, language, hasGps, location.city, location.coords, requestGpsLocation]
  );

  const resetChat = useCallback(async () => {
    setIsTyping(true);
    try {
      const newSession = await chatbotService.resetSession(language, {
        hasGps,
        userCity: location.city || 'Sfax',
      });
      currentSessionRef.current = {
        sessionId: newSession.sessionId,
        sessionToken: newSession.sessionToken,
      };
      setActiveConversationId(newSession.sessionId);

      if (Array.isArray(newSession.messages) && newSession.messages.length > 0) {
        const mapped: ChatbotMessage[] = newSession.messages.map((m: any, idx: number) => ({
          id: m.id || `session-msg-${idx}-${Date.now()}`,
          sender: m.sender || 'bot',
          text: m.text,
          time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
          suggestions: m.suggestions,
          cards: m.metadata?.cards,
        }));
        setMessages(mapped);
        if (Array.isArray(newSession.suggestions) && newSession.suggestions.length > 0) {
          setActiveSuggestions(newSession.suggestions);
        }
      } else {
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'bot',
            text: t('chatbotWelcome'),
            time: timeStr,
          },
        ]);
      }

      // Rafraîchir la liste de l'historique
      const fresh = await chatbotService.getConversationHistory();
      setConversations(fresh);
    } catch {
      const now = new Date();
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'bot',
          text: t('chatbotWelcome'),
          time: timeStr,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [language, t, hasGps, location.city]);

  const openHistory = useCallback(async () => {
    try {
      const list = await chatbotService.getConversationHistory();
      setConversations(list);
    } catch {}
    setHistoryVisible(true);
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryVisible(false);
  }, []);

  const startNewChat = useCallback(async () => {
    setHistoryVisible(false);
    await resetChat();
  }, [resetChat]);

  const resumeDiscussion = useCallback(async (item: ChatHistoryItem) => {
    try {
      setIsTyping(true);
      await chatbotService.resumeConversation(item);
      currentSessionRef.current = {
        sessionId: item.sessionId,
        sessionToken: item.sessionToken,
      };
      setActiveConversationId(item.sessionId);

      // Reconstitution propre des messages
      const mapped: ChatbotMessage[] = (item.messages || []).map((m: any, idx: number) => {
        const timeStr =
          m.time ||
          (m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`);
        return {
          id: m.id || `hist-msg-${idx}-${Date.now()}`,
          sender: m.sender || 'bot',
          text: m.text,
          time: timeStr,
          suggestions: m.suggestions,
          cards: m.cards || m.metadata?.cards,
          planSteps: m.planSteps || m.metadata?.planSteps,
        };
      });
      setMessages(mapped);

      if (Array.isArray(item.suggestions) && item.suggestions.length > 0) {
        setActiveSuggestions(item.suggestions);
      } else {
        const lastBot = [...mapped].reverse().find((m) => m.sender === 'bot');
        setActiveSuggestions(lastBot?.suggestions || []);
      }
    } catch (e) {
      console.warn('[useChatbot] Erreur reprise conversation:', e);
    } finally {
      setIsTyping(false);
      setHistoryVisible(false);
    }
  }, []);

  const deleteDiscussion = useCallback(
    async (idOrSessionId: string) => {
      const updated = await chatbotService.deleteConversation(idOrSessionId);
      setConversations(updated);
      if (
        activeConversationId === idOrSessionId ||
        currentSessionRef.current?.sessionId === idOrSessionId
      ) {
        await resetChat();
      }
    },
    [activeConversationId, resetChat]
  );

  const clearHistory = useCallback(async () => {
    await chatbotService.clearAllConversations();
    setConversations([]);
    setHistoryVisible(false);
    await resetChat();
  }, [resetChat]);

  return {
    messages,
    isTyping,
    inputVal,
    setInputVal,
    activeSuggestions,
    sendMessage,
    resetChat,
    historyVisible,
    conversations,
    activeConversationId,
    openHistory,
    closeHistory,
    startNewChat,
    resumeDiscussion,
    deleteDiscussion,
    clearHistory,
  };
}
