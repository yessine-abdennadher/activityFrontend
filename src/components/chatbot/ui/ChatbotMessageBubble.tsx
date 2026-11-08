/**
 * ChatbotMessageBubble.tsx
 * Composant de bulle de message adaptatif pour l'utilisateur et l'assistant.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../../context/AppPreferencesContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { ChatbotCardsCarousel } from '../cards/ChatbotCardsCarousel';
import { ChatbotOutingPlanCard } from '../cards/ChatbotOutingPlanCard';
import { KharjaBotOrb } from './KharjaBotOrb';
import type { ChatbotMessage } from '../types/chatbot.types';

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage;
  onSelectActivityId?: (id: string) => void;
  onNavigateToHome?: () => void;
}

export const ChatbotMessageBubble: React.FC<ChatbotMessageBubbleProps> = ({
  message,
  onSelectActivityId,
  onNavigateToHome,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';
  const isUser = message.sender === 'user';

  const hasCards = Boolean(message.cards && message.cards.length > 0);
  const hasPlan = Boolean(message.planSteps && message.planSteps.length > 0);

  // Si des cartes interactives ou un plan sont affichés, on retire la liste brute textuelle
  // ("1. Nom ... (4/5)") pour ne conserver que la phrase d'intro ou le message explicatif.
  const displayText = React.useMemo(() => {
    if ((!hasCards && !hasPlan) || !message.text) return message.text;
    const cleanLines = message.text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => !/^(\d+|[\u0660-\u0669]+)[\.\-]\s+/.test(l));
    const result = cleanLines.join('\n').trim();
    return result || message.text;
  }, [message.text, hasCards, hasPlan]);

  return (
    <View style={styles.outerContainer}>
      {/* ── Ligne de la bulle de message (Avatar + Bulle texte) ── */}
      <View
        style={[
          styles.row,
          {
            justifyContent: isUser
              ? isRTL ? 'flex-start' : 'flex-end'
              : isRTL ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {/* Avatar IA : Orbe 3D holographique Tfarhida */}
        {!isUser && (
          <View style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, alignSelf: 'flex-start', marginTop: 2 }}>
            <KharjaBotOrb size={26} animated={false} />
          </View>
        )}

        {/* Bulle de texte contrainte */}
        <View style={styles.bubbleWrapper}>
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.userBubble, { backgroundColor: theme.primary }]
                : [
                    styles.botBubble,
                    {
                      backgroundColor: message.isError
                        ? isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'
                        : theme.cardBg,
                      borderColor: message.isError
                        ? isDark ? 'rgba(239, 68, 68, 0.35)' : '#FCA5A5'
                        : theme.cardBorder,
                    },
                  ],
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isUser
                    ? '#FFFFFF'
                    : message.isError
                    ? isDark ? '#FCA5A5' : '#DC2626'
                    : theme.textMain,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {displayText}
            </Text>

            {/* Action optionnelle explorer */}
            {message.showExploreAction && onNavigateToHome && (
              <TouchableOpacity
                style={[styles.actionCta, { backgroundColor: theme.primary }]}
                onPress={onNavigateToHome}
                activeOpacity={0.85}
              >
                <Ionicons name="compass-outline" size={15} color="#FFFFFF" />
                <Text style={styles.actionCtaText}>{t('chatbotExploreTrendingBtn')}</Text>
              </TouchableOpacity>
            )}

            <Text
              style={[
                styles.time,
                {
                  color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}
            >
              {message.time}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Carrousel de cartes de recommandations — Pleine largeur pour défilement fluide ── */}
      {hasCards && (
        <View style={styles.carouselWrapper}>
          <ChatbotCardsCarousel
            cards={message.cards!}
            onSelectActivityId={onSelectActivityId}
          />
        </View>
      )}

      {/* ── Plan de sortie chronologique multi-étapes ── */}
      {hasPlan && (
        <View style={styles.planWrapper}>
          <ChatbotOutingPlanCard
            steps={message.planSteps!}
            onSelectActivityId={onSelectActivityId}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubbleWrapper: {
    maxWidth: '85%',
  },
  carouselWrapper: {
    width: '100%',
    marginTop: 6,
  },
  planWrapper: {
    width: '100%',
    marginTop: 6,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
  },
  botBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  time: {
    fontSize: 10,
    marginTop: 5,
  },
  actionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  actionCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

