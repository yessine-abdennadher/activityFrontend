import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { PartnerTier } from '../../types';
import { SwipeableModal } from '../ui/SwipeableModal';

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
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string, ...string[]];
  description: string;
  features: Array<{ text: string; included: boolean }>;
}

const TIER_PLANS: TierPlanConfig[] = [
  {
    id: 'standard',
    title: 'Standard (Base)',
    badge: 'STANDARD',
    badgeColor: '#475569',
    badgeBg: '#F1F5F9',
    icon: 'business-outline',
    gradient: ['#F8FAFC', '#E2E8F0'] as const,
    description: 'Présence gratuite de base dans l\'annuaire touristique ActivityTN',
    features: [
      { text: 'Fiche établissement complète (adresse, photos, horaires)', included: true },
      { text: 'Contact direct WhatsApp & appel téléphonique sans commission', included: true },
      { text: 'Réception des avis & notes certifiés des clients', included: true },
      { text: 'Bouton lumière garantie en cas d\'alerte électricité', included: true },
      { text: 'Création de promotions et réductions exclusives %', included: false },
      { text: 'Diffusion de soirées musicales & événements en direct', included: false },
      { text: 'Mise en tête d\'affiche prioritaire "À la une"', included: false },
    ],
  },
  {
    id: 'pro',
    title: 'Partenaire Pro ⭐',
    badge: 'PRO ⭐',
    badgeColor: '#EA580C',
    badgeBg: '#FFEDD5',
    icon: 'star',
    gradient: ['#FFF7ED', '#FED7AA'] as const,
    description: 'Accélérez votre fréquentation avec les promotions et bons plans',
    features: [
      { text: 'Tous les avantages du compte Standard', included: true },
      { text: 'Création illimitée de promotions & réductions % ciblées', included: true },
      { text: 'Mise en avant dans la section dédiée "Bons Plans Partenaires"', included: true },
      { text: 'Badge officiel "Partenaire Vérifié ⭐" sur vos fiches', included: true },
      { text: 'Diffusion de soirées musicales & événements en direct', included: false },
      { text: 'Priorité absolue en tête d\'affiche "À la une"', included: false },
    ],
  },
  {
    id: 'premium',
    title: 'Partenaire Premium 👑',
    badge: 'PREMIUM 👑',
    badgeColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    icon: 'diamond',
    gradient: ['#FAF5FF', '#DDD6FE'] as const,
    description: 'Statut d\'excellence : headliner, soirées live & impact maximal',
    features: [
      { text: 'Tous les avantages du compte Pro ⭐', included: true },
      { text: 'Organisation & diffusion de Soirées Live & Événements', included: true },
      { text: 'Priorité absolue en tête d\'affiche "À la une" sur la page d\'accueil', included: true },
      { text: 'Badge d\'excellence "Partenaire Officiel 👑"', included: true },
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
    <SwipeableModal
      visible={visible}
      onClose={onClose}
      height="88%"
      showHandle={true}
      disableInternalScroll={true}
    >
      <View style={styles.modalInner}>
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="ribbon-outline" size={24} color="#7C3AED" />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={[styles.title, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                Attribution du Palier Partenaire
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}
                numberOfLines={1}
              >
                {partner.establishmentName || partner.name} · {partner.email}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
            >
              <Ionicons name="close" size={20} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          {/* Liste des plans sélectionnables */}
          <ScrollView contentContainerStyle={styles.planList} showsVerticalScrollIndicator={false}>
            {TIER_PLANS.map((plan) => {
              const isSelected = selectedTier === plan.id;
              const isCurrent = (partner.partnerTier || 'standard') === plan.id;

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.88}
                  onPress={() => setSelectedTier(plan.id)}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isSelected
                        ? plan.id === 'premium'
                          ? '#8B5CF6'
                          : plan.id === 'pro'
                          ? '#F97316'
                          : theme.primary
                        : theme.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  {/* Bandeau d'en-tête du plan */}
                  <View style={[styles.planHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={styles.planHeaderLeft}>
                      <View
                        style={[
                          styles.planIconCircle,
                          {
                            backgroundColor:
                              plan.id === 'premium'
                                ? '#EDE9FE'
                                : plan.id === 'pro'
                                ? '#FFEDD5'
                                : '#F1F5F9',
                          },
                        ]}
                      >
                        <Ionicons
                          name={plan.icon}
                          size={18}
                          color={
                            plan.id === 'premium'
                              ? '#7C3AED'
                              : plan.id === 'pro'
                              ? '#EA580C'
                              : '#64748B'
                          }
                        />
                      </View>
                      <View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.planTitle, { color: theme.textMain }]}>{plan.title}</Text>
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
                          borderColor: isSelected ? plan.badgeColor : theme.textSub,
                          backgroundColor: isSelected ? plan.badgeColor : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </View>

                  {/* Avantages du palier */}
                  <View style={styles.featuresList}>
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
          </ScrollView>

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
      </SwipeableModal>
    );
  };

const styles = StyleSheet.create({
  modalInner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
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
    fontSize: 16,
    fontWeight: '800',
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
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
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
    marginTop: 16,
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
