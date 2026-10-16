import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { useTranslation } from '../../hooks/useTranslation';

interface NotificationHeaderProps {
  title: string;
  subtitle: string;
  unreadCount: number;
  theme: ThemeColors;
  isDark: boolean;
  onMarkAllRead: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  title,
  subtitle,
  unreadCount,
  theme,
  isDark,
  onMarkAllRead,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.title, { color: theme.textMain }]}>{title}</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadgePill, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadBadgePillText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={onMarkAllRead}
          style={[
            styles.markAllBtn,
            {
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#E0F2FE',
              borderColor: theme.cardBorder,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-done" size={16} color={theme.primary} />
          <Text style={[styles.markAllText, { color: theme.primary }]}>
            {t('markAllRead')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  unreadBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unreadBadgePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
