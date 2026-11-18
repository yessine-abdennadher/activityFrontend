import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { PartnerActivityItem } from '../../types';

interface PartnerQuickActionsProps {
  activity: PartnerActivityItem | null;
  isPro: boolean;
  isPremium: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onEditPress: () => void;
  onPromoPress: () => void;
  onEventPress: () => void;
  onSharePress: () => void;
}

export const PartnerQuickActions: React.FC<PartnerQuickActionsProps> = ({
  activity,
  isPro,
  isPremium,
  theme,
  isDark,
  onEditPress,
  onPromoPress,
  onEventPress,
  onSharePress,
}) => {
  const hasPromo = Boolean(activity?.promotion?.isPromo);
  const hasEvent = Boolean(activity?.events && activity.events.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* 1. Modifier la Fiche */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <Ionicons name="create-outline" size={20} color="#4F46E5" />
          </View>
          <Text style={[styles.actionLabel, { color: theme.textMain }]} numberOfLines={1}>
            Modifier
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            Fiche & Infos
          </Text>
        </TouchableOpacity>

        {/* 2. Offre / Promo */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onPromoPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: hasPromo ? '#FEE2E2' : isDark ? '#3B1F04' : '#FEF3C7',
                borderColor: hasPromo ? '#FCA5A5' : '#FDE68A',
              },
            ]}
          >
            <Ionicons
              name={hasPromo ? 'pricetag' : 'pricetag-outline'}
              size={20}
              color={hasPromo ? '#DC2626' : '#D97706'}
            />
          </View>
          <Text
            style={[
              styles.actionLabel,
              { color: hasPromo ? '#DC2626' : theme.textMain },
            ]}
            numberOfLines={1}
          >
            {hasPromo ? `Promo -${activity?.promotion?.discountPercent}%` : 'Offre'}
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            {hasPromo ? 'En ligne' : 'Réduction'}
          </Text>
        </TouchableOpacity>

        {/* 3. Soirée / Événement Live */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onEventPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: hasEvent ? '#F3E8FF' : isDark ? '#2E1065' : '#FAF5FF',
                borderColor: hasEvent ? '#D8B4FE' : '#E9D5FF',
              },
            ]}
          >
            <Ionicons
              name={hasEvent ? 'musical-notes' : 'musical-notes-outline'}
              size={20}
              color={hasEvent ? '#9333EA' : '#7E22CE'}
            />
          </View>
          <Text
            style={[
              styles.actionLabel,
              { color: hasEvent ? '#9333EA' : theme.textMain },
            ]}
            numberOfLines={1}
          >
            {hasEvent ? 'Soirée' : 'Événement'}
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            {hasEvent ? 'Diffusée' : 'Concert, DJ'}
          </Text>
        </TouchableOpacity>

        {/* 4. Partager la fiche */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onSharePress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="share-social-outline" size={20} color="#059669" />
          </View>
          <Text style={[styles.actionLabel, { color: theme.textMain }]} numberOfLines={1}>
            Partager
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            Lien direct
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionSubText: {
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
});
