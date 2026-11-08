/**
 * ChatbotMessageList.tsx
 * Zone de défilement des messages et de l'indicateur d'écriture.
 */

import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ChatbotMessageBubble } from './ChatbotMessageBubble';
import { ChatbotTypingIndicator } from './ChatbotTypingIndicator';
import type { ChatbotMessage } from '../types/chatbot.types';

interface ChatbotMessageListProps {
  messages: ChatbotMessage[];
  isTyping: boolean;
  scrollViewRef: React.RefObject<any>;
  onSelectActivityId?: (id: string) => void;
  onNavigateToHome?: () => void;
}

export const ChatbotMessageList: React.FC<ChatbotMessageListProps> = ({
  messages,
  isTyping,
  scrollViewRef,
  onSelectActivityId,
  onNavigateToHome,
}) => {
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) => (
        <ChatbotMessageBubble
          key={msg.id}
          message={msg}
          onSelectActivityId={onSelectActivityId}
          onNavigateToHome={onNavigateToHome}
        />
      ))}

      {isTyping && <ChatbotTypingIndicator />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
});

