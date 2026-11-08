import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { chatbotService } from '../services/chatbotService';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

export default function ChatbotScreen() {
  const { isDark, theme } = usePreferences();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', text: t('subtitle') },
  ]);

  const quickActions = [
    { label: t('chatbotIdeaNearMe'), icon: 'location-outline' as const },
    { label: t('chatbotBudgetIdea'), icon: 'wallet-outline' as const },
    { label: t('chatbotGroupIdea'), icon: 'people-outline' as const },
  ];

  const sendMessage = async (text = input) => {
    const cleanText = text.trim();
    if (!cleanText || isTyping) return;
    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, sender: 'user', text: cleanText },
    ]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await chatbotService.sendMessage(cleanText);
      setMessages(current => [
        ...current,
        { id: `bot-${Date.now()}`, sender: 'bot', text: reply.text },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        { id: `bot-${Date.now()}`, sender: 'bot', text: t('chatbotBotReply') },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{t('assistant')}</Text>
          <Text style={styles.status}>{t('online')}</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Options du chatbot" style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <Text style={[styles.dateLabel, { color: theme.textMuted }]}>{t('today')}</Text>
        {messages.map(message => (
          <View key={message.id} style={[styles.messageRow, message.sender === 'user' && styles.userRow]}>
            {message.sender === 'bot' && (
              <View style={[styles.smallAvatar, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="sparkles" size={16} color={theme.primary} />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                message.sender === 'user'
                  ? [styles.userBubble, { backgroundColor: theme.primary }]
                  : [styles.botBubble, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userText : { color: theme.textMain },
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}
        <Text style={[styles.prompt, { color: theme.textMuted }]}>{t('suggestions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.label}
              onPress={() => sendMessage(action.label)}
              style={[styles.quickAction, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            >
              <Ionicons name={action.icon} size={18} color={theme.primary} />
              <Text style={[styles.quickText, { color: theme.primary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={[styles.composer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          placeholder={t('typeMessage')}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.textMain }]}
        />
        <TouchableOpacity
          accessibilityLabel={t('send')}
          onPress={() => sendMessage()}
          style={[styles.send, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  status: { color: '#E0F2FE', fontSize: 12, marginTop: 3 },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: 18, paddingBottom: 28 },
  dateLabel: { textAlign: 'center', fontSize: 12, marginBottom: 18 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, maxWidth: '88%' },
  userRow: { alignSelf: 'flex-end' },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bubble: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  botBubble: { borderBottomLeftRadius: 5, borderWidth: 1 },
  userBubble: { borderBottomRightRadius: 5 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  prompt: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 10 },
  quickActions: { gap: 8, paddingBottom: 8 },
  quickAction: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickText: { fontSize: 12, fontWeight: '700' },
  composer: {
    margin: 14,
    padding: 6,
    paddingLeft: 16,
    borderWidth: 1,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  input: { flex: 1, fontSize: 14, minHeight: 42 },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
