import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { useTranslation } from '../../hooks/useTranslation';

interface NotificationEmptyStateProps {
  theme: ThemeColors;
  isDark: boolean;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
  theme,
  isDark,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF' },
        ]}
      >
        <Ionicons name="notifications-off-outline" size={38} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.textMain }]}>
        {t('noNotifications')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        {t('noNotificationsSubtitle')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 30,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
