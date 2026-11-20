import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import type { PartnerActivityItem } from '../../../types';

interface PartnerVenuePickerBannerProps {
  activities: PartnerActivityItem[];
  targetActivity: PartnerActivityItem | null;
  overlineLabel?: string;
  accentColor?: string;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  theme: ThemeColors;
  isDark: boolean;
  onSelectActivity?: (activity: PartnerActivityItem) => void;
}

/**
 * Composant réutilisable de sélection et d'affichage de l'établissement cible
 * dans les modales Partenaire (Promotions, Événements, Fidélité).
 */
export const PartnerVenuePickerBanner: React.FC<PartnerVenuePickerBannerProps> = ({
  activities,
  targetActivity,
  overlineLabel = 'Établissement ciblé :',
  accentColor = '#4F46E5',
  fallbackIcon = 'restaurant',
  theme,
  isDark,
  onSelectActivity,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const venueImg = targetActivity?.imageUrl || targetActivity?.image;
  const canSwitch = activities.length > 1 && Boolean(onSelectActivity);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.leftRow}>
          {venueImg ? (
            <Image source={{ uri: venueImg }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' },
              ]}
            >
              <Ionicons name={fallbackIcon} size={18} color={accentColor} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.overline, { color: theme.textMuted }]}>
              {overlineLabel}
            </Text>
            <Text style={[styles.venueName, { color: theme.textMain }]} numberOfLines={1}>
              {targetActivity?.name || 'Mon établissement'}
            </Text>
          </View>
        </View>

        {canSwitch && (
          <TouchableOpacity
            style={[
              styles.switchBtn,
              { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' },
            ]}
            onPress={() => setShowDropdown((prev) => !prev)}
            activeOpacity={0.75}
          >
            <Text style={[styles.switchBtnText, { color: accentColor }]}>Changer</Text>
            <Ionicons
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={accentColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && canSwitch && onSelectActivity && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {activities.map((act) => {
            const isCurrent = act._id === targetActivity?._id;
            return (
              <TouchableOpacity
                key={act._id}
                style={[
                  styles.optionRow,
                  isCurrent && { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' },
                ]}
                onPress={() => {
                  onSelectActivity(act);
                  setShowDropdown(false);
                }}
              >
                <Ionicons
                  name={isCurrent ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={isCurrent ? accentColor : theme.textMuted}
                />
                <Text
                  style={[
                    styles.optionName,
                    { color: theme.textMain, fontWeight: isCurrent ? '800' : '600' },
                  ]}
                  numberOfLines={1}
                >
                  {act.name} ({act.city})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  venueName: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  optionName: {
    fontSize: 12.5,
    flex: 1,
  },
});
