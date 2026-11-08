import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { WIN_COLORS } from '../../theme/colors';
import type { PartnerSubscriptionInfo } from '../../types';

interface SubscriptionBadgeProps {
  subscription: PartnerSubscriptionInfo;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ subscription }) => {
  const { tier, status, daysRemaining, isExpiringSoon } = subscription;

  if (tier === 'standard' && status !== 'pending_payment') {
    return (
      <View style={[styles.badge, styles.standardBadge]}>
        <Feather name="shield" size={13} color={WIN_COLORS.slate600} />
        <AppText style={styles.standardText} variant="caption" weight="bold">
          Pack Standard (Gratuit à vie)
        </AppText>
      </View>
    );
  }

  if (status === 'pending_payment') {
    return (
      <View style={[styles.badge, styles.pendingBadge]}>
        <Feather name="clock" size={13} color="#D97706" />
        <AppText style={styles.pendingText} variant="caption" weight="bold">
          Demande Pack {tier.toUpperCase()} : En attente validation paiement
        </AppText>
      </View>
    );
  }

  if (isExpiringSoon) {
    return (
      <View style={[styles.badge, styles.expiringBadge]}>
        <Feather name="alert-triangle" size={13} color="#EA580C" />
        <AppText style={styles.expiringText} variant="caption" weight="bold">
          Pack {tier.toUpperCase()} : Expire dans {daysRemaining} jour(s) — Renouveler
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.activeBadge]}>
      <Feather name="check-circle" size={13} color="#059669" />
      <AppText style={styles.activeText} variant="caption" weight="bold">
        Pack {tier.toUpperCase()} Actif ({daysRemaining} jours restants)
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  standardBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.25)',
  },
  standardText: {
    color: WIN_COLORS.slate600,
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  pendingText: {
    color: '#B45309',
  },
  expiringBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.35)',
  },
  expiringText: {
    color: '#EA580C',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  activeText: {
    color: '#059669',
  },
});
