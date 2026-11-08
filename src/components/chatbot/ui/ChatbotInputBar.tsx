/**
 * ChatbotInputBar.tsx
 * Barre de saisie inférieure optimisée avec support multilingue et RTL.
 */

import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../../context/AppPreferencesContext';
import { useTranslation } from '../../../hooks/useTranslation';

interface ChatbotInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const ChatbotInputBar: React.FC<ChatbotInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  disabled = false,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const canSend = Boolean(value.trim()) && !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBg,
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.textMain,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('chatbotInputPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          returnKeyType="send"
          editable={!disabled}
          multiline={false}
          accessibilityLabel="Message à envoyer"
        />
      </View>

      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? theme.primary : isDark ? '#334155' : '#CBD5E1',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Envoyer le message"
        activeOpacity={0.8}
      >
        <Ionicons
          name={isRTL ? 'arrow-back' : 'arrow-up'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
});

