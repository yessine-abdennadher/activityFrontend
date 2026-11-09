import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { PartnerTier } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { getPartnerTierBadge, IconName } from './adminBadges';

interface PartnerTierModalProps {
  visible: boolean;
  partner: {
    _id: string;
    name: string;
    email: string;
    establishmentName?: string;
    partnerTier?: PartnerTier;
  } | null;
  onClose: () => void;
  onSaveTier: (partnerId: string, newTier: PartnerTier) => Promise<void>;
}

interface TierPlanConfig {
  id: PartnerTier;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: IconName;
  description: string;
  features: Array<{ text: string; included: boolean }>;
}

const TIER_PLANS: TierPlanConfig[] = [
  {
    id: 'standard',
    title: 'Partenaire Standard',
    badge: 'STANDARD',
    badgeColor: '#475569',
    badgeBg: '#F1F5F9',
    icon: 'business-outline',
    description: "Présence gratuite de base dans l'annuaire touristique ActivityTN",
    features: [
      { text: 'Fiche établissement complète (adresse, photos, horaires)', included: true },
      { text: 'Contact direct WhatsApp & appel téléphonique sans commission', included: true },
      { text: 'Réception des avis & notes certifiés des clients', included: true },
      { text: "Bouton lumière garantie en cas d'alerte électricité", included: true },
      { text: 'Création de promotions et réductions exclusives %', included: false },
      { text: 'Diffusion de soirées musicales & événements en direct', included: false },
      { text: 'Mise en tête d\'affiche prioritaire "À la une"', included: false },
    ],
  },
  {
    id: 'pro',
    title: 'Partenaire Pro',
    badge: 'PRO',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    icon: 'star',
    description: 'Accélérez votre fréquentation avec les promotions et bons plans',
    features: [
      { text: 'Tous les avantages du compte Standard', included: true },
      { text: 'Création illimitée de promotions & réductions % ciblées', included: true },
      { text: 'Mise en avant dans la section dédiée "Bons Plans Partenaires"', included: true },
      { text: 'Badge officiel "Partenaire Vérifié" avec étoile dorée sur vos fiches', included: true },
      { text: 'Diffusion de soirées musicales & événements en direct', included: false },
      { text: 'Priorité absolue en tête d\'affiche "À la une"', included: false },
    ],
  },
  {
    id: 'premium',
    title: 'Partenaire Premium VIP',
    badge: 'VIP',
    badgeColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    icon: 'diamond',
    description: "Statut d'excellence haut de gamme : headliner, soirées live & impact maximal",
    features: [
      { text: 'Tous les avantages du compte Pro', included: true },
      { text: 'Organisation & diffusion de Soirées Live & Événements', included: true },
      { text: 'Priorité absolue en tête d\'affiche "À la une" sur la page d\'accueil', included: true },
      { text: 'Badge d\'excellence "Partenaire Officiel VIP"', included: true },
      { text: 'Notification push envoyée aux abonnés de la région', included: true },
      { text: 'Support partenaire dédié & statistiques avancées', included: true },
    ],
  },
];

export const PartnerTierModal: React.FC<PartnerTierModalProps> = ({
  visible,
  partner,
  onClose,
  onSaveTier,
}) => {
  const { theme, isDark, language } = usePreferences();
  const isRTL = language === 'ar';

  const [selectedTier, setSelectedTier] = useState<PartnerTier>('standard');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setSelectedTier(partner.partnerTier || 'standard');
    }
  }, [partner]);

  if (!partner) return null;

  const handleConfirm = async () => {
    try {
      setSaving(true);
      await onSaveTier(partner._id, selectedTier);
      onClose();
    } catch {
      // L'erreur est gérée dans l'écran parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title="Attribution du Palier Partenaire"
      subtitle={`${partner.establishmentName || partner.name} · ${partner.email}`}
      height="90%"
    >
      <View style={styles.modalContent}>
        {/* Liste des plans sélectionnables */}
        <View style={styles.planList}>
          {TIER_PLANS.map((plan) => {
            const isSelected = selectedTier === plan.id;
            const isCurrent = (partner.partnerTier || 'standard') === plan.id;
            const badgeConfig = getPartnerTierBadge(plan.id, isDark);

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.88}
                onPress={() => setSelectedTier(plan.id)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected ? badgeConfig.borderColor : theme.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {/* Bandeau d'en-tête du plan */}
                <View style={[styles.planHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.planHeaderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View
                      style={[
                        styles.planIconCircle,
                        {
                          backgroundColor: badgeConfig.backgroundColor,
                          borderColor: badgeConfig.borderColor,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Ionicons name={plan.icon} size={18} color={badgeConfig.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={[styles.planTitle, { color: theme.textMain }]}>{plan.title}</Text>
                        <View style={[styles.badgeTag, { backgroundColor: badgeConfig.backgroundColor, borderColor: badgeConfig.borderColor }]}>
                          <Text style={[styles.badgeTagText, { color: badgeConfig.color }]}>{plan.badge}</Text>
                        </View>
                        {isCurrent && (
                          <View style={[styles.currentPill, { backgroundColor: `${theme.primary}18` }]}>
                            <Text style={[styles.currentPillText, { color: theme.primary }]}>
                              Palier Actuel
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.planDesc, { color: theme.textMuted }]}>{plan.description}</Text>
                    </View>
                  </View>

                  {/* Radio circle */}
                  <View
                    style={[
                      styles.radioBox,
                      {
                        borderColor: isSelected ? badgeConfig.color : theme.textSub,
                        backgroundColor: isSelected ? badgeConfig.color : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </View>

                {/* Avantages du palier */}
                <View style={[styles.featuresList, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  {plan.features.map((feat, idx) => (
                    <View
                      key={idx}
                      style={[styles.featureItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                    >
                      <Ionicons
                        name={feat.included ? 'checkmark-circle' : 'close-circle'}
                        size={15}
                        color={feat.included ? '#10B981' : isDark ? '#475569' : '#CBD5E1'}
                        style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          {
                            color: feat.included
                              ? theme.textMain
                              : isDark
                              ? '#64748B'
                              : '#94A3B8',
                            fontWeight: feat.included ? '600' : '400',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {feat.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer actions */}
        <View style={[styles.footerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleConfirm}
            disabled={saving}
            activeOpacity={0.88}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Confirmer l'attribution</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  planList: {
    gap: 12,
    paddingVertical: 4,
  },
  planCard: {
    borderRadius: 18,
    padding: 14,
  },
  planHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planHeaderLeft: {
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  planIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  badgeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  currentPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  radioBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  featuresList: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    flex: 1,
  },
  footerRow: {
    marginTop: 18,
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
