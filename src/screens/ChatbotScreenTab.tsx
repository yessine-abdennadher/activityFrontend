/**
 * ChatbotScreenTab.tsx
 * Écran de discussion complet et interactif pour "KharjaBot IA".
 *
 * Fonctionnalités :
 * - En-tête statut "En ligne 🟢" avec avatar de KharjaBot
 * - Message d'accueil chaleureux avec suggestions rapides (Chips cliquables)
 * - Animation d'indicateur de frappe réaliste (3 points animés)
 * - Réponse de teasing conviviale en Derja / Français avec bouton d'action vers l'accueil
 * - Saisie de message avec gestion fluide du clavier (KeyboardAvoidingView)
 * - Support complet Thème Sombre & Thème Clair, Palettes de couleurs
 * - Support multilingue (FR, AR, EN) avec compatibilité RTL (Arabe)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  showExploreAction?: boolean;
}

interface ChatbotScreenTabProps {
  onNavigateToHome?: () => void;
}

export const ChatbotScreenTab: React.FC<ChatbotScreenTabProps> = ({
  onNavigateToHome,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Animations pour les 3 points indicateurs de frappe
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Initialisation du premier message d'accueil
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages([
      {
        id: 'welcome-1',
        sender: 'bot',
        text: t('chatbotWelcome'),
        time: timeStr,
      },
    ]);
  }, [language]);

  // Boucle d'animation des 3 points "En train d'écrire..."
  useEffect(() => {
    if (!isTyping) return;

    const animateDot = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -5,
            duration: 320,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const a1 = animateDot(dot1Anim, 0);
    const a2 = animateDot(dot2Anim, 160);
    const a3 = animateDot(dot3Anim, 320);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    };
  }, [isTyping, dot1Anim, dot2Anim, dot3Anim]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = (textToSend?: string) => {
    const rawText = (textToSend ?? inputVal).trim();
    if (!rawText || isTyping) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawText,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    scrollToBottom();

    // Simulation de la réponse chaleureuse après 1.2 seconde de "réflexion"
    setTimeout(() => {
      const botReply: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: t('chatbotTeaserReply'),
        time: timeStr,
        showExploreAction: true,
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
      scrollToBottom();
    }, 1200);
  };

  const handleResetChat = () => {
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
  };

  const suggestions = [
    t('chatbotSuggestResto'),
    t('chatbotSuggestCafe'),
    t('chatbotSuggestBudget'),
    t('chatbotSuggestFamily'),
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── En-tête du Chatbot ── */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {/* Avatar avec badge En ligne */}
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.onlineBadge} />
          </View>

          {/* Titre & Statut */}
          <View style={[styles.headerInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.headerTitle, { color: theme.textMain }]}>
                {t('chatbotTitle')}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5' }]}>
                <Text style={styles.statusPillText}>{t('chatbotOnlineStatus')}</Text>
              </View>
            </View>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              {t('chatbotSubtitle')}
            </Text>
          </View>
        </View>

        {/* Bouton Réinitialiser la discussion */}
        <TouchableOpacity
          onPress={handleResetChat}
          style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}
          accessibilityRole="button"
          accessibilityLabel="Effacer la conversation"
        >
          <Ionicons name="refresh-outline" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Zone de Messages ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                {
                  justifyContent: isUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
                },
              ]}
            >
              {!isUser && (
                <View style={[styles.botSmallAvatar, { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}>
                  <Ionicons name="sparkles" size={12} color="#818CF8" />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [
                        styles.botBubble,
                        {
                          backgroundColor: theme.cardBg,
                          borderColor: theme.cardBorder,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: isUser ? '#FFFFFF' : theme.textMain,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Bouton d'action dans la réponse du bot */}
                {msg.showExploreAction && onNavigateToHome && (
                  <TouchableOpacity
                    style={[styles.actionCtaButton, { backgroundColor: theme.primary }]}
                    onPress={onNavigateToHome}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="flame" size={15} color="#FFFFFF" />
                    <Text style={styles.actionCtaButtonText}>
                      {t('chatbotExploreTrendingBtn')}
                    </Text>
                  </TouchableOpacity>
                )}

                <Text
                  style={[
                    styles.messageTime,
                    {
                      color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                      textAlign: isRTL ? 'left' : 'right',
                    },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Indicateur d'écriture */}
        {isTyping && (
          <View
            style={[
              styles.messageRow,
              {
                justifyContent: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <View style={[styles.botSmallAvatar, { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}>
              <Ionicons name="sparkles" size={12} color="#818CF8" />
            </View>

            <View style={[styles.typingBubble, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Animated.View style={[styles.typingDot, { backgroundColor: theme.primary, transform: [{ translateY: dot1Anim }] }]} />
              <Animated.View style={[styles.typingDot, { backgroundColor: theme.primary, transform: [{ translateY: dot2Anim }] }]} />
              <Animated.View style={[styles.typingDot, { backgroundColor: theme.primary, transform: [{ translateY: dot3Anim }] }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Suggestions Rapides (Chips Cliquables) ── */}
      <View style={styles.suggestionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.suggestionsContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          {suggestions.map((sug, idx) => (
            <TouchableOpacity
              key={`sug-${idx}`}
              style={[
                styles.suggestionChip,
                {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                  borderColor: theme.cardBorder,
                },
              ]}
              onPress={() => handleSend(sug)}
              activeOpacity={0.8}
            >
              <Text style={[styles.suggestionChipText, { color: theme.textMain }]}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Barre de Saisie Inférieure ── */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.textMain,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('chatbotInputPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!inputVal.trim() || isTyping}
          style={[
            styles.sendButton,
            {
              backgroundColor: inputVal.trim() && !isTyping ? theme.primary : (isDark ? '#334155' : '#CBD5E1'),
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
        >
          <Ionicons
            name={isRTL ? 'arrow-back' : 'arrow-up'}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  botSmallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '82%',
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
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 5,
  },
  actionCtaButton: {
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
  actionCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  suggestionsWrapper: {
    paddingVertical: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 10,
    marginBottom: 80, // Laisse la place pour la FloatingTabBar
  },
  textInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatbotScreenTab;
