import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { PartnerTier } from '../../types';

interface PartnerTierStatusCardProps {
  tier?: PartnerTier;
  onPressUpgrade: (target: 'pro' | 'premium') => void;
  onPressInfo: () => void;
}

export const PartnerTierStatusCard: React.FC<PartnerTierStatusCardProps> = ({
  tier = 'standard',
  onPressUpgrade,
  onPressInfo,
}) => {
  const { isDark, theme } = usePreferences();

  const isPro = tier === 'pro' || tier === 'premium';
  const isPremium = tier === 'premium';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: isPremium
            ? '#A855F7'
            : isPro
            ? '#F97316'
            : theme.cardBorder,
        },
      ]}
    >
      {/* Top row : Plan name & Badge */}
      <View style={styles.topRow}>
        <View style={styles.tierInfoCol}>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Votre statut partenaire
          </Text>
          <View style={styles.titleRow}>
            <Text style={[styles.tierTitle, { color: theme.textMain }]}>
              {isPremium
                ? 'Partenaire PREMIUM 👑'
                : isPro
                ? 'Partenaire PRO ⭐'
                : 'Partenaire STANDARD'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.badgePill,
            {
              backgroundColor: isPremium
                ? '#F3E8FF'
                : isPro
                ? '#FFEDD5'
                : isDark
                ? '#334155'
                : '#F1F5F9',
              borderColor: isPremium
                ? '#C084FC'
                : isPro
                ? '#FDBA74'
                : theme.cardBorder,
            },
          ]}
          onPress={onPressInfo}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Détails du niveau"
        >
          <Ionicons
            name={isPremium ? 'ribbon' : isPro ? 'star' : 'business'}
            size={12}
            color={isPremium ? '#9333EA' : isPro ? '#EA580C' : theme.textMuted}
          />
          <Text
            style={[
              styles.badgePillText,
              {
                color: isPremium
                  ? '#9333EA'
                  : isPro
                  ? '#EA580C'
                  : theme.textMuted,
              },
            ]}
          >
            {tier.toUpperCase()}
          </Text>
          <Ionicons name="information-circle-outline" size={13} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Stepper : Standard -> Pro -> Premium */}
      <View style={styles.stepperContainer}>
        {/* Step 1: Standard */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: '#10B981',
              },
            ]}
          >
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
          <Text style={[styles.stepLabel, { color: theme.textMain }]}>Standard</Text>
        </View>

        {/* Bar 1 */}
        <View
          style={[
            styles.stepBar,
            {
              backgroundColor: isPro ? '#EA580C' : isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        />

        {/* Step 2: Pro */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: isPro
                  ? '#EA580C'
                  : isDark
                  ? '#334155'
                  : '#CBD5E1',
              },
            ]}
          >
            {isPro ? (
              <Ionicons name="checkmark" size={11} color="#FFFFFF" />
            ) : (
              <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              {
                color: isPro ? '#EA580C' : theme.textMuted,
                fontWeight: isPro ? '700' : '500',
              },
            ]}
          >
            Pro ⭐
          </Text>
        </View>

        {/* Bar 2 */}
        <View
          style={[
            styles.stepBar,
            {
              backgroundColor: isPremium ? '#9333EA' : isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        />

        {/* Step 3: Premium */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: isPremium
                  ? '#9333EA'
                  : isDark
                  ? '#334155'
                  : '#CBD5E1',
              },
            ]}
          >
            {isPremium ? (
              <Ionicons name="checkmark" size={11} color="#FFFFFF" />
            ) : (
              <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              {
                color: isPremium ? '#9333EA' : theme.textMuted,
                fontWeight: isPremium ? '700' : '500',
              },
            ]}
          >
            Premium 👑
          </Text>
        </View>
      </View>

      {/* Privileges checklist badges */}
      <View style={styles.privilegesRow}>
        {/* Fiche & Contact */}
        <View
          style={[
            styles.privilegeItem,
            {
              backgroundColor: isDark ? '#064E3B20' : '#ECFDF5',
              borderColor: '#10B981',
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={[styles.privilegeText, { color: '#047857' }]}>
            Annuaire & WhatsApp
          </Text>
        </View>

        {/* Bons Plans % */}
        <TouchableOpacity
          onPress={() => !isPro && onPressUpgrade('pro')}
          style={[
            styles.privilegeItem,
            {
              backgroundColor: isPro
                ? isDark
                  ? '#7C2D1220'
                  : '#FFF7ED'
                : isDark
                ? '#1E293B'
                : '#F1F5F9',
              borderColor: isPro ? '#EA580C' : theme.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={isPro ? 'checkmark-circle' : 'lock-closed'}
            size={13}
            color={isPro ? '#EA580C' : theme.textMuted}
          />
          <Text
            style={[
              styles.privilegeText,
              { color: isPro ? '#C2410C' : theme.textMuted },
            ]}
          >
            Promos % {isPro ? 'Actif' : '(Pro)'}
          </Text>
        </TouchableOpacity>

        {/* Soirées Live */}
        <TouchableOpacity
          onPress={() => !isPremium && onPressUpgrade('premium')}
          style={[
            styles.privilegeItem,
            {
              backgroundColor: isPremium
                ? isDark
                  ? '#581C8720'
                  : '#FAF5FF'
                : isDark
                ? '#1E293B'
                : '#F1F5F9',
              borderColor: isPremium ? '#9333EA' : theme.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={isPremium ? 'checkmark-circle' : 'lock-closed'}
            size={13}
            color={isPremium ? '#9333EA' : theme.textMuted}
          />
          <Text
            style={[
              styles.privilegeText,
              { color: isPremium ? '#7E22CE' : theme.textMuted },
            ]}
          >
            Soirées Live {isPremium ? 'Actif' : '(VIP)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upgrade CTA banner if not premium */}
      {!isPremium && (
        <TouchableOpacity
          style={[
            styles.upgradeCtaBtn,
            {
              backgroundColor: !isPro ? '#EA580C' : '#9333EA',
            },
          ]}
          onPress={() => onPressUpgrade(!isPro ? 'pro' : 'premium')}
          activeOpacity={0.85}
        >
          <Ionicons
            name={!isPro ? 'flash' : 'ribbon'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.upgradeCtaText}>
            {!isPro
              ? 'Passer au Forfait PRO (Promotions & Bons Plans) 🚀'
              : 'Passer au Forfait PREMIUM (Soirées Live & Top 1) 👑'}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierInfoCol: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepBar: {
    flex: 1,
    height: 3,
    marginHorizontal: 8,
    borderRadius: 2,
    marginBottom: 16,
  },
  privilegesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  privilegeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  upgradeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  upgradeCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
});
