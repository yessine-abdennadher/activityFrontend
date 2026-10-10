import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

const QUICK_ACTIONS = [
  { label: 'Idées près de moi', icon: 'location-outline' as const },
  { label: 'Activité à petit budget', icon: 'wallet-outline' as const },
  { label: 'Sortie en groupe', icon: 'people-outline' as const },
];

export default function ChatbotScreen() {
  const { isDark } = useAppPreferences();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', text: t('subtitle') },
  ]);

  const sendMessage = (text = input) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, sender: 'user', text: cleanText },
      { id: `bot-${Date.now()}`, sender: 'bot', text: 'Très bien ! Je cherche des idées qui correspondent à ta demande.' },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, isDark && styles.darkScreen]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.botAvatar}><Ionicons name="chatbubbles" size={24} color="#FFFFFF" /></View>
        <View style={styles.headerCopy}><Text style={styles.title}>{t('assistant')}</Text><Text style={styles.status}>{t('online')}</Text></View>
        <TouchableOpacity accessibilityLabel="Options du chatbot" style={styles.headerButton}><Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateLabel}>{t('today')}</Text>
        {messages.map(message => (
          <View key={message.id} style={[styles.messageRow, message.sender === 'user' && styles.userRow]}>
            {message.sender === 'bot' && <View style={styles.smallAvatar}><Ionicons name="sparkles" size={16} color="#C026D3" /></View>}
            <View style={[styles.bubble, message.sender === 'user' ? styles.userBubble : [styles.botBubble, isDark && styles.darkSurface]]}>
              <Text style={[styles.messageText, message.sender === 'user' ? styles.userText : isDark && styles.darkText]}>{message.text}</Text>
            </View>
          </View>
        ))}
        <Text style={[styles.prompt, isDark && styles.darkText]}>{t('suggestions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {QUICK_ACTIONS.map(action => <TouchableOpacity key={action.label} onPress={() => sendMessage(action.label)} style={styles.quickAction}><Ionicons name={action.icon} size={18} color="#C026D3" /><Text style={styles.quickText}>{action.label}</Text></TouchableOpacity>)}
        </ScrollView>
      </ScrollView>

      <View style={[styles.composer, isDark && styles.darkSurface]}><TextInput value={input} onChangeText={setInput} onSubmitEditing={() => sendMessage()} returnKeyType="send" placeholder={t('typeMessage')} placeholderTextColor="#94A3B8" style={[styles.input, isDark && styles.darkText]} /><TouchableOpacity accessibilityLabel={t('send')} onPress={() => sendMessage()} style={styles.send}><Ionicons name="arrow-up" size={22} color="#FFFFFF" /></TouchableOpacity></View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  screen: { flex: 1, backgroundColor: '#F8F7FC' },
  darkScreen: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#C026D3', flexDirection: 'row' as const, alignItems: 'center' as const, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  botAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' as const, justifyContent: 'center' as const },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' as const },
  status: { color: '#FCE7F3', fontSize: 12, marginTop: 3 },
  headerButton: { width: 44, height: 44, alignItems: 'center' as const, justifyContent: 'center' as const },
  messages: { padding: 18, paddingBottom: 28 },
  dateLabel: { textAlign: 'center' as const, color: '#94A3B8', fontSize: 12, marginBottom: 18 },
  messageRow: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, marginBottom: 14, maxWidth: '88%' as const },
  userRow: { alignSelf: 'flex-end' as const },
  smallAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3E8FF', alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 8 },
  bubble: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  botBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E9D5FF' },
  darkSurface: { backgroundColor: '#1F2937', borderColor: '#374151' },
  userBubble: { backgroundColor: '#C026D3', borderBottomRightRadius: 5 },
  messageText: { color: '#334155', fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  darkText: { color: '#F8FAFC' },
  prompt: { color: '#64748B', fontSize: 13, fontWeight: '700' as const, marginTop: 10, marginBottom: 10 },
  quickActions: { gap: 8, paddingBottom: 8 },
  quickAction: { backgroundColor: '#FFFFFF', borderColor: '#E9D5FF', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  quickText: { color: '#7E22CE', fontSize: 12, fontWeight: '700' as const },
  composer: { margin: 14, padding: 6, paddingLeft: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 28, flexDirection: 'row' as const, alignItems: 'center' as const, elevation: 3 },
  input: { flex: 1, color: '#1E1B4B', fontSize: 14, minHeight: 42 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#C026D3', alignItems: 'center' as const, justifyContent: 'center' as const },
};
