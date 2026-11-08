/**
 * ChatHistoryModal.tsx
 * Modal d'historique des discussions KharjaBot au design Gemini épuré.
 *
 * Utilise strictement ScrollableModal (conforme aux directives du projet).
 * 100% vectoriel avec Ionicons (zéro emoji), support RTL fluide.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../../context/AppPreferencesContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { ScrollableModal } from '../../ui/ScrollableModal';
import type { ChatHistoryItem } from '../types/chatbot.types';

interface ChatHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  conversations: ChatHistoryItem[];
  activeConversationId: string | null;
  onSelectConversation: (item: ChatHistoryItem) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  visible,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'ar' ? 'الآن' : 'À l’instant';
    if (minutes < 60) return language === 'ar' ? `منذ ${minutes} د` : `${minutes} min`;
    if (hours < 24) return language === 'ar' ? `منذ ${hours} س` : `${hours} h`;
    if (days === 1) return language === 'ar' ? 'أمس' : 'Hier';
    return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleConfirmDelete = (item: ChatHistoryItem) => {
    Alert.alert(
      t('chatbotDeleteDiscussion'),
      t('chatbotConfirmDeleteMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('chatbotDeleteDiscussion'),
          style: 'destructive',
          onPress: () => onDeleteConversation(item.id || item.sessionId),
        },
      ]
    );
  };

  const handleConfirmClearAll = () => {
    Alert.alert(
      t('chatbotConfirmClearTitle'),
      t('chatbotConfirmClearMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('chatbotClearHistory'),
          style: 'destructive',
          onPress: onClearAll,
        },
      ]
    );
  };

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title={t('chatbotHistoryTitle')}
      subtitle={t('chatbotHistorySubtitle')}
      height="82%"
    >
      <View style={styles.content}>
        {/* Bouton Nouvelle Discussion style Gemini */}
        <TouchableOpacity
          onPress={onNewChat}
          activeOpacity={0.85}
          style={styles.newChatButtonContainer}
          accessibilityRole="button"
          accessibilityLabel={t('chatbotNewChat')}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.newChatGradient,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.newChatIconCircle}>
              <Ionicons name="add" size={20} color="#6366F1" />
            </View>
            <Text style={styles.newChatText}>{t('chatbotNewChat')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Liste des discussions ou état vide */}
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(99, 102, 241, 0.12)'
                    : 'rgba(99, 102, 241, 0.08)',
                },
              ]}
            >
              <Ionicons name="chatbubbles-outline" size={40} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
              {t('chatbotHistoryEmpty')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {t('chatbotHistoryEmptySub')}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {conversations.map((item) => {
              const isActive =
                item.sessionId === activeConversationId || item.id === activeConversationId;

              return (
                <TouchableOpacity
                  key={item.id || item.sessionId}
                  onPress={() => onSelectConversation(item)}
                  activeOpacity={0.7}
                  style={[
                    styles.historyItemCard,
                    {
                      backgroundColor: isActive
                        ? isDark
                          ? 'rgba(99, 102, 241, 0.16)'
                          : 'rgba(99, 102, 241, 0.08)'
                        : theme.cardBg,
                      borderColor: isActive
                        ? '#6366F1'
                        : theme.cardBorder,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  {/* Icône bulle */}
                  <View
                    style={[
                      styles.itemIconCircle,
                      {
                        backgroundColor: isActive
                          ? '#6366F1'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name={isActive ? 'chatbubble-ellipses' : 'chatbubble-outline'}
                      size={18}
                      color={isActive ? '#FFFFFF' : theme.textMuted}
                    />
                  </View>

                  {/* Contenu textuel */}
                  <View
                    style={[
                      styles.itemTextCol,
                      { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemTitleRow,
                        { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color: isActive ? '#6366F1' : theme.textMain,
                            fontWeight: isActive ? '700' : '600',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.title || 'Discussion KharjaBot'}
                      </Text>

                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>
                            {t('chatbotActiveChat')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.preview ? (
                      <Text
                        style={[styles.itemPreview, { color: theme.textMuted }]}
                        numberOfLines={2}
                      >
                        {item.preview}
                      </Text>
                    ) : null}

                    <View
                      style={[
                        styles.itemFooterRow,
                        { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      ]}
                    >
                      <Text style={[styles.itemTime, { color: theme.textMuted }]}>
                        {formatRelativeTime(item.updatedAt || item.createdAt)}
                      </Text>
                      {item.messageCount ? (
                        <Text style={[styles.itemCount, { color: theme.textMuted }]}>
                          · {item.messageCount} msg
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Bouton supprimer */}
                  <TouchableOpacity
                    onPress={() => handleConfirmDelete(item)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('chatbotDeleteDiscussion')}
                  >
                    <Ionicons name="trash-outline" size={17} color={theme.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* Bouton pour tout effacer */}
            <TouchableOpacity
              onPress={handleConfirmClearAll}
              activeOpacity={0.7}
              style={[
                styles.clearAllButton,
                {
                  borderColor: theme.cardBorder,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('chatbotClearHistory')}
            >
              <Ionicons name="trash-bin-outline" size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>{t('chatbotClearHistory')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  newChatButtonContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  newChatGradient: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  newChatIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  listContainer: {
    gap: 10,
  },
  historyItemCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitleRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 14,
    flexShrink: 1,
  },
  activeBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  itemPreview: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  itemFooterRow: {
    alignItems: 'center',
    gap: 4,
  },
  itemTime: {
    fontSize: 11,
  },
  itemCount: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
  },
  clearAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  clearAllText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});

