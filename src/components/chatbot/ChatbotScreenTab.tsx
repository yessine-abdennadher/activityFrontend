/**
 * ChatbotScreenTab.tsx
 * Conteneur maître et orchestrateur pour l'écran de discussion KharjaBot IA style Gemini.
 */

import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useChatbot } from './hooks/useChatbot';
import { ChatbotHeader } from './ui/ChatbotHeader';
import { ChatbotMessageList } from './ui/ChatbotMessageList';
import { ChatbotSuggestionChips } from './ui/ChatbotSuggestionChips';
import { ChatbotInputBar } from './ui/ChatbotInputBar';
import { ChatHistoryModal } from './ui/ChatHistoryModal';
import type { KharjaBotOrbState } from './ui/KharjaBotOrb';
import type { ChatbotScreenProps } from './types/chatbot.types';

export const ChatbotScreenTab: React.FC<ChatbotScreenProps> = ({
  onNavigateToHome,
  onSelectActivityId,
}) => {
  const { theme } = usePreferences();
  const {
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
  } = useChatbot();

  const scrollViewRef = useRef<any>(null);
  const [orbState, setOrbState] = useState<KharjaBotOrbState>('idle');

  // Animation réactive : 'thinking' si KharjaBot écrit, 'idle' si l'écran est ouvert et l'utilisateur n'écrit pas
  useEffect(() => {
    if (isTyping) {
      setOrbState('thinking');
      return;
    }

    setOrbState('default');
    const idleTimer = setTimeout(() => {
      setOrbState('idle');
    }, 2800);

    return () => clearTimeout(idleTimer);
  }, [isTyping, inputVal]);

  // Défilement automatique vers le bas à chaque nouveau message ou frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages.length, isTyping]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── En-tête épuré avec orbe réactif (thinking / idle) ── */}
      <ChatbotHeader
        onBack={onNavigateToHome}
        onReset={resetChat}
        onOpenHistory={openHistory}
        onNewChat={startNewChat}
        orbState={orbState}
        isTyping={isTyping}
      />

      {/* ── Zone de Messages & Cartes ── */}
      <ChatbotMessageList
        messages={messages}
        isTyping={isTyping}
        scrollViewRef={scrollViewRef}
        onSelectActivityId={onSelectActivityId}
        onNavigateToHome={onNavigateToHome}
      />

      {/* ── Suggestions Rapides (Chips Cliquables) ── */}
      <ChatbotSuggestionChips
        suggestions={activeSuggestions}
        onSelectSuggestion={(sug) => sendMessage(sug)}
      />

      {/* ── Barre de Saisie Inférieure ── */}
      <ChatbotInputBar
        value={inputVal}
        onChangeText={setInputVal}
        onSend={() => sendMessage()}
        disabled={isTyping}
      />

      {/* ── Tiroir / Modal d'Historique des Discussions (ScrollableModal) ── */}
      <ChatHistoryModal
        visible={historyVisible}
        onClose={closeHistory}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={resumeDiscussion}
        onNewChat={startNewChat}
        onDeleteConversation={deleteDiscussion}
        onClearAll={clearHistory}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatbotScreenTab;
