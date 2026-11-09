import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';

export type AdminDashboardTab = 'kpi' | 'activities' | 'reviews' | 'partners' | 'users' | 'diagnostics';

interface AdminDashboardTabsProps {
  activeTab: AdminDashboardTab;
  onSelectTab: (tab: AdminDashboardTab) => void;
  theme: ThemeColors;
  isRTL: boolean;
  labels: Record<AdminDashboardTab, string>;
}

const TABS: Array<{ id: AdminDashboardTab; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { id: 'kpi', icon: 'bar-chart-outline' },
  { id: 'activities', icon: 'checkmark-done-circle-outline' },
  { id: 'reviews', icon: 'chatbubbles-outline' },
  { id: 'partners', icon: 'business-outline' },
  { id: 'users', icon: 'people-outline' },
  { id: 'diagnostics', icon: 'pulse-outline' },
];

export const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({ activeTab, onSelectTab, theme, isRTL, labels }) => (
  <View style={[styles.wrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={[styles.tabBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      accessibilityRole="tablist"
    >
      {TABS.map(({ id, icon }) => {
        const selected = activeTab === id;
        return (
          <TouchableOpacity
            key={id}
            style={[styles.tabItem, { backgroundColor: selected ? theme.primary : 'transparent' }]}
            onPress={() => onSelectTab(id)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel={labels[id]}
            accessibilityState={{ selected }}
          >
            <Ionicons name={icon} size={18} color={selected ? theme.cardBg : theme.textMuted} />
            <Text
              numberOfLines={1}
              style={[
                styles.tabText,
                { color: selected ? theme.cardBg : theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {labels[id]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    minHeight: 54,
    maxHeight: 54,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
    height: 52,
  },
  tabBar: {
    alignItems: 'center',
    paddingHorizontal: 5,
    gap: 6,
  },
  tabItem: {
    minWidth: 110,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
