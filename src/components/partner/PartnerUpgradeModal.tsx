import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { PartnerTier } from '../../types';
import { SwipeableModal } from '../ui/SwipeableModal';

interface PartnerUpgradeModalProps {
  visible: boolean;
  currentTier?: PartnerTier;
  targetTier?: 'pro' | 'premium';
  onClose: () => void;
}

interface TierDetail {
  id: PartnerTier;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  pitch: string;
  features: string[];
}

const TIERS: TierDetail[] = [
  {
    id: 'standard',
    title: 'Standard (Base)',
    badge: '🏢 STANDARD',
    badgeColor: '#475569',
    badgeBg: '#F1F5F9',
    icon: 'business',
    pitch: 'Présence essentielle dans l\'annuaire touristique ActivityTN',
    features: [
      'Fiche établissement avec photos & horaires',
      'Contact direct WhatsApp sans commission',
      'Avis & notations des visiteurs',
      'Bouton Lumière Garantie en alerte électricité',
    ],
  },
  {
    id: 'pro',
    title: 'Partenaire PRO ⭐',
    badge: '⭐ PRO',
    badgeColor: '#EA580C',
    badgeBg: '#FFEDD5',
    icon: 'star',
    pitch: 'Multipliez vos réservations grâce aux promotions exclusives %',
    features: [
      'Tout le forfait Standard inclus',
      'Création de promotions et remises exclusives %',
      'Mise en avant dans le carrousel "Bons Plans du Jour"',
      'Badge vérifié Partenaire PRO sur l\'application',
      'Statistiques avancées des consultations',
    ],
  },
  {
    id: 'premium',
    title: 'Partenaire PREMIUM 👑',
    badge: '👑 PREMIUM',
    badgeColor: '#9333EA',
    badgeBg: '#F3E8FF',
    icon: 'ribbon',
    pitch: 'La formule ultime : têtes d\'affiche & soirées live exclusives',
    features: [
      'Tous les avantages Standard & PRO inclus',
      'Publication de soirées & concerts live avec billetterie directe',
      'Positionnement prioritaire Top 1 en tête d\'affiche',
      'Notifications push envoyées aux visiteurs à proximité',
      'Support prioritaire dédié 7j/7 par l\'équipe ActivityTN',
    ],
  },
];

export const PartnerUpgradeModal: React.FC<PartnerUpgradeModalProps> = ({
  visible,
  currentTier = 'standard',
  targetTier = 'pro',
  onClose,
}) => {
  const { isDark, theme } = usePreferences();

  const activeTargetConfig = TIERS.find((t) => t.id === targetTier) || TIERS[1];

  const handleContactWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour l'équipe ActivityTN ! Je gère un établissement et je souhaite faire évoluer mon compte vers le statut ${targetTier.toUpperCase()} ⭐. Merci de m'indiquer la marche à suivre.`
    );
    Linking.openURL(`https://wa.me/21698123456?text=${text}`).catch(() => {
      // fallback
    });
  };

  const handleCall = () => {
    Linking.openURL('tel:+21674123456').catch(() => {
      // fallback
    });
  };

  return (
    <SwipeableModal
      visible={visible}
      onClose={onClose}
      height="88%"
      showHandle={true}
      disableInternalScroll={true}
    >
      <View style={styles.modalInner}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.targetBadge,
                    {
                      backgroundColor:
                        targetTier === 'premium' ? '#F3E8FF' : '#FFEDD5',
                      borderColor:
                        targetTier === 'premium' ? '#C084FC' : '#FDBA74',
                    },
                  ]}
                >
                  <Ionicons
                    name={targetTier === 'premium' ? 'ribbon' : 'star'}
                    size={13}
                    color={targetTier === 'premium' ? '#9333EA' : '#EA580C'}
                  />
                  <Text
                    style={[
                      styles.targetBadgeText,
                      { color: targetTier === 'premium' ? '#9333EA' : '#EA580C' },
                    ]}
                  >
                    PALIER {targetTier.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: theme.textMain }]}>
                {targetTier === 'premium'
                  ? 'Débloquez les Soirées Live & le Top 1'
                  : 'Débloquez les Promotions & Bons Plans'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                {activeTargetConfig.pitch}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Ionicons name="close" size={20} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Avantages Débloqués avec ce palier */}
            <View
              style={[
                styles.highlightsBox,
                {
                  backgroundColor:
                    targetTier === 'premium'
                      ? isDark
                        ? '#2E1065'
                        : '#FAF5FF'
                      : isDark
                      ? '#431407'
                      : '#FFF7ED',
                  borderColor:
                    targetTier === 'premium'
                      ? isDark
                        ? '#581C87'
                        : '#E9D5FF'
                      : isDark
                      ? '#7C2D12'
                      : '#FED7AA',
                },
              ]}
            >
              <Text
                style={[
                  styles.highlightsTitle,
                  {
                    color: targetTier === 'premium' ? '#A855F7' : '#F97316',
                  },
                ]}
              >
                Ce que vous gagnez avec le forfait {targetTier.toUpperCase()} :
              </Text>

              {activeTargetConfig.features.map((feat, idx) => (
                <View key={idx} style={styles.featRow}>
                  <View
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor:
                          targetTier === 'premium' ? '#9333EA' : '#EA580C',
                      },
                    ]}
                  >
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.featText, { color: theme.textMain }]}>
                    {feat}
                  </Text>
                </View>
              ))}
            </View>

            {/* Comparatif des 3 Formules */}
            <Text style={[styles.compareTitle, { color: theme.textMain }]}>
              Comparatif des formules Partenaire
            </Text>

            <View style={styles.tiersGrid}>
              {TIERS.map((tier) => {
                const isCurrent = tier.id === currentTier;
                const isTarget = tier.id === targetTier;
                return (
                  <View
                    key={tier.id}
                    style={[
                      styles.tierMiniCard,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isTarget
                          ? targetTier === 'premium'
                            ? '#9333EA'
                            : '#EA580C'
                          : isCurrent
                          ? theme.primary
                          : theme.cardBorder,
                        borderWidth: isTarget || isCurrent ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.tierMiniHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name={tier.icon} size={15} color={tier.badgeColor} />
                        <Text style={[styles.tierMiniTitle, { color: theme.textMain }]}>
                          {tier.title}
                        </Text>
                      </View>
                      {isCurrent && (
                        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>Actuel</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tierMiniPitch, { color: theme.textMuted }]}>
                      {tier.pitch}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Actions : Contact direct WhatsApp / Téléphone */}
          <View style={[styles.actionsFooter, { borderTopColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={handleContactWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>Demander à l'Admin (WhatsApp)</Text>
            </TouchableOpacity>

            <View style={styles.footerSecondaryRow}>
              <TouchableOpacity
                style={[styles.phoneBtn, { borderColor: theme.cardBorder }]}
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={15} color={theme.textMain} />
                <Text style={[styles.phoneBtnText, { color: theme.textMain }]}>
                  Appeler le Support
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeSecondaryBtn, { borderColor: theme.cardBorder }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeSecondaryBtnText, { color: theme.textMuted }]}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SwipeableModal>
    );
  };

const styles = StyleSheet.create({
  modalInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginVertical: 4,
  },
  highlightsBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  highlightsTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  tiersGrid: {
    gap: 8,
    marginBottom: 16,
  },
  tierMiniCard: {
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  tierMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierMiniTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierMiniPitch: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionsFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  phoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeSecondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
