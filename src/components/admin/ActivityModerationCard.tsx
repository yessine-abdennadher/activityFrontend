import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminActivityItem } from '../../types';
import { ThemeColors } from '../../theme/theme';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getStatusBadge, getActivityFeatureBadge } from './adminBadges';

interface ActivityModerationCardProps {
  activity: AdminActivityItem;
  theme: ThemeColors;
  isRTL: boolean;
  labels: {
    approved: string;
    pending: string;
    suspend: string;
    validate: string;
    featured: string;
    popular: string;
    delete: string;
    createdBy: string;
  };
  onToggleApproval: (activity: AdminActivityItem) => void;
  onToggleFeatured: (activity: AdminActivityItem) => void;
  onTogglePopular: (activity: AdminActivityItem) => void;
  onDelete: (activity: AdminActivityItem) => void;
}

export const ActivityModerationCard: React.FC<ActivityModerationCardProps> = ({
  activity,
  theme,
  isRTL,
  labels,
  onToggleApproval,
  onToggleFeatured,
  onTogglePopular,
  onDelete,
}) => {
  const { isDark } = usePreferences();
  const statusCfg = getStatusBadge(activity.isApproved ? 'approved' : 'pending', isDark);
  const featuredCfg = getActivityFeatureBadge('featured', isDark);
  const popularCfg = getActivityFeatureBadge('popular', isDark);
  const deleteCfg = getActivityFeatureBadge('delete', isDark);

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={[styles.cardTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {activity.image ? (
          <Image source={{ uri: activity.image }} style={styles.thumbnail} accessibilityLabel={activity.name} />
        ) : (
          <View style={[styles.thumbnail, styles.imagePlaceholder, { backgroundColor: theme.pillBg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Ionicons name="image-outline" size={24} color={theme.textMuted} />
          </View>
        )}
        <View style={styles.info}>
          <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.name, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>{activity.name}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusCfg.backgroundColor,
                  borderColor: statusCfg.borderColor,
                  borderWidth: 1,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 4,
                },
              ]}
            >
              <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {activity.isApproved ? labels.approved : labels.pending}
              </Text>
            </View>
          </View>
          <Text style={[styles.detail, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {activity.city} · {activity.category} · {activity.price} DT
          </Text>
          {activity.createdBy && (
            <Text style={[styles.creator, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {labels.createdBy}: {activity.createdBy.name}{activity.createdBy.establishmentName ? ` (${activity.createdBy.establishmentName})` : ''}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: theme.cardBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Toggle Approval (Valider / Suspendre) */}
        <ActionButton
          label={activity.isApproved ? labels.suspend : labels.validate}
          icon={activity.isApproved ? 'close-circle-outline' : 'checkmark-circle-outline'}
          selected={activity.isApproved}
          activeColor={activity.isApproved ? statusCfg.color : theme.primary}
          activeBg={activity.isApproved ? statusCfg.backgroundColor : theme.pillBg}
          activeBorder={activity.isApproved ? statusCfg.borderColor : theme.cardBorder}
          theme={theme}
          onPress={() => onToggleApproval(activity)}
          accessibilityLabel={`${activity.isApproved ? labels.suspend : labels.validate}: ${activity.name}`}
        />

        {/* À la une (Featured - Doré / Ambre) */}
        <ActionButton
          label={labels.featured}
          icon={activity.isFeatured ? 'star' : 'star-outline'}
          selected={Boolean(activity.isFeatured)}
          activeColor={featuredCfg.color}
          activeBg={featuredCfg.backgroundColor}
          activeBorder={featuredCfg.borderColor}
          theme={theme}
          onPress={() => onToggleFeatured(activity)}
          accessibilityLabel={`${labels.featured}: ${activity.name}`}
        />

        {/* Populaire / Hot Game (Flamme - Corail / Rose chaud) */}
        <ActionButton
          label={labels.popular}
          icon={activity.isPopular ? 'flame' : 'flame-outline'}
          selected={Boolean(activity.isPopular)}
          activeColor={popularCfg.color}
          activeBg={popularCfg.backgroundColor}
          activeBorder={popularCfg.borderColor}
          theme={theme}
          onPress={() => onTogglePopular(activity)}
          accessibilityLabel={`${labels.popular}: ${activity.name}`}
        />

        {/* Supprimer (Danger Rouge) */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            {
              borderColor: deleteCfg.borderColor,
              backgroundColor: deleteCfg.backgroundColor,
            },
          ]}
          onPress={() => onDelete(activity)}
          accessibilityRole="button"
          accessibilityLabel={`${labels.delete}: ${activity.name}`}
        >
          <Ionicons name="trash-outline" size={16} color={deleteCfg.color} />
          <Text style={[styles.actionLabel, { color: deleteCfg.color }]}>{labels.delete}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ActionButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  selected: boolean;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  theme: ThemeColors;
  onPress: () => void;
  accessibilityLabel: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  selected,
  activeColor,
  activeBg,
  activeBorder,
  theme,
  onPress,
  accessibilityLabel,
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: selected ? activeBg : theme.pillBg,
        borderColor: selected ? activeBorder : theme.cardBorder,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected }}
  >
    <Ionicons name={icon} size={16} color={selected ? activeColor : theme.textMuted} />
    <Text style={[styles.actionLabel, { color: selected ? activeColor : theme.textMuted }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  cardTop: { padding: 12, gap: 12, alignItems: 'center' },
  thumbnail: { width: 64, height: 64, borderRadius: 12 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  name: { fontSize: 14, fontWeight: '800', flexShrink: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  detail: { fontSize: 12 },
  creator: { fontSize: 12, fontWeight: '600' },
  actions: { borderTopWidth: 1, padding: 8, gap: 8, flexWrap: 'wrap', alignItems: 'stretch' },
  actionButton: { minHeight: 44, minWidth: 44, flexGrow: 1, flexBasis: 110, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderRadius: 10 },
  deleteButton: { flexGrow: 0, flexBasis: 'auto' },
  actionLabel: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
});
