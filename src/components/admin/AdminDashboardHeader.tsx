import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';

interface AdminDashboardHeaderProps {
  administratorName: string;
  theme: ThemeColors;
  isRTL: boolean;
  title: string;
  administratorLabel: string;
  backLabel: string;
  refreshLabel: string;
  onBack: () => void;
  onRefresh: () => void;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
  administratorName,
  theme,
  isRTL,
  title,
  administratorLabel,
  backLabel,
  refreshLabel,
  onBack,
  onRefresh,
}) => (
  <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
    <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: theme.pillBg }]}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={theme.textMain} />
      </TouchableOpacity>
      <View style={styles.heading}>
        <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
          <View style={[styles.adminBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={12} color={theme.cardBg} />
            <Text style={[styles.adminBadgeText, { color: theme.cardBg }]}>RBAC</Text>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
          {administratorName || administratorLabel} · Tfarhida
        </Text>
      </View>
    </View>
    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: theme.pillBg }]}
      onPress={onRefresh}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={refreshLabel}
    >
      <Ionicons name="refresh" size={18} color={theme.primary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerLeft: { flex: 1, alignItems: 'center', gap: 12 },
  heading: { flex: 1 },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  headerTitle: { fontSize: 18, fontWeight: '800', flexShrink: 1 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  adminBadgeText: { fontSize: 10, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
});
