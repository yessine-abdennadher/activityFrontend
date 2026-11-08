/**
 * ChatbotCardsCarousel.tsx
 * Carrousel horizontal fluide pour les cartes de sorties recommandées par l'IA.
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { usePreferences } from '../../../context/AppPreferencesContext';
import { ChatbotRecommendationCard } from './ChatbotRecommendationCard';
import type { ChatCardItem } from '../types/chatbot.types';

interface ChatbotCardsCarouselProps {
  cards: ChatCardItem[];
  onSelectActivityId?: (id: string) => void;
}

export const ChatbotCardsCarousel: React.FC<ChatbotCardsCarouselProps> = ({
  cards,
  onSelectActivityId,
}) => {
  if (!Array.isArray(cards) || cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.content}
      >
        {cards.map((card) => (
          <ChatbotRecommendationCard
            key={`card-item-${card.id}`}
            card={card}
            onPress={onSelectActivityId}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: -16,
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 4,
  },
});

